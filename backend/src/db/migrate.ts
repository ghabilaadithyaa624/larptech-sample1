/**
 * Applies all pending migrations in ./drizzle and exits.
 *
 * Intended to run as a pre-deploy step (`npm run db:migrate`) so that schema changes and
 * the code that assumes them land together, rather than a human remembering to click
 * through `drizzle-kit push` in a studio UI.
 *
 * Behaviour:
 *   - Creates the migrations table if absent (drizzle does this itself).
 *   - Applies each pending file in order, recording it, so it is re-runnable and skips
 *     what is already applied.
 *   - Exits non-zero on failure, with the failing statement's error printed, so a deploy
 *     pipeline stops rather than serving against a half-migrated schema.
 *
 * The pool is created with max: 1 — migrations are DDL and must not interleave.
 */

import "../test-env";

import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

import { buildDatabaseConfig } from "./tls";

async function main(): Promise<void> {
  const isProduction = process.env.NODE_ENV === "production";
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("DATABASE_URL is not set; cannot run migrations.");
    process.exitCode = 1;
    return;
  }

  const cfg = buildDatabaseConfig({ databaseUrl, isProduction });

  const pool = new Pool({
    connectionString: cfg.connectionString,
    ...(cfg.ssl === false ? {} : { ssl: cfg.ssl }),
    max: 1,
  });

  try {
    const db = drizzle(pool);
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Migrations applied.");
  } catch (err) {
    console.error("Migration failed:");
    console.error(err);
    process.exitCode = 1;
  } finally {
    await pool.end().catch(() => {});
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
