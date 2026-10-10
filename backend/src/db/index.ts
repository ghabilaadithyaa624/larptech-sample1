/**
 * PostgreSQL connection pool.
 *
 * TLS configuration lives in `./tls.ts` — read that file's header comment before changing
 * anything here, because pg's option-merging order is counter-intuitive and a naive
 * "simplification" will silently disable certificate verification.
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { getConfig } from "../lib/env";
import { logger } from "../lib/logger";
import { buildDatabaseConfig } from "./tls";

const config = getConfig();

const { connectionString, ssl, mode } = buildDatabaseConfig({
  databaseUrl: config.databaseUrl,
  isProduction: config.isProduction,
  caFile: config.databaseSslCaFile,
});

if (mode === "disable") {
  logger.warn("database_tls_disabled", {
    reason: "non-production loopback database host",
  });
}

export const pool = new Pool({
  connectionString,
  ssl,
  max: config.databasePoolMax,
  connectionTimeoutMillis: config.connectionTimeoutMs,
  idleTimeoutMillis: config.idleTimeoutMillis,
  // Applied as libpq-style startup options: no extra round trip per connection, and it
  // bounds both runaway queries and idle-in-transaction sessions.
  options: `-c statement_timeout=${config.statementTimeoutMs} -c idle_in_transaction_session_timeout=${config.statementTimeoutMs} -c application_name=larptech-backend`,
});

/**
 * Without this listener, `pg` emits 'error' on the pool when an *idle* client fails (a
 * dropped connection, a backend terminating). An EventEmitter 'error' event with no
 * listener is thrown, which crashes the Node process. This is a well-known footgun and was
 * missing before.
 */
pool.on("error", (err) => {
  logger.error("database_pool_error", { err });
});

export const db = drizzle(pool);

export const databaseMode = mode;
