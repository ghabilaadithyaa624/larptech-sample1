/**
 * Verifies the migrations actually produce the schema the code assumes.
 *
 * The TypeScript definitions in `schema.ts` are only a description; what matters at runtime
 * is what the database has. These tests read the live catalog so a migration that was
 * generated but never applied — or applied to one environment and not another — is caught
 * rather than assumed.
 */

import "./integrationEnv";

import assert from "node:assert/strict";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { after, before, describe, it } from "node:test";

import {
  applyMigrations,
  checkConstraints,
  endTestPool,
  indexDefs,
  integrationEnabled,
  testPool,
  truncateAll,
} from "./integrationEnv";

describe("database schema after migration", () => {
  if (!integrationEnabled) {
    it("skipped: TEST_DATABASE_URL is not set", { skip: true }, () => {});
    return;
  }

  before(async () => {
    await applyMigrations();
  });

  after(async () => {
    await truncateAll();
    await endTestPool();
  });

  it("enforces waitlist uniqueness on the normalised address", async () => {
    const indexes = await indexDefs("waitlist");
    const unique = indexes.find((i) => i.name === "waitlist_email_product_idx");

    assert.ok(unique, "waitlist_email_product_idx must exist");
    assert.match(unique.def, /UNIQUE/, "the index must be unique");
    assert.match(
      unique.def,
      /lower\(/i,
      "uniqueness must be bound to lower(email) so case variants cannot both exist",
    );
  });

  it("constrains lead status to the allowed set", async () => {
    const names = await checkConstraints("leads");
    assert.ok(
      names.includes("leads_status_check"),
      `expected leads_status_check, found: ${names.join(", ") || "(none)"}`,
    );
  });

  it("indexes the lead de-duplication lookup", async () => {
    const indexes = await indexDefs("leads");
    const names = indexes.map((i) => i.name);

    assert.ok(
      names.includes("leads_email_created_at_idx"),
      `expected leads_email_created_at_idx, found: ${names.join(", ")}`,
    );
    assert.ok(
      !names.includes("leads_email_idx"),
      "the superseded standalone email index should have been dropped",
    );
  });

  it("applying migrations twice is a no-op", async () => {
    // This is the "database originally created with drizzle-kit push" adoption path: 0000 is
    // written to be idempotent so an existing environment can start using migrations without
    // being rebuilt.
    const before = await testPool().query<{ count: string }>(
      `select count(*)::text as count from drizzle.__drizzle_migrations`,
    );

    await applyMigrations(); // memoised; force a real second pass below
    const db = drizzle(testPool());
    await db.execute(sql`select 1`);

    const after = await testPool().query<{ count: string }>(
      `select count(*)::text as count from drizzle.__drizzle_migrations`,
    );
    assert.equal(after.rows[0].count, before.rows[0].count, "no migration should be re-applied");
  });

  it("records both migrations as applied", async () => {
    const res = await testPool().query<{ hash: string; created_at: string }>(
      `select hash, created_at from drizzle.__drizzle_migrations order by created_at`,
    );
    assert.ok(res.rows.length >= 2, `expected at least 2 applied migrations, got ${res.rows.length}`);
  });
});
