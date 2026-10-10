/**
 * Express application factory.
 *
 * Extracted from `src/index.ts` so tests can build an isolated app with synthetic config
 * and a fresh rate-limit store. `src/index.ts` is now only responsible for listening.
 *
 * Middleware order matters and is deliberate:
 *   1. trust proxy        — must precede anything that reads req.ip (rate limiting).
 *   2. request id         — so every later log line and error response is correlatable.
 *   3. security headers   — applied to every response, including errors.
 *   4. CORS               — reject disallowed origins before doing any work.
 *   5. JSON body parser   — bounded, and the only parser mounted (see note below).
 *   6. per-route limits   — before the handler, so an abuser never reaches the database.
 *   7. routes
 *   8. 404 then error     — the error handler must be registered last.
 */

import cors from "cors";
import express, { type Express, type NextFunction, type Request, type Response } from "express";
import { getConfig, type AppConfig } from "./lib/env";
import { logger } from "./lib/logger";
import { errorHandler, notFoundHandler, requestIdMiddleware } from "./lib/httpErrors";
import {
  MemoryRateLimitStore,
  rateLimit,
  type RateLimitStore,
} from "./lib/rateLimit";
import healthRouter from "./routes/health";
import leadsRouter from "./routes/leads";
import waitlistRouter from "./routes/waitlist";

export type AppDeps = {
  config: AppConfig;
  rateLimitStore: RateLimitStore;
};

/**
 * Baseline hardening headers.
 *
 * This service is a JSON API consumed cross-origin by the Next.js site; it serves no HTML,
 * no frames and no user-controlled assets, so a maximally restrictive policy is correct and
 * costs nothing. Hand-rolled rather than pulling in `helmet`, keeping the dependency
 * surface minimal for ~15 lines of header setting.
 */
function securityHeaders(isProduction: boolean) {
  return function securityHeadersMiddleware(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
    res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
    );

    // Only meaningful and only safe over HTTPS, so production only.
    if (isProduction) {
      res.setHeader("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
    }

    next();
  };
}

export function createApp({ config, rateLimitStore }: AppDeps): Express {
  const app = express();

  // Do not advertise the framework version.
  app.disable("x-powered-by");

  // Resolve the client IP through the deployment's edge proxy. Without this, every request
  // appears to come from the proxy and all clients collapse into one rate-limit bucket.
  // Express treats `false` as "do not trust X-Forwarded-For", which is what 0 hops means.
  app.set("trust proxy", config.trustProxyHops > 0 ? config.trustProxyHops : false);

  if (config.isProduction && config.trustProxyHops === 0) {
    logger.warn("trust_proxy_disabled_in_production", {
      consequence: "all clients share one rate-limit bucket",
    });
  }

  app.use(requestIdMiddleware);
  app.use(securityHeaders(config.isProduction));

  app.use(
    cors({
      origin: (origin, callback) => {
        // Requests with no Origin header (curl, server-to-server, Render health checks)
        // are allowed: CORS is a browser protection and there is no cookie or credential
        // here to protect. This preserves the previous behaviour for non-browser callers.
        if (origin === undefined || config.allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        // Reject with `false` rather than an Error: an Error would fall through to the
        // error handler and produce a 500 (and, when NODE_ENV !== production, a stack
        // trace) for what is really a 403-shaped condition.
        callback(null, false);
      },
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "X-Request-Id"],
      // No cookies, sessions or credentials are used anywhere in this API.
      credentials: false,
      maxAge: 600,
    }),
  );

  // Bounded JSON body parsing. The largest valid payload is ~2.5 KB (message is capped at
  // 2000 chars), so 16 KB leaves generous headroom for encoding expansion.
  //
  // `express.urlencoded` is intentionally NOT mounted. No route consumes form-encoded
  // bodies — both public endpoints read JSON — and removing it eliminates the `qs` parser
  // from the production request path entirely.
  app.use(express.json({ limit: config.jsonBodyLimit }));

  const limiter = (name: "leads" | "waitlist" | "health" | "default") =>
    rateLimit({ name, rule: config.rateLimits[name], store: rateLimitStore });

  if (config.rateLimitDisabled) {
    logger.warn("rate_limiting_disabled", { reason: "RATE_LIMIT_DISABLED is set" });
  }

  app.use("/api/health", limiter("health"), healthRouter);
  app.use("/api/leads", limiter("leads"), leadsRouter);
  app.use("/api/waitlist", limiter("waitlist"), waitlistRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

/**
 * Build an app from the process environment.
 *
 * Note on dependency injection: `createApp` takes its config explicitly, but the route
 * modules import the `db` singleton, which resolves its own config via `getConfig()`. In
 * practice `index.ts` validates the environment before calling this, so both paths see the
 * same values. Tests that need the app without a real database still need `DATABASE_URL`
 * set, because importing the routes imports the pool (the pool itself is lazy and will not
 * connect until a query runs). Tightening this is deferred to the testing batch.
 */
export function createAppFromEnv(): Express {
  return createApp({ config: getConfig(), rateLimitStore: new MemoryRateLimitStore() });
}
