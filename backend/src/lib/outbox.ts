import { sql } from "drizzle-orm";

import { db } from "../db";
import { leads, leadNotifications } from "../db/schema";
import type { DeliveryResult } from "./email";
import { logger } from "./logger";
import { computeRetryDelayMs, type BackoffOptions } from "./backoff";

/**
 * Background worker that drains the notification outbox.
 *
 * Why a worker rather than sending inline: the notification is the difference between a lead
 * being worked and a lead being forgotten. Sending it inline made that outcome depend on a
 * third-party API being healthy at the exact moment a visitor pressed submit. Moving the send
 * out of the request — with the intent recorded transactionally — means a provider outage
 * delays the email instead of silently losing it.
 *
 * Concurrency: rows are claimed with FOR UPDATE SKIP LOCKED, so several instances can run
 * against the same database and none will pick up a row another has taken. That keeps the
 * option of running more than one backend process open.
 *
 * Crash safety: a row is marked 'sending' with a lease in `locked_at`. If the process dies
 * mid-send the row stays 'sending' until the lease expires, at which point the next tick
 * reclaims it. The stable Idempotency-Key means that if the provider *had* already accepted
 * the send before the crash, the retry does not produce a second email.
 */

export type OutboxSendFn = (args: {
  notificationId: string;
  leadId: string;
}) => Promise<DeliveryResult>;

export type OutboxWorkerOptions = {
  pollMs: number;
  batchSize: number;
  /** How long a 'sending' row may stay unconfirmed before another tick reclaims it. */
  leaseMs: number;
  backoff: BackoffOptions;
  send: OutboxSendFn;
};

export type OutboxWorker = {
  stop: () => Promise<void>;
  /** Runs one poll immediately. Used by tests instead of waiting for the timer. */
  runOnce: () => Promise<number>;
};

type ClaimedRow = {
  id: string;
  leadId: string;
  attempts: number;
  maxAttempts: number;
};

export function startOutboxWorker(options: OutboxWorkerOptions): OutboxWorker {
  let stopped = false;
  let ticking = false;
  let timer: NodeJS.Timeout | undefined;

  async function reclaimStuck(): Promise<number> {
    const res = await db.execute(sql`
      update ${leadNotifications}
         set status = 'pending', locked_at = null, updated_at = now()
       where status = 'sending'
         and locked_at is not null
         and locked_at < now() - (${options.leaseMs} * interval '1 millisecond')
    `);
    return Number((res as unknown as { rowCount?: number }).rowCount ?? 0);
  }

  async function claimBatch(): Promise<ClaimedRow[]> {
    const res = await db.execute(sql`
      update ${leadNotifications}
         set status = 'sending', locked_at = now(), updated_at = now()
       where id in (
         select id from ${leadNotifications}
          where status = 'pending'
            and next_attempt_at <= now()
          order by next_attempt_at
          limit ${options.batchSize}
          for update skip locked
       )
       returning ${leadNotifications.id}, ${leadNotifications.leadId},
                 ${leadNotifications.attempts}, ${leadNotifications.maxAttempts}
    `);

    const rows = (res as unknown as { rows?: Record<string, unknown>[] }).rows ?? [];
    return rows.map((r) => ({
      id: String(r.id),
      leadId: String(r.lead_id),
      attempts: Number(r.attempts),
      maxAttempts: Number(r.max_attempts),
    }));
  }

  async function markSent(id: string, attempts: number): Promise<void> {
    await db
      .update(leadNotifications)
      .set({
        status: "sent",
        sentAt: new Date(),
        lockedAt: null,
        attempts: attempts + 1,
        updatedAt: new Date(),
      })
      .where(sql`${leadNotifications.id} = ${id}`);
  }

  async function scheduleRetry(
    id: string,
    attempts: number,
    maxAttempts: number,
    error: string,
  ): Promise<void> {
    const made = attempts + 1;
    const exhausted = made >= maxAttempts;
    const delayMs = exhausted ? 0 : computeRetryDelayMs(made, options.backoff);

    await db.execute(sql`
      update ${leadNotifications}
         set status = ${exhausted ? sql`'failed'` : sql`'pending'`},
             attempts = ${made},
             next_attempt_at = now() + (${delayMs} * interval '1 millisecond'),
             last_error = ${error.slice(0, 1000)},
             locked_at = null,
             updated_at = now()
       where ${leadNotifications.id} = ${id}
    `);

    logger.warn("lead_notification_retry_scheduled", {
      notificationId: id,
      attempt: made,
      maxAttempts,
      retryDelayMs: delayMs,
      exhausted,
    });
  }

  async function processOne(row: ClaimedRow): Promise<void> {
    let result: DeliveryResult;
    try {
      result = await options.send({ notificationId: row.id, leadId: row.leadId });
    } catch (err) {
      // A throw from the sender is a bug in our own code, not a provider verdict. Treat it as
      // transient so the row is retried rather than lost.
      logger.error("lead_notification_sender_threw", { notificationId: row.id, err });
      await scheduleRetry(row.id, row.attempts, row.maxAttempts, "sender-threw");
      return;
    }

    if (result.ok) {
      await markSent(row.id, row.attempts);
      return;
    }

    logger.error("lead_notification_delivery_failed", {
      notificationId: row.id,
      kind: result.kind,
      reason: result.reason,
      status: result.status,
    });

    if (result.kind === "permanent") {
      // Retrying cannot help; stop while the audit trail still explains why.
      await db
        .update(leadNotifications)
        .set({
          status: "failed",
          lockedAt: null,
          attempts: row.attempts + 1,
          lastError: `[permanent] ${result.reason}`.slice(0, 1000),
          updatedAt: new Date(),
        })
        .where(sql`${leadNotifications.id} = ${row.id}`);
      return;
    }

    await scheduleRetry(row.id, row.attempts, row.maxAttempts, result.reason);
  }

  async function tick(): Promise<number> {
    if (ticking) return 0;
    ticking = true;
    try {
      const reclaimed = await reclaimStuck();
      if (reclaimed > 0) {
        logger.warn("lead_notification_lease_expired", { reclaimed });
      }

      const claimed = await claimBatch();
      // Sequential on purpose: one row at a time keeps the blast radius of a slow provider
      // to a single send, and the batch is small.
      for (const row of claimed) {
        await processOne(row);
      }
      return claimed.length;
    } catch (err) {
      logger.error("outbox_tick_failed", { err });
      return 0;
    } finally {
      ticking = false;
    }
  }

  function schedule(): void {
    if (stopped) return;
    timer = setTimeout(() => {
      void tick().finally(() => {
        if (!stopped) schedule();
      });
    }, options.pollMs);
    timer.unref?.();
  }

  schedule();

  return {
    runOnce: tick,
    stop: async () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      // Let a tick already in progress finish; it checks nothing about `stopped`, but
      // `runOnce`/`tick` are short and the caller awaits this before the pool closes.
      while (ticking) {
        await new Promise((r) => setTimeout(r, 25));
      }
    },
  };
}

/**
 * How many notifications are stuck un-sent.
 *
 * Surfaced at startup and on each terminal failure so a growing backlog is visible in logs
 * rather than discovered when someone wonders why the inbox is quiet.
 */
export async function pendingNotificationCount(): Promise<number> {
  const res = await db.execute(sql`
    select count(*)::int as n from ${leadNotifications}
     where status in ('pending', 'sending')
  `);
  const rows = (res as unknown as { rows?: { n: number }[] }).rows ?? [];
  return Number(rows[0]?.n ?? 0);
}

/** Used by `runOnce` callers in tests to read back state. */
export async function notificationById(id: string): Promise<Record<string, unknown> | undefined> {
  const res = await db.execute(sql`
    select * from ${leadNotifications} where ${leadNotifications.id} = ${id}
  `);
  const rows = (res as unknown as { rows?: Record<string, unknown>[] }).rows ?? [];
  return rows[0];
}

/** Fetches the lead a notification refers to. Exported for the sender used in production. */
export async function loadLeadForNotification(leadId: string) {
  const rows = await db
    .select()
    .from(leads)
    .where(sql`${leads.id} = ${leadId}`)
    .limit(1);
  return rows[0];
}
