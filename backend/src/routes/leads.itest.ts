/**
 * Database-backed tests for /api/leads.
 *
 * These exercise behaviour that cannot be observed without a real PostgreSQL: the
 * de-duplication window, the advisory lock that makes it safe under concurrency, and the
 * CHECK constraint on lead status.
 *
 * Run with:
 *   TEST_DATABASE_URL=postgresql://postgres@127.0.0.1:5433/larptech_test npm run test:integration
 */

import "../db/integrationEnv";

import assert from "node:assert/strict";
import type { Server } from "node:http";
import { after, before, beforeEach, describe, it } from "node:test";
import { sql } from "drizzle-orm";
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
import { leadNotifications, leads } from "../db/schema";

// Imported after the harness so DATABASE_URL is already set when the pool is built.
import leadsRouter from "./leads";

const db = () => drizzle(testPool());

let server: Server;
let baseUrl: string;

async function postLead(body: Record<string, unknown>): Promise<{ status: number; json: unknown }> {
  const res = await fetch(`${baseUrl}/api/leads`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: res.status, json: await res.json().catch(() => null) };
}

const VALID = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  company: "Analytical Engines",
  serviceInterest: "marketing-ai",
  message: "We would like to talk about attribution.",
};

describe("/api/leads — database behaviour", () => {
  if (!integrationEnabled) {
    it("skipped: TEST_DATABASE_URL is not set", { skip: true }, () => {});
    return;
  }

  before(async () => {
    await applyMigrations();
    const app = express();
    app.use(express.json());
    app.use("/api/leads", leadsRouter);
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

  it("stores the email normalised (trimmed and lower-cased)", async () => {
    const res = await postLead({ ...VALID, email: "  Ada@Example.COM  " });
    assert.equal(res.status, 201, `expected 201, got ${res.status}`);

    const rows = await db().select({ email: leads.email }).from(leads);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].email, "ada@example.com", "stored email must be normalised");
  });

  it("collapses a repeat submission inside the window into one row", async () => {
    const first = await postLead(VALID);
    assert.equal(first.status, 201);

    const second = await postLead(VALID);
    assert.equal(second.status, 200, "a repeat should be 200, not 201");
    assert.deepEqual(second.json, { ok: true, id: (first.json as { id: string }).id, duplicate: true });

    const rows = await db().select({ id: leads.id }).from(leads);
    assert.equal(rows.length, 1, "exactly one row must exist");
  });

  it("treats the same enquiry after the window as a new lead", async () => {
    const first = await postLead(VALID);
    assert.equal(first.status, 201);

    // Backdate the row beyond the 10 minute default window.
    await db().execute(sql`update ${leads} set created_at = now() - interval '30 minutes'`);

    const later = await postLead(VALID);
    assert.equal(later.status, 201, "an enquiry outside the window is new");
    assert.equal((later.json as { duplicate: boolean }).duplicate, false);

    const rows = await db().select({ id: leads.id }).from(leads);
    assert.equal(rows.length, 2);
  });

  it("does not collapse enquiries about a different service", async () => {
    await postLead(VALID);
    const other = await postLead({ ...VALID, serviceInterest: "sales-ai" });

    assert.equal(other.status, 201);
    assert.equal((other.json as { duplicate: boolean }).duplicate, false);

    const rows = await db().select({ id: leads.id }).from(leads);
    assert.equal(rows.length, 2, "different services are different enquiries");
  });

  it("does not collapse enquiries from a different address", async () => {
    await postLead(VALID);
    const other = await postLead({ ...VALID, email: "grace@example.com" });

    assert.equal(other.status, 201);
    const rows = await db().select({ id: leads.id }).from(leads);
    assert.equal(rows.length, 2);
  });

  it("concurrent identical submissions produce exactly one row", async () => {
    // A visitor double-clicking submit, or a client retrying, fires several requests at
    // once. Without the advisory lock every one of them would pass the "does this already
    // exist?" check and insert.
    const results = await Promise.all(
      Array.from({ length: 8 }, () => postLead(VALID)),
    );

    const rows = await db().select({ id: leads.id }).from(leads);
    assert.equal(rows.length, 1, `expected exactly one row, got ${rows.length}`);

    const created = results.filter((r) => r.status === 201);
    const deduped = results.filter((r) => r.status === 200);
    assert.equal(created.length, 1, "exactly one request should have created a lead");
    assert.equal(deduped.length, 7, "the rest should have been reported as duplicates");
    for (const r of deduped) {
      assert.equal((r.json as { duplicate: boolean }).duplicate, true);
    }
  });

  it("records a pending notification alongside the lead", async () => {
    // The team notification is no longer sent inside the request; the intent to send it is
    // recorded. If the lead were stored without this row, a provider outage would silently
    // lose the notification and nobody would follow up.
    const res = await postLead(VALID);
    assert.equal(res.status, 201);

    const notes = await db().select().from(leadNotifications);
    assert.equal(notes.length, 1, `expected exactly 1 notification, got ${notes.length}`);
    assert.equal(notes[0].status, "pending");
    assert.equal(notes[0].attempts, 0);
    assert.equal(notes[0].leadId, (res.json as { id: string }).id);
  });

  it("a duplicate submission does not create a second notification", async () => {
    // A duplicate lead would otherwise mean a second email about the same enquiry.
    await postLead(VALID);
    const second = await postLead(VALID);
    assert.equal(second.status, 200, "the second submission should be recognised as a repeat");

    const notes = await db().select().from(leadNotifications);
    assert.equal(notes.length, 1, "a repeat must not enqueue another notification");
  });

  it("does not call the email provider during the request", async () => {
    // The regression this guards: the notification used to be awaited inside this handler, so
    // the visitor's response time depended on Resend, and a slow provider turned a successful
    // lead capture into a timeout the visitor would retry.
    const realFetch = globalThis.fetch;
    const calls: string[] = [];
    globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      calls.push(String(input));
      return realFetch(input, init);
    }) as typeof fetch;

    try {
      const started = Date.now();
      const res = await postLead(VALID);
      const elapsed = Date.now() - started;
      assert.equal(res.status, 201);
      assert.ok(elapsed < 2_000, `request took ${elapsed}ms — it should not wait on email`);
    } finally {
      globalThis.fetch = realFetch;
    }

    const toResend = calls.filter((u) => u.includes("resend.com"));
    assert.deepEqual(toResend, [], "no email provider call must happen inside the request");
  });

  it("the database rejects a lead status outside the allowed set", async () => {
    await assert.rejects(
      db()
        .insert(leads)
        .values({
          name: "Test",
          email: "status@example.com",
          serviceInterest: "ai-agents",
          status: "pending", // not in the allowed set
        })
        .returning({ id: leads.id }),
      rejectsWith(/leads_status_check|violates check constraint/i),
      "the CHECK constraint must reject an unknown status",
    );
  });
});
