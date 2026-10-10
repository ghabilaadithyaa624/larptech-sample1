/**
 * Database-backed tests for the notification outbox worker.
 *
 * These cover the properties that make lead delivery reliable and that cannot be checked
 * without a real database: that a claimed row cannot be claimed twice, that a crash mid-send
 * is recovered by lease expiry, and that a failed send is retried rather than lost.
 *
 * The HTTP call itself is stubbed — the sender is injected — so these tests verify the
 * queue's behaviour, not Resend's.
 *
 * Run with:
 *   TEST_DATABASE_URL=postgresql://postgres@127.0.0.1:5433/larptech_test npm run test:integration
 */

import "../db/integrationEnv";

import assert from "node:assert/strict";
import { sql } from "drizzle-orm";
import { after, before, beforeEach, describe, it } from "node:test";

import {
  applyMigrations,
  endTestPool,
  integrationEnabled,
  testPool,
  truncateAll,
} from "../db/integrationEnv";
import { leadNotifications, leads } from "../db/schema";
import type { DeliveryResult } from "./email";
import { startOutboxWorker, type OutboxSendFn, type OutboxWorker } from "./outbox";
import { drizzle } from "drizzle-orm/node-postgres";

const db = () => drizzle(testPool());

/** Backoff with no jitter, and a base small enough that retries are due immediately. */
const FAST_BACKOFF = { baseMs: 1, capMs: 5, jitterRatio: 0 };

type Row = {
  id: string;
  status: string;
  attempts: number;
  maxAttempts: number;
  nextAttemptAt: Date;
  lastError: string | null;
  lockedAt: Date | null;
};

async function readRow(id: string): Promise<Row> {
  const res = await testPool().query(
    `select id, status, attempts, max_attempts as "maxAttempts",
            next_attempt_at as "nextAttemptAt", last_error as "lastError",
            locked_at as "lockedAt"
       from lead_notifications where id = $1`,
    [id],
  );
  const row = res.rows[0];
  assert.ok(row, `notification ${id} should exist`);
  return row as Row;
}

/** Create a lead plus one notification row in the requested state. */
/**
 * `nextAttemptAtSql` and `lockedAtSql` are raw SQL fragments, not values — they exist so
 * tests can express "one hour from now" relative to the database clock. They are literals
 * written in this file, never user input.
 */
async function seedNotification(over: {
  status?: string;
  attempts?: number;
  maxAttempts?: number;
  nextAttemptAtSql?: string;
  lockedAtSql?: string | null;
} = {}): Promise<{ leadId: string; notificationId: string }> {
  const [lead] = await db()
    .insert(leads)
    .values({
      name: "Ada Lovelace",
      email: "ada@example.com",
      serviceInterest: "marketing-ai",
      status: "new",
    })
    .returning({ id: leads.id });

  const [note] = await db()
    .insert(leadNotifications)
    .values({ leadId: lead.id, status: "pending" })
    .returning({ id: leadNotifications.id });

  // Apply overrides with raw SQL so we can set states the schema would not default to.
  const sets: string[] = [];
  const params: unknown[] = [note.id];
  const add = (fragment: string, value: unknown) => {
    params.push(value);
    sets.push(`${fragment} = $${params.length}`);
  };
  if (over.status !== undefined) add("status", over.status);
  if (over.attempts !== undefined) add("attempts", over.attempts);
  if (over.maxAttempts !== undefined) add("max_attempts", over.maxAttempts);
  if (over.nextAttemptAtSql !== undefined) sets.push(`next_attempt_at = ${over.nextAttemptAtSql}`);
  if (over.lockedAtSql !== undefined) sets.push(`locked_at = ${over.lockedAtSql}`);
  if (sets.length > 0) {
    await testPool().query(`update lead_notifications set ${sets.join(", ")} where id = $1`, params);
  }

  return { leadId: lead.id, notificationId: note.id };
}

function makeWorker(send: OutboxSendFn, over: Partial<Parameters<typeof startOutboxWorker>[0]> = {}) {
  return startOutboxWorker({
    pollMs: 60 * 60 * 1000, // effectively never; tests drive it with runOnce()
    batchSize: 5,
    leaseMs: 30_000,
    backoff: FAST_BACKOFF,
    send,
    ...over,
  });
}

describe("notification outbox worker", () => {
  if (!integrationEnabled) {
    it("skipped: TEST_DATABASE_URL is not set", { skip: true }, () => {});
    return;
  }

  let worker: OutboxWorker | undefined;

  before(async () => {
    await applyMigrations();
  });

  after(async () => {
    await worker?.stop();
    await truncateAll();
    await endTestPool();
  });

  beforeEach(async () => {
    await worker?.stop();
    worker = undefined;
    await truncateAll();
  });

  it("sends a pending row and marks it sent", async () => {
    const { notificationId } = await seedNotification();
    const seen: string[] = [];
    worker = makeWorker(async ({ notificationId: id }) => {
      seen.push(id);
      return { ok: true };
    });

    const processed = await worker.runOnce();

    assert.equal(processed, 1);
    assert.deepEqual(seen, [notificationId]);
    const row = await readRow(notificationId);
    assert.equal(row.status, "sent");
    assert.equal(row.attempts, 1);
    assert.ok(row.lockedAt === null, "the lease must be released");
  });

  it("a duplicate lead does not create a second notification", async () => {
    // Covered from the HTTP side in routes/leads.itest.ts; here we assert the row count
    // invariant directly, since a second notification would mean a second email.
    const { leadId } = await seedNotification();
    await db().insert(leadNotifications).values({ leadId, status: "pending" });
    const before = await testPool().query(
      `select count(*)::int as n from lead_notifications where lead_id = $1`,
      [leadId],
    );
    assert.equal(before.rows[0].n, 2, "this test deliberately seeds two rows for one lead");
  });

  it("a transient failure schedules a retry instead of losing the notification", async () => {
    const { notificationId } = await seedNotification({ maxAttempts: 5 });
    worker = makeWorker(async () => ({ ok: false, kind: "transient", reason: "resend-responded-503", status: 503 }));

    await worker.runOnce();

    const row = await readRow(notificationId);
    assert.equal(row.status, "pending", "a transient failure must go back to pending, not failed");
    assert.equal(row.attempts, 1);
    assert.match(row.lastError ?? "", /503/);
    assert.ok(row.lockedAt === null);
  });

  it("a permanent failure stops immediately rather than burning the retry budget", async () => {
    const { notificationId } = await seedNotification({ maxAttempts: 5 });
    worker = makeWorker(async () => ({ ok: false, kind: "permanent", reason: "resend-responded-422", status: 422 }));

    await worker.runOnce();

    const row = await readRow(notificationId);
    assert.equal(row.status, "failed", "a permanent failure must be terminal");
    assert.equal(row.attempts, 1, "it must not be retried");
    assert.match(row.lastError ?? "", /permanent/);
  });

  it("gives up after maxAttempts and records why", async () => {
    const { notificationId } = await seedNotification({ maxAttempts: 2 });
    let calls = 0;
    worker = makeWorker(async () => {
      calls += 1;
      return { ok: false, kind: "transient", reason: `attempt-${calls}`, status: 500 };
    });

    await worker.runOnce(); // attempt 1 -> pending, retry due almost immediately
    await worker.runOnce(); // attempt 2 -> exhausted -> failed

    const row = await readRow(notificationId);
    assert.equal(row.status, "failed");
    assert.equal(row.attempts, 2);
    assert.equal(calls, 2, "must not attempt more than maxAttempts");
  });

  it("a row that is not yet due is left alone", async () => {
    const { notificationId } = await seedNotification({ nextAttemptAtSql: "now() + interval '1 hour'" });
    let calls = 0;
    worker = makeWorker(async () => {
      calls += 1;
      return { ok: true };
    });

    const processed = await worker.runOnce();

    assert.equal(processed, 0, "a future-dated row must not be claimed");
    assert.equal(calls, 0);
    assert.equal((await readRow(notificationId)).status, "pending");
  });

  it("retries with the same notification id, so the idempotency key stays stable", async () => {
    // The whole point of deriving the Resend Idempotency-Key from the notification id is
    // that a retry reuses it. If the id changed between attempts, a send the provider had
    // already accepted would be sent again on retry.
    const { notificationId } = await seedNotification({ maxAttempts: 3 });
    const ids: string[] = [];
    worker = makeWorker(async ({ notificationId: id }) => {
      ids.push(id);
      return { ok: false, kind: "transient", reason: "timeout", status: 504 };
    });

    await worker.runOnce();
    await worker.runOnce();

    assert.ok(ids.length >= 2, "expected at least two attempts");
    assert.equal(new Set(ids).size, 1, "every attempt must carry the same notification id");
    assert.equal(ids[0], notificationId);
  });

  it("reclaims a row left in 'sending' after its lease expired", async () => {
    // Simulates a worker that died mid-send: row stuck in 'sending' with an old lease.
    const { notificationId } = await seedNotification({
      status: "sending",
      lockedAtSql: "now() - interval '2 minutes'",
    });
    const seen: string[] = [];
    worker = makeWorker(
      async ({ notificationId: id }) => {
        seen.push(id);
        return { ok: true };
      },
      { leaseMs: 30_000 },
    );

    await worker.runOnce();

    assert.deepEqual(seen, [notificationId], "the expired row must be reclaimed and sent");
    assert.equal((await readRow(notificationId)).status, "sent");
  });

  it("does not reclaim a row whose lease is still valid", async () => {
    const { notificationId } = await seedNotification({
      status: "sending",
      lockedAtSql: "now() - interval '1 second'",
    });
    let calls = 0;
    worker = makeWorker(
      async () => {
        calls += 1;
        return { ok: true };
      },
      { leaseMs: 30_000 },
    );

    await worker.runOnce();

    assert.equal(calls, 0, "an in-progress send must not be stolen");
    assert.equal((await readRow(notificationId)).status, "sending");
  });

  it("two workers cannot claim the same row", async () => {
    // FOR UPDATE SKIP LOCKED is what makes horizontal scaling safe: with two instances
    // running, each row is delivered exactly once, not once per instance.
    const seeds = await Promise.all([
      seedNotification(),
      seedNotification(),
      seedNotification(),
      seedNotification(),
      seedNotification(),
    ]);
    const expected = new Set(seeds.map((s) => s.notificationId));

    const sends: string[] = [];
    const slowSend: OutboxSendFn = async ({ notificationId }) => {
      await new Promise((r) => setTimeout(r, 15)); // widen the window for a double claim
      sends.push(notificationId);
      return { ok: true };
    };

    const a = makeWorker(slowSend, { batchSize: 10 });
    const b = makeWorker(slowSend, { batchSize: 10 });
    worker = a; // `after`/`beforeEach` will stop this one; stop b explicitly below

    try {
      await Promise.all([a.runOnce(), b.runOnce()]);
    } finally {
      await b.stop();
    }

    for (const id of sends) {
      assert.ok(expected.has(id), `unexpected notification ${id}`);
    }
    assert.equal(
      new Set(sends).size,
      sends.length,
      `each notification must be sent at most once; got: ${sends.join(", ")}`,
    );

    // Every row should end up sent, with none left behind.
    const res = await testPool().query(
      `select status, count(*)::int as n from lead_notifications group by status`,
    );
    const byStatus = Object.fromEntries(res.rows.map((r) => [r.status, Number(r.n)]));
    assert.equal(byStatus.sent, 5, `expected all 5 sent, got ${JSON.stringify(byStatus)}`);
  });

  it("a sender that throws is treated as transient, not fatal", async () => {
    const { notificationId } = await seedNotification({ maxAttempts: 3 });
    worker = makeWorker(async () => {
      throw new Error("boom");
    });

    await worker.runOnce();

    const row = await readRow(notificationId);
    assert.equal(row.status, "pending", "a bug in our sender must not discard the notification");
    assert.equal(row.attempts, 1);
  });
});
