/**
 * Fixed-window rate limiting keyed on the resolved client IP.
 *
 * Why this exists:
 *   POST /api/leads and POST /api/waitlist are unauthenticated and publicly reachable.
 *   Unthrottled, a trivial `curl` loop can (a) flood the leads table so real enquiries are
 *   buried, and (b) burn the Resend quota, because every stored lead triggers an email.
 *
 * Design decisions and their trade-offs — read before operating this in production:
 *
 *  1. STORE IS IN-PROCESS MEMORY. The counters live in a Map inside this Node process.
 *     Consequences:
 *       - Counters reset on restart or redeploy.
 *       - With N instances, the effective ceiling is N x max, because each instance keeps
 *         its own Map.
 *       - An attacker rotating source addresses (IPv6, botnet, proxies) is not bounded.
 *     This is acceptable for a single-instance Render service and is a large improvement
 *     over no limiting at all. If the service is ever scaled out, replace the store with a
 *     shared backend (Postgres table or Redis) — `RateLimitStore` is the seam for that.
 *
 *  2. THE KEY IS THE CLIENT IP, AND THAT IS ONLY MEANINGFUL IF `trust proxy` IS SET
 *     CORRECTLY. Behind Render's edge the socket address is always the proxy, so without
 *     trust every client would share one bucket and the first visitor would lock out
 *     everyone else. See TRUST_PROXY_HOPS in env.ts. Set it to the exact hop count —
 *     over-trusting lets a client forge X-Forwarded-For.
 *
 *  3. IPv6 keys are grouped by /64 rather than per address. A single host typically gets a
 *     whole /64, so per-address limits are trivially evaded by rotating within the prefix
 *     while shared-NAT users are penalised. /64 is the standard compromise.
 *
 *  4. Fail-open on internal error. If the limiter itself throws, the request is allowed
 *     through and the failure is logged. Losing leads to a bug in the limiter would be a
 *     worse outcome than admitting a burst.
 */

import type { NextFunction, Request, Response } from "express";
import type { RateLimitRule } from "./env";
import { logger } from "./logger";

export type RateLimitDecision = {
  allowed: boolean;
  limit: number;
  remaining: number;
  /** Epoch milliseconds at which the current window rolls over. */
  resetAt: number;
  retryAfterSeconds: number;
};

export interface RateLimitStore {
  /** Record a hit against `key` and report whether it is within budget. */
  consume(key: string, rule: RateLimitRule, now: number): RateLimitDecision;
}

type Window = { count: number; resetAt: number };

/**
 * In-process fixed-window store.
 *
 * Expired windows are evicted opportunistically on access and periodically by a sweeper
 * that is `unref()`ed so it never keeps the process alive during tests or shutdown.
 */
export class MemoryRateLimitStore implements RateLimitStore {
  private readonly windows = new Map<string, Window>();
  private readonly sweepTimer: NodeJS.Timeout;

  constructor(private readonly sweepIntervalMs = 60_000) {
    this.sweepTimer = setInterval(() => this.sweep(Date.now()), this.sweepIntervalMs);
    this.sweepTimer.unref?.();
  }

  consume(key: string, rule: RateLimitRule, now: number): RateLimitDecision {
    const existing = this.windows.get(key);

    if (existing === undefined || now >= existing.resetAt) {
      const fresh: Window = { count: 1, resetAt: now + rule.windowMs };
      this.windows.set(key, fresh);
      return this.decide(fresh, rule, now);
    }

    existing.count += 1;
    return this.decide(existing, rule, now);
  }

  private decide(window: Window, rule: RateLimitRule, now: number): RateLimitDecision {
    const allowed = window.count <= rule.max;
    const retryAfterSeconds = Math.max(1, Math.ceil((window.resetAt - now) / 1000));
    return {
      allowed,
      limit: rule.max,
      remaining: Math.max(0, rule.max - window.count),
      resetAt: window.resetAt,
      retryAfterSeconds,
    };
  }

  private sweep(now: number): void {
    for (const [key, window] of this.windows) {
      if (now >= window.resetAt) this.windows.delete(key);
    }
  }

  /** Test/ops helper. */
  get size(): number {
    return this.windows.size;
  }

  clear(): void {
    this.windows.clear();
  }

  stop(): void {
    clearInterval(this.sweepTimer);
  }
}

/**
 * Resolve the client IP for rate-limit keying.
 *
 * `req.ip` already applies Express's `trust proxy` setting, so this only has to normalise
 * the result. Returns "unknown" when nothing can be determined — a single shared bucket,
 * which is the safe default (over-limiting rather than under-limiting).
 */
export function resolveClientIp(req: Request): string {
  const raw = req.ip ?? req.socket?.remoteAddress ?? "";
  const ip = raw.trim();
  if (ip === "") return "unknown";

  // Normalise IPv4-mapped IPv6 (::ffff:203.0.113.7 -> 203.0.113.7).
  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(ip);
  if (mapped !== null) return mapped[1];
  if (ip === "::1") return "127.0.0.1";

  // Group IPv6 by /64: see design note 3.
  if (ip.includes(":") && !ip.startsWith("::ffff:")) {
    const groups = ip.replace(/^\[|\]$/g, "").split(":").filter((g) => g !== "");
    if (groups.length >= 4) return `${groups.slice(0, 4).join(":")}::/64`;
    return ip;
  }

  return ip;
}

export type RateLimitOptions = {
  /** Stable name used in logs and in the RateLimit-Policy header. */
  name: string;
  rule: RateLimitRule;
  store: RateLimitStore;
  keyFn?: (req: Request) => string;
};

/**
 * Build a rate-limiting middleware for one endpoint.
 *
 * On rejection: HTTP 429 with `Retry-After` (seconds) and `RateLimit-*` headers, in the
 * same JSON error envelope as every other error.
 */
export function rateLimit(options: RateLimitOptions) {
  const { name, rule, store } = options;
  const keyFn = options.keyFn ?? resolveClientIp;

  return function rateLimitMiddleware(req: Request, res: Response, next: NextFunction): void {
    let decision: RateLimitDecision;

    try {
      decision = store.consume(`${name}:${keyFn(req)}`, rule, Date.now());
    } catch (err) {
      // Fail open: see design note 4.
      logger.error("rate_limit_error", { endpoint: name, err });
      next();
      return;
    }

    if (!decision.allowed) {
      logger.warn("rate_limit_exceeded", {
        endpoint: name,
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
        limit: decision.limit,
        retryAfterSeconds: decision.retryAfterSeconds,
      });

      res.setHeader("Retry-After", String(decision.retryAfterSeconds));
      res.setHeader("RateLimit-Limit", String(decision.limit));
      res.setHeader("RateLimit-Remaining", "0");
      res.setHeader("RateLimit-Reset", String(decision.retryAfterSeconds));

      res.status(429).json({
        error: {
          code: "rate_limited",
          message: `Too many requests. Please wait ${decision.retryAfterSeconds} second(s) and try again.`,
          requestId: req.requestId ?? "unknown",
        },
      });
      return;
    }

    res.setHeader("RateLimit-Limit", String(decision.limit));
    res.setHeader("RateLimit-Remaining", String(decision.remaining));
    res.setHeader(
      "RateLimit-Reset",
      String(Math.max(0, Math.ceil((decision.resetAt - Date.now()) / 1000))),
    );

    next();
  };
}
