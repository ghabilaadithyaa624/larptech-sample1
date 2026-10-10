/**
 * Harness for the database-backed integration tests (`src/**\/*.itest.ts`).
 *
 * This module MUST be the first import in any integration test file. The route modules
 * import `../db`, which builds its pool at module-evaluation time from `DATABASE_URL`; a
 * test file therefore has to point that variable at a real database before those imports
 * are evaluated. CommonJS output evaluates requires in declaration order, so importing this
 * first is what makes that work.
 *
 * Point the tests at a database with:
 *     TEST_DATABASE_URL=postgresql://postgres@127.0.0.1:5433/larptech_test npm run test:integration
 *
 * When TEST_DATABASE_URL is unset the tests skip. They are never run against production:
 * `test:integration` is a separate script, and the URL is supplied explicitly by whoever
 * runs it.
 */

import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

import { leadNotifications, leads, waitlist } from "./schema";

const url = process.env.TEST_DATABASE_URL;

if (url && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = url;
}

export const integrationEnabled = Boolean(url);
export const testDatabaseUrl = url;

/** Dedicated pool: kept apart from the application pool so tests can't exhaust it. */
let pool: Pool | undefined;

export function testPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: url, max: 5 });
    pool.on("error", () => {
      // An idle failing client must not crash the test run.
    });
  }
  return pool;
}

let migrationsApplied = false;

/**
 * Apply every pending migration, once per process.
 *
 * Runs against whatever TEST_DATABASE_URL names. Because 0000 is idempotent (see the header
 * comment in that file) this also proves the "adopt migrations on a database originally
 * created with drizzle-kit push" path works — running it twice is safe and the second run
 * is a no-op.
 */
export async function applyMigrations(): Promise<void> {
  if (migrationsApplied) return;
  await migrate(drizzle(testPool()), { migrationsFolder: "./drizzle" });
  migrationsApplied = true;
}

/** Empty both tables so tests do not see each other's rows. */
export async function truncateAll(): Promise<void> {
  const db = drizzle(testPool());
  await db.execute(sql`truncate table ${leads}, ${waitlist}, ${leadNotifications} restart identity cascade`);
}

export async function endTestPool(): Promise<void> {
  await pool?.end().catch(() => {});
  pool = undefined;
  migrationsApplied = false;
}

/**
 * Inspect the live schema. Used to assert that constraints actually exist rather than
 * being assumed from the TypeScript definition — the point of the migration batch.
 */
export async function indexDefs(table: string): Promise<Array<{ name: string; def: string }>> {
  const res = await testPool().query<{ name: string; def: string }>(
    `select indexname as name, indexdef as def from pg_indexes where tablename = $1 order by indexname`,
    [table],
  );
  return res.rows;
}

export async function checkConstraints(table: string): Promise<string[]> {
  const res = await testPool().query<{ conname: string }>(
    `select conname from pg_constraint where conrelid = $1::regclass and contype = 'c' order by conname`,
    [table],
  );
  return res.rows.map((r) => r.conname);
}
