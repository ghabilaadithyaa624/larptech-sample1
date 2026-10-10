/**
 * Database-backed tests for /api/waitlist.
 *
 * The behaviour under test is case-insensitive uniqueness. Before this batch the unique
 * index covered the raw email text, so `Ada@Example.com` and `ada@example.com` were two
 * rows and the "already registered" check silently failed.
 *
 * Run with:
 *   TEST_DATABASE_URL=postgresql://postgres@127.0.0.1:5433/larptech_test npm run test:integration
 */

import "../db/integrationEnv";

import assert from "node:assert/strict";
import type { Server } from "node:http";
import { after, before, beforeEach, describe, it } from "node:test";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import express from "express";

import {
  applyMigrations,
  endTestPool,
  integrationEnabled,
  testPool,
  truncateAll,
} from "../db/integrationEnv";
import { rejectsWith } from "../db/pgErrorMatch";
import { waitlist } from "../db/schema";

// Imported after the harness so DATABASE_URL is already set when the pool is built.
import waitlistRouter from "./waitlist";

const db = () => drizzle(testPool());

let server: Server;
let baseUrl: string;

async function post(body: Record<string, unknown>): Promise<{ status: number; json: unknown }> {
  const res = await fetch(`${baseUrl}/api/waitlist`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: res.status, json: await res.json().catch(() => null) };
}

describe("/api/waitlist — database behaviour", () => {
  if (!integrationEnabled) {
    it("skipped: TEST_DATABASE_URL is not set", { skip: true }, () => {});
    return;
  }

  before(async () => {
    await applyMigrations();
    const app = express();
    app.use(express.json());
    app.use("/api/waitlist", waitlistRouter);
    await new Promise<void>((resolve) => {
      server = app.listen(0, "127.0.0.1", () => resolve());
    });
    baseUrl = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
  });

  after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await truncateAll();
    await endTestPool();
  });

  beforeEach(async () => {
    await truncateAll();
  });

  it("stores the email normalised", async () => {
    const res = await post({ email: "  Ada@Example.COM  ", product: "crack-it" });
    assert.equal(res.status, 201);

    const rows = await db().select({ email: waitlist.email }).from(waitlist);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].email, "ada@example.com");
  });

  it("a re-submission differing only in case is a duplicate, not a second row", async () => {
    const first = await post({ email: "Ada@Example.com", product: "crack-it" });
    assert.equal(first.status, 201);
    assert.equal((first.json as { duplicate: boolean }).duplicate, false);

    const second = await post({ email: "ada@example.com", product: "crack-it" });
    assert.equal(second.status, 201, "waitlist always answers 201 so as not to leak membership");
    assert.equal((second.json as { duplicate: boolean }).duplicate, true, "must be detected as duplicate");

    const rows = await db().select({ id: waitlist.id }).from(waitlist);
    assert.equal(rows.length, 1, "case variants must collapse to one row");
  });

  it("returns the existing row's id when reporting a duplicate", async () => {
    const first = await post({ email: "ada@example.com", product: "crack-it" });
    const firstId = (first.json as { id?: string }).id ?? null;

    const second = await post({ email: "ADA@EXAMPLE.COM", product: "crack-it" });
    const secondId = (second.json as { id: string | null }).id;

    assert.equal(secondId, firstId, "the duplicate response should carry the existing id");
  });

  it("the same address on a different product is a separate signup", async () => {
    await post({ email: "ada@example.com", product: "crack-it" });
    const second = await post({ email: "ada@example.com", product: "meeting-assistant" });

    assert.equal((second.json as { duplicate: boolean }).duplicate, false);

    const rows = await db().select({ id: waitlist.id }).from(waitlist);
    assert.equal(rows.length, 2);
  });

  it("concurrent identical signups produce exactly one row", async () => {
    const results = await Promise.all(
      Array.from({ length: 6 }, () => post({ email: "race@example.com", product: "crack-it" })),
    );

    const rows = await db()
      .select({ id: waitlist.id })
      .from(waitlist)
      .where(eq(sql`lower(${waitlist.email})`, "race@example.com"));
    assert.equal(rows.length, 1, `expected one row, got ${rows.length}`);

    const created = results.filter((r) => (r.json as { duplicate: boolean }).duplicate === false);
    assert.equal(created.length, 1, "exactly one request should have created the signup");
  });

  it("uniqueness holds even for a write that bypasses normalisation", async () => {
    // The invariant is on lower(email), not on the stored text, so a future code path that
    // forgets to normalise cannot create a duplicate.
    await post({ email: "ada@example.com", product: "crack-it" });

    await assert.rejects(
      db()
        .insert(waitlist)
        .values({ email: "ADA@EXAMPLE.COM", product: "crack-it" })
        .returning({ id: waitlist.id }),
      rejectsWith(/waitlist_email_product_idx|duplicate key|unique constraint/i),
      "a mixed-case insert must be rejected once the normalised row exists",
    );
  });
});
