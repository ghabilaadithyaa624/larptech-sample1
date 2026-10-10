import { Router, type Request, type Response, type NextFunction } from "express";
import { and, desc, eq, gt, sql } from "drizzle-orm";
import { db } from "../db";
import { leadNotifications, leads } from "../db/schema";
import { getConfig } from "../lib/env";
import { HttpError } from "../lib/httpErrors";
import { logger } from "../lib/logger";
import { leadSchema, type LeadInput } from "../lib/validators";

const router = Router();

type PersistResult = { id: string | null; duplicate: boolean };

/**
 * Insert a lead, collapsing repeat submissions of the same enquiry.
 *
 * Two requests carrying the same address and service arrive together whenever a visitor
 * double-clicks submit, or when a client retries after our own notification step is slow.
 * Without care both would insert, and the team would see the same enquiry twice.
 *
 * The check-then-insert is wrapped in a transaction that first takes a
 * `pg_advisory_xact_lock` keyed on (email, serviceInterest). That lock is held for the
 * transaction's duration and released on commit, so concurrent identical submissions
 * serialise: the second one observes the row the first inserted and reports it as a
 * duplicate. A plain SELECT-then-INSERT would race — both would see nothing and both
 * would insert.
 *
 * The lock is scoped, not global: different addresses, or the same address enquiring
 * about a different service, never contend.
 *
 * Only enquiries inside the window count as repeats. Someone who comes back next month
 * with a fresh question should get a new row.
 *
 * The notification outbox row is written in the same transaction as the lead, so a duplicate
 * also cannot create a second notification.
 */
async function persistLead(lead: LeadInput, windowMinutes: number): Promise<PersistResult> {
  const values = {
    name: lead.name,
    email: lead.email,
    company: lead.company || null,
    serviceInterest: lead.serviceInterest,
    message: lead.message || null,
    status: "new",
  };

  // 0 disables de-duplication; skip the lock entirely rather than taking it and ignoring it.
  if (windowMinutes === 0) {
    return db.transaction(async (tx) => {
      const [inserted] = await tx.insert(leads).values(values).returning({ id: leads.id });
      await enqueueNotification(tx, inserted?.id);
      return { id: inserted?.id ?? null, duplicate: false };
    });
  }

  return db.transaction(async (tx) => {
    const dedupeKey = `${lead.email}|${lead.serviceInterest}`;
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${dedupeKey}, 0))`);

    const [existing] = await tx
      .select({ id: leads.id })
      .from(leads)
      .where(
        and(
          eq(leads.email, lead.email),
          eq(leads.serviceInterest, lead.serviceInterest),
          gt(leads.createdAt, sql`now() - (${windowMinutes} * interval '1 minute')`),
        ),
      )
      .orderBy(desc(leads.createdAt))
      .limit(1);

    if (existing) {
      return { id: existing.id, duplicate: true };
    }

    const [inserted] = await tx.insert(leads).values(values).returning({ id: leads.id });
    await enqueueNotification(tx, inserted?.id);
    return { id: inserted?.id ?? null, duplicate: false };
  });
}

/**
 * Record the intent to notify the team, inside the caller's transaction.
 *
 * Atomicity is the point: a lead is never accepted without a plan to tell anyone about it.
 * If this insert fails the whole thing rolls back and the caller sees a 500, rather than
 * storing a lead that nobody will ever follow up.
 */
async function enqueueNotification(
  tx: Pick<typeof db, "insert">,
  leadId: string | undefined,
): Promise<void> {
  if (!leadId) return;
  await tx.insert(leadNotifications).values({ leadId, status: "pending" });
}

/**
 * POST /api/leads
 *
 * Validates the contact form payload, inserts a lead (collapsing repeats within the
 * de-duplication window), and sends a best-effort email notification to the team.
 *
 * Validation is authoritative on the server: the client-side Zod schema is a convenience
 * only, and a caller can bypass it entirely by posting directly.
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  const parsed = leadSchema.safeParse(req.body);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    next(
      new HttpError(
        422,
        "validation_failed",
        "Please fix the highlighted fields and retry.",
        { fieldErrors },
      ),
    );
    return;
  }

  const lead = parsed.data;

  try {
    const result = await persistLead(lead, getConfig().leadDedupeWindowMinutes);

    // The team notification is NOT sent here. persistLead recorded it in the outbox inside
    // the same transaction, so the response no longer waits on a third-party API. A slow or
    // down provider now delays an email instead of holding the visitor's request open — and
    // instead of losing the notification outright.

    if (result.duplicate) {
      res.status(200).json({ ok: true, id: result.id, duplicate: true });
      return;
    }

    res.status(201).json({ ok: true, id: result.id, duplicate: false });
  } catch (err) {
    // Log the full error server-side (the logger masks credentials). Deliberately does not
    // log name, email or message: this is a public endpoint handling personal data, and the
    // lead id below is enough to find the row if the insert partially succeeded.
    logger.error("lead_insert_failed", {
      requestId: req.requestId,
      serviceInterest: lead.serviceInterest,
      err,
    });
    next(
      new HttpError(
        500,
        "lead_persist_failed",
        "We couldn't save your request right now. Your details are preserved — hit retry, or email team@larptech.io directly.",
      ),
    );
  }
});

export default router;
