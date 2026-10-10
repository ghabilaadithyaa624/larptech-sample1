/**
 * Centralised environment configuration and validation.
 *
 * Purpose:
 *   - Parse and validate every environment variable the API depends on, once, at boot.
 *   - Fail loudly and immediately on invalid configuration instead of degrading silently
 *     at request time (the previous behaviour: an unset FRONTEND_ORIGIN silently became
 *     "http://localhost:3000", which blocks every production form submission via CORS
 *     with no server-side signal).
 *   - Never log or expose secret values.
 *
 * This module is intentionally pure: `validateEnv(raw)` has no side effects so it can be
 * unit tested with synthetic environments. `getConfig()` memoises the real process.env.
 */

export type NodeEnv = "production" | "development" | "test";

export type RateLimitRule = {
  /** Length of the fixed window in milliseconds. */
  windowMs: number;
  /** Maximum requests permitted per key within one window. */
  max: number;
};

export type AppConfig = {
  nodeEnv: NodeEnv;
  isProduction: boolean;
  port: number;

  databaseUrl: string;

  /** Path to a PEM root CA bundle. Only needed for a private CA; public CAs are trusted by Node. */
  databaseSslCaFile: string | undefined;

  /** Maximum pooled PostgreSQL connections. Neon free tiers allow very few. */
  databasePoolMax: number;
  connectionTimeoutMs: number;
  idleTimeoutMillis: number;
  /** Server-side guard so a runaway query cannot hold a connection forever. */
  statementTimeoutMs: number;

  /** Exact origins permitted by CORS. Vercel preview URLs are supported via the extra list. */
  allowedOrigins: string[];

  /**
   * Number of reverse-proxy hops to trust when resolving the client IP.
   * Render terminates TLS at its own edge and forwards once, so 1 is correct there.
   * 0 disables proxy trust (correct for a directly exposed local server).
   */
  trustProxyHops: number;

  resendApiKey: string | undefined;
  emailFrom: string;
  leadInboxEmail: string;

  /** Maximum accepted JSON request body, expressed for express.json(). */
  jsonBodyLimit: string;

  rateLimits: {
    leads: RateLimitRule;
    waitlist: RateLimitRule;
    health: RateLimitRule;
    default: RateLimitRule;
  };

  /**
   * Set `RATE_LIMIT_DISABLED=1` to bypass all rate limiting.
   * Only honoured outside production; intended for local development and load testing.
   */
  rateLimitDisabled: boolean;

  requestTimeoutMs: number;
  headersTimeoutMs: number;
  keepAliveTimeoutMs: number;

  logLevel: "debug" | "info" | "warn" | "error";
  /**
   * How long a repeat lead from the same address and service is treated as the same
   * enquiry rather than a new row. 0 disables de-duplication entirely.
   */
  leadDedupeWindowMinutes: number;
  /** Bound on the whole Resend request, including connection setup. */
  resendTimeoutMs: number;
  outboxPollMs: number;
  outboxBatchSize: number;
  /** How long a claimed notification may stay unconfirmed before another tick reclaims it. */
  outboxLeaseMs: number;
  outboxEnabled: boolean;
};

/** Variables whose values must never be written to a log line, in whole or in part. */
export const SECRET_ENV_KEYS = [
  "DATABASE_URL",
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "LEAD_INBOX_EMAIL",
] as const;

export class ConfigError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(
      `Invalid environment configuration:\n${issues.map((i) => `  - ${i}`).join("\n")}`,
    );
    this.name = "ConfigError";
    this.issues = issues;
  }
}

function parseNodeEnv(raw: string | undefined, issues: string[]): NodeEnv {
  if (raw === undefined || raw === "") return "development";
  if (raw === "production" || raw === "development" || raw === "test") return raw;
  issues.push(`NODE_ENV must be one of production|development|test (received "${raw}")`);
  return "development";
}

function parsePort(raw: string | undefined, issues: string[]): number {
  if (raw === undefined || raw.trim() === "") return 4000;
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    issues.push(`PORT must be an integer between 1 and 65535 (received "${raw}")`);
    return 4000;
  }
  return port;
}

function parsePositiveInt(
  name: string,
  raw: string | undefined,
  fallback: number,
  issues: string[],
): number {
  if (raw === undefined || raw.trim() === "") return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) {
    issues.push(`${name} must be a positive integer (received "${raw}")`);
    return fallback;
  }
  return value;
}

/**
 * Parse an integer that must be zero or greater.
 *
 * Unlike `parsePositiveInt`, zero is meaningful here — it is how the lead de-duplication
 * window is switched off.
 */
function parseNonNegativeInt(
  name: string,
  raw: string | undefined,
  fallback: number,
  issues: string[],
): number {
  if (raw === undefined || raw.trim() === "") return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) {
    issues.push(`${name} must be an integer of 0 or greater (received "${raw}")`);
    return fallback;
  }
  return value;
}

/**
 * Parse a comma separated list of browser origins.
 *
 * Rejects anything that is not an absolute http(s) origin: CORS matching is exact string
 * comparison against the `Origin` header, so a value with a path, trailing slash or wrong
 * scheme would silently never match and block all submissions.
 */
function parseOriginList(raw: string | undefined, issues: string[]): string[] {
  const collected: string[] = [];

  for (const entry of (raw ?? "").split(",")) {
    const trimmed = entry.trim();
    if (trimmed === "") continue;

    let url: URL;
    try {
      url = new URL(trimmed);
    } catch {
      issues.push(`FRONTEND_ORIGIN entry "${trimmed}" is not a valid absolute URL`);
      continue;
    }

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      issues.push(`FRONTEND_ORIGIN entry "${trimmed}" must use http or https`);
      continue;
    }
    if (url.pathname !== "/" || url.search !== "" || url.hash !== "") {
      issues.push(
        `FRONTEND_ORIGIN entry "${trimmed}" must be a bare origin with no path, query or fragment`,
      );
      continue;
    }

    const origin = url.origin;
    if (!collected.includes(origin)) collected.push(origin);
  }

  return collected;
}

function parseRateLimit(
  prefix: string,
  raw: NodeJS.ProcessEnv,
  defaults: RateLimitRule,
  issues: string[],
): RateLimitRule {
  return {
    max: parsePositiveInt(
      `${prefix}_MAX`,
      raw[`${prefix}_MAX`],
      defaults.max,
      issues,
    ),
    windowMs: parsePositiveInt(
      `${prefix}_WINDOW_MS`,
      raw[`${prefix}_WINDOW_MS`],
      defaults.windowMs,
      issues,
    ),
  };
}

function parseLogLevel(
  raw: string | undefined,
  issues: string[],
): AppConfig["logLevel"] {
  if (raw === undefined || raw === "") return "info";
  if (raw === "debug" || raw === "info" || raw === "warn" || raw === "error") return raw;
  issues.push(`LOG_LEVEL must be one of debug|info|warn|error (received "${raw}")`);
  return "info";
}

const DEFAULT_RATE_LIMITS = {
  /**
   * A real person needs a handful of attempts: a validation error, a correction, maybe a
   * double-submit. 10 per 15 minutes absorbs that plus several colleagues behind one NAT
   * egress IP, while still stopping the scripted floods this is actually defending against
   * (a loop generates thousands). Tune per deployment with RATE_LIMIT_LEADS_MAX.
   */
  leads: { windowMs: 15 * 60_000, max: 10 },
  waitlist: { windowMs: 15 * 60_000, max: 10 },
  /** Render polls this; keep it generous so a blip never restarts the instance. */
  health: { windowMs: 60_000, max: 120 },
  default: { windowMs: 15 * 60_000, max: 100 },
} satisfies Record<string, RateLimitRule>;

/**
 * Validate a raw environment object and return the resulting configuration.
 * Throws {@link ConfigError} listing every problem found (not just the first).
 */
export function validateEnv(raw: NodeJS.ProcessEnv): AppConfig {
  const issues: string[] = [];

  const nodeEnv = parseNodeEnv(raw.NODE_ENV, issues);
  const isProduction = nodeEnv === "production";

  const databaseUrl = (raw.DATABASE_URL ?? "").trim();
  if (databaseUrl === "") {
    issues.push("DATABASE_URL is required");
  } else {
    try {
      const parsed = new URL(databaseUrl);
      if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
        issues.push(
          `DATABASE_URL must use the postgres: or postgresql: scheme (received "${parsed.protocol}")`,
        );
      }
    } catch {
      issues.push("DATABASE_URL is not a valid connection URL");
    }
  }

  const allowedOrigins = parseOriginList(raw.FRONTEND_ORIGIN, issues);

  if (isProduction) {
    if (allowedOrigins.length === 0) {
      issues.push(
        "FRONTEND_ORIGIN is required in production — without it CORS blocks every browser form submission",
      );
    }
    for (const origin of allowedOrigins) {
      const host = new URL(origin).hostname;
      if (host === "localhost" || host === "127.0.0.1" || host === "::1") {
        issues.push(
          `FRONTEND_ORIGIN must not be a loopback address in production (received "${origin}")`,
        );
      }
    }
  }

  const trustProxyHops = (() => {
    const rawHops = raw.TRUST_PROXY_HOPS;
    if (rawHops === undefined || rawHops.trim() === "") return isProduction ? 1 : 0;
    const hops = Number(rawHops);
    if (!Number.isInteger(hops) || hops < 0 || hops > 16) {
      issues.push(`TRUST_PROXY_HOPS must be an integer between 0 and 16 (received "${rawHops}")`);
      return isProduction ? 1 : 0;
    }
    return hops;
  })();

  const rateLimitDisabled = raw.RATE_LIMIT_DISABLED === "1" || raw.RATE_LIMIT_DISABLED === "true";
  if (rateLimitDisabled && isProduction) {
    issues.push("RATE_LIMIT_DISABLED is not permitted in production");
  }

  // Every remaining value must be parsed BEFORE the throw below. Parsing records into
  // `issues`, so anything parsed after the guard would collect a problem and then silently
  // discard it, returning a config built from fallback defaults.
  const port = parsePort(raw.PORT, issues);
  const databasePoolMax = parsePositiveInt("DATABASE_POOL_MAX", raw.DATABASE_POOL_MAX, 10, issues);
  const connectionTimeoutMs = parsePositiveInt(
    "DATABASE_CONNECTION_TIMEOUT_MS",
    raw.DATABASE_CONNECTION_TIMEOUT_MS,
    10_000,
    issues,
  );
  const idleTimeoutMillis = parsePositiveInt(
    "DATABASE_IDLE_TIMEOUT_MS",
    raw.DATABASE_IDLE_TIMEOUT_MS,
    30_000,
    issues,
  );
  const statementTimeoutMs = parsePositiveInt(
    "DATABASE_STATEMENT_TIMEOUT_MS",
    raw.DATABASE_STATEMENT_TIMEOUT_MS,
    30_000,
    issues,
  );
  const rateLimits = {
    leads: parseRateLimit("RATE_LIMIT_LEADS", raw, DEFAULT_RATE_LIMITS.leads, issues),
    waitlist: parseRateLimit("RATE_LIMIT_WAITLIST", raw, DEFAULT_RATE_LIMITS.waitlist, issues),
    health: parseRateLimit("RATE_LIMIT_HEALTH", raw, DEFAULT_RATE_LIMITS.health, issues),
    default: parseRateLimit("RATE_LIMIT_DEFAULT", raw, DEFAULT_RATE_LIMITS.default, issues),
  };
  const requestTimeoutMs = parsePositiveInt(
    "REQUEST_TIMEOUT_MS",
    raw.REQUEST_TIMEOUT_MS,
    30_000,
    issues,
  );
  const headersTimeoutMs = parsePositiveInt(
    "HEADERS_TIMEOUT_MS",
    raw.HEADERS_TIMEOUT_MS,
    20_000,
    issues,
  );
  const keepAliveTimeoutMs = parsePositiveInt(
    "KEEP_ALIVE_TIMEOUT_MS",
    raw.KEEP_ALIVE_TIMEOUT_MS,
    5_000,
    issues,
  );
  const resendTimeoutMs = parsePositiveInt("RESEND_TIMEOUT_MS", raw.RESEND_TIMEOUT_MS, 5_000, issues);
  const outboxPollMs = parsePositiveInt("OUTBOX_POLL_MS", raw.OUTBOX_POLL_MS, 3_000, issues);
  const outboxBatchSize = parsePositiveInt("OUTBOX_BATCH_SIZE", raw.OUTBOX_BATCH_SIZE, 5, issues);
  const outboxLeaseMs = parsePositiveInt("OUTBOX_LEASE_MS", raw.OUTBOX_LEASE_MS, 60_000, issues);
  const outboxEnabled = raw.OUTBOX_ENABLED !== "0";

  const logLevel = parseLogLevel(raw.LOG_LEVEL, issues);
  const leadDedupeWindowMinutes = parseNonNegativeInt(
    "LEAD_DEDUPE_WINDOW_MINUTES",
    raw.LEAD_DEDUPE_WINDOW_MINUTES,
    10,
    issues,
  );

  if (issues.length > 0) throw new ConfigError(issues);

  return {
    nodeEnv,
    isProduction,
    port,
    databaseUrl,
    databaseSslCaFile: raw.DATABASE_SSL_CA_FILE?.trim() || undefined,
    databasePoolMax,
    connectionTimeoutMs,
    idleTimeoutMillis,
    statementTimeoutMs,
    allowedOrigins,
    trustProxyHops,
    resendApiKey: raw.RESEND_API_KEY?.trim() || undefined,
    emailFrom: raw.EMAIL_FROM?.trim() || "LarpTech Leads <leads@larptech.io>",
    leadInboxEmail: raw.LEAD_INBOX_EMAIL?.trim() || "team@larptech.io",
    jsonBodyLimit: raw.JSON_BODY_LIMIT?.trim() || "16kb",
    rateLimits,
    rateLimitDisabled: rateLimitDisabled && !isProduction,
    requestTimeoutMs,
    headersTimeoutMs,
    keepAliveTimeoutMs,
    logLevel,
    leadDedupeWindowMinutes,
    resendTimeoutMs,
    outboxPollMs,
    outboxBatchSize,
    outboxLeaseMs,
    outboxEnabled,
  };
}

let cached: AppConfig | undefined;

/**
 * Load and memoise configuration from the real process environment.
 *
 * Callers must ensure `dotenv` has already loaded `.env` — `src/index.ts` imports
 * `dotenv/config` before anything imports this module.
 */
export function getConfig(): AppConfig {
  if (cached === undefined) {
    const config = validateEnv(process.env);
    if (config.isProduction && config.resendApiKey === undefined) {
      // Not fatal: leads are persisted regardless, so the site keeps working. But without
      // this key nobody is ever notified, which is a silent business failure — warn loudly.
      // eslint-disable-next-line no-console
      console.warn(
        "[config] RESEND_API_KEY is not set in production — leads will be stored but no notification email will be sent.",
      );
    }
    cached = config;
  }
  return cached;
}

/** Test helper: drop the memoised config so the next getConfig() revalidates. */
export function resetConfigCache(): void {
  cached = undefined;
}

/**
 * Render a configuration summary that is safe to log: names and shapes only, never values
 * of anything that could be a credential.
 */
export function describeConfig(config: AppConfig): Record<string, unknown> {
  return {
    nodeEnv: config.nodeEnv,
    port: config.port,
    databaseHost: (() => {
      try {
        return new URL(config.databaseUrl).host;
      } catch {
        return "<unparseable>";
      }
    })(),
    allowedOriginCount: config.allowedOrigins.length,
    trustProxyHops: config.trustProxyHops,
    databaseSslCaFileConfigured: config.databaseSslCaFile !== undefined,
    databasePoolMax: config.databasePoolMax,
    statementTimeoutMs: config.statementTimeoutMs,
    resendConfigured: config.resendApiKey !== undefined,
    rateLimitDisabled: config.rateLimitDisabled,
    rateLimits: config.rateLimits,
    jsonBodyLimit: config.jsonBodyLimit,
    requestTimeoutMs: config.requestTimeoutMs,
  };
}
