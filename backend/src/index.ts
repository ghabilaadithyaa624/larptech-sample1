import "dotenv/config";

import { DatabaseConfigError } from "./db/tls";
import { ConfigError, describeConfig, getConfig, type AppConfig } from "./lib/env";
import { logger, registerSecretValue, setLogLevel } from "./lib/logger";
import type { Express } from "express";

// Redact credentials before anything else can log them. `logger` masks these literal values
// wherever they appear, including inside a nested database error string.
registerSecretValue(process.env.DATABASE_URL);
registerSecretValue(process.env.RESEND_API_KEY);

// LOG_LEVEL is read directly rather than through getConfig() so that logging is configured
// before configuration is validated — otherwise a config error could not be logged at all.
const rawLogLevel = process.env.LOG_LEVEL;
if (
  rawLogLevel === "debug" ||
  rawLogLevel === "info" ||
  rawLogLevel === "warn" ||
  rawLogLevel === "error"
) {
  setLogLevel(rawLogLevel);
}

/**
 * Validate configuration, then load the route graph.
 *
 * `./app` is loaded with `require` rather than a static `import` for two reasons:
 *   - A static import is hoisted, so it would run before this function body. The route graph
 *     constructs the database pool at import time, so a database misconfiguration would
 *     surface as an unhandled exception with a stack trace before any validation ran.
 *   - Keeping the `require` inside the `try` means *both* environment and database
 *     configuration failures are reported as an actionable list instead.
 */
function bootstrap(): { app: Express; config: AppConfig } {
  try {
    const config = getConfig();
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    const { createAppFromEnv } = require("./app") as typeof import("./app");
    return { app: createAppFromEnv(), config };
  } catch (err) {
    // Both are operator-facing startup failures. Printed as plain text on purpose: far more
    // readable in `render logs` than a JSON line or a stack trace.
    if (err instanceof ConfigError || err instanceof DatabaseConfigError) {
      // eslint-disable-next-line no-console
      console.error(`\n${err.message}\n`);
      process.exit(1);
    }
    throw err;
  }
}

const { app, config } = bootstrap();

const server = app.listen(config.port, () => {
  logger.info("server_started", {
    ...describeConfig(config),
    pid: process.pid,
    nodeVersion: process.version,
  });
});

/**
 * Graceful shutdown.
 *
 * Render (and every other container platform) stops a process by sending SIGTERM and then
 * SIGKILL after a grace period. Without a handler, Node dies the instant the signal
 * arrives, which for us means:
 *
 *   - in-flight requests are severed mid-response, so a visitor sees a network error on a
 *     submission that the server may already have committed;
 *   - a lead insert can be left holding an open transaction until the backend times it out;
 *   - the pool is never closed, so the database sees abandoned connections and Neon keeps
 *     billing for them until they expire.
 *
 * The sequence below drains in the right order: stop accepting new work, let in-flight
 * requests finish (bounded, so a hung client cannot stall the deploy forever), then close
 * the pool. If the drain does not finish inside the platform's grace period we log loudly
 * and exit anyway — a forced exit beats a deploy that never completes.
 *
 * `pool` is required lazily rather than imported at the top: this module deliberately loads
 * ./app inside a try/catch so a database misconfiguration produces a clean message instead
 * of a stack trace, and a static import here would defeat that.
 */
const SHUTDOWN_GRACE_MS = Number(process.env.SHUTDOWN_GRACE_MS ?? 20_000);

let shuttingDown = false;

/**
 * Notification outbox worker, started after the server is listening.
 *
 * It is deliberately not started when the app is constructed — `createAppFromEnv` is used by
 * the tests, and a poller with a live timer would keep those processes alive.
 */
let outboxWorker: { stop: () => Promise<void> } | undefined;

if (config.outboxEnabled) {
  // Required lazily for the same reason as the pool below: the route graph builds the
  // database pool at import time, and this module wants a configuration error surfaced as a
  // clean message rather than a stack trace.
  const { startOutboxWorker } = require("./lib/outbox") as typeof import("./lib/outbox");
  const { createOutboxSender } = require("./lib/outboxSender") as typeof import("./lib/outboxSender");
  const { DEFAULT_BACKOFF } = require("./lib/backoff") as typeof import("./lib/backoff");

  outboxWorker = startOutboxWorker({
    pollMs: config.outboxPollMs,
    batchSize: config.outboxBatchSize,
    leaseMs: config.outboxLeaseMs,
    backoff: DEFAULT_BACKOFF,
    send: createOutboxSender(),
  });

  logger.info("outbox_worker_started", {
    pollMs: config.outboxPollMs,
    batchSize: config.outboxBatchSize,
    leaseMs: config.outboxLeaseMs,
  });
} else {
  logger.warn("outbox_worker_disabled", {
    detail: "OUTBOX_ENABLED=0 — leads will be stored but the team will not be emailed",
  });
}

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  if (shuttingDown) {
    logger.warn("shutdown_signal_received_again", { signal });
    return;
  }
  shuttingDown = true;

  logger.info("shutdown_started", { signal, graceMs: SHUTDOWN_GRACE_MS });

  const forceExit = setTimeout(() => {
    logger.error("shutdown_grace_period_exceeded", {
      signal,
      graceMs: SHUTDOWN_GRACE_MS,
      detail: "exiting without a clean drain; in-flight work was abandoned",
    });
    process.exit(1);
  }, SHUTDOWN_GRACE_MS);
  forceExit.unref();

  // 1. Stop accepting new connections. Existing keep-alive sockets are closed too, which is
  //    what allows the process to exit once the last response is written.
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });

  // 2. Stop the outbox worker so it cannot claim new rows while the pool is closing.
  if (outboxWorker) {
    try {
      await outboxWorker.stop();
    } catch (err) {
      logger.error("shutdown_outbox_stop_failed", { err });
    }
  }

  // 3. Drain the connection pool.
  try {
    const { pool } = require("./db") as typeof import("./db");
    await pool.end();
  } catch (err) {
    logger.error("shutdown_pool_close_failed", { err });
  }

  clearTimeout(forceExit);
  logger.info("shutdown_complete", { signal });
  process.exit(0);
}

for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.on(signal, () => {
    void shutdown(signal);
  });
}

/**
 * HTTP server timeouts.
 *
 * - `headersTimeout`    bounds how long a client may take to send request headers
 *                       (Slowloris-style partial-request attacks).
 * - `requestTimeout`    bounds receiving the *request* from the client. It does NOT bound
 *                       how long a handler takes to respond, so it is not a remedy for a
 *                       slow outbound dependency. That is handled in the reliability batch,
 *                       which puts an explicit timeout on the Resend call.
 * - `keepAliveTimeout`  how long an idle keep-alive socket is held open.
 *
 * `headersTimeout` must exceed `keepAliveTimeout`; the configured defaults satisfy that.
 */
server.headersTimeout = config.headersTimeoutMs;
server.requestTimeout = config.requestTimeoutMs;
server.keepAliveTimeout = config.keepAliveTimeoutMs;

server.on("error", (err) => {
  logger.error("server_error", { err });
});

export default app;
