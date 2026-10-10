import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Lead lifecycle values.
 *
 * `status` was previously free text with a default of 'new', so a typo in a manual query or
 * a future code path would silently create a row no dashboard query matches. The allowed set
 * is now enforced by a CHECK constraint (see `leads_status_check`).
 */
export const LEAD_STATUSES = ["new", "contacted", "qualified", "closed", "spam"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

/**
 * Leads captured from the public contact form.
 * Inserts happen only through the server-side /api/leads route —
 * the public site can never read submitted leads.
 */
export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    /**
     * Always stored normalised (trimmed, lower-cased) — see `normaliseEmail` in
     * `src/lib/email.ts`. Normalisation at the boundary is what makes the index below
     * useful for de-duplication and lookup.
     */
    email: text("email").notNull(),
    company: text("company"),
    serviceInterest: text("service_interest").notNull(),
    message: text("message"),
    status: text("status").notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Replaces the standalone `leads_email_idx`: the composite prefix still serves a plain
    // email lookup, and the trailing `created_at` makes the recent-submission de-duplication
    // query in /api/leads an index-only range scan.
    index("leads_email_created_at_idx").on(table.email, table.createdAt),
    index("leads_created_at_idx").on(table.createdAt),
    index("leads_status_idx").on(table.status),
    check("leads_status_check", sql`${table.status} in ('new', 'contacted', 'qualified', 'closed', 'spam')`),
  ],
);

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;

/**
 * Waitlist signups for upcoming products (Crack It, Meeting Assistant).
 */
export const waitlist = pgTable(
  "waitlist",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    product: text("product").notNull(), // 'crack-it' | 'meeting-assistant'
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    /**
     * Uniqueness is enforced on the normalised address rather than the stored text.
     *
     * The index was previously on the raw `email` column, so `Ada@Example.com` and
     * `ada@example.com` were two distinct rows and the "already on the waitlist" detection
     * silently failed. Binding the index to lower(email) means the invariant holds even if
     * some future write path forgets to normalise before inserting.
     */
    uniqueIndex("waitlist_email_product_idx").on(sql`lower(${table.email})`, table.product),
    index("waitlist_created_at_idx").on(table.createdAt),
  ],
);

export type Waitlist = typeof waitlist.$inferSelect;
export type NewWaitlist = typeof waitlist.$inferInsert;

export const NOTIFICATION_STATUSES = ["pending", "sending", "sent", "failed"] as const;
export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[number];

/**
 * Durable outbox for the team notification that follows a new lead.
 *
 * The notification used to be sent inline, awaited inside the POST /api/leads request. That
 * tied the visitor's response time to a third-party API and, worse, meant a transient Resend
 * failure silently lost the notification: the lead was safely stored but nobody was told, so
 * nobody followed up.
 *
 * The route now records the intent to notify in the same transaction that stores the lead —
 * either both happen or neither does — and a background worker does the sending with
 * bounded timeouts and retries. A lead can therefore never be accepted without a plan to
 * notify, and a temporary provider outage delays the email instead of losing it.
 *
 * `status` transitions: pending -> sending -> sent | (back to pending, or failed).
 * `sending` rows carry a lease in `locked_at`; rows still marked sending after the lease
 * expires belong to a worker that died mid-send and are reclaimed.
 */
export const leadNotifications = pgTable(
  "lead_notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Deleting a lead removes its notification intent rather than leaving an orphan that the
    // worker would retry forever against a row it can no longer join to.
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("pending"),
    attempts: integer("attempts").notNull().default(0),
    maxAttempts: integer("max_attempts").notNull().default(5),
    nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true }).notNull().defaultNow(),
    lastError: text("last_error"),
    lockedAt: timestamp("locked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
  },
  (table) => [
    // Drives the worker's "what is due now?" query.
    index("lead_notifications_due_idx").on(table.status, table.nextAttemptAt),
    index("lead_notifications_lead_idx").on(table.leadId),
    check(
      "lead_notifications_status_check",
      sql`${table.status} in ('pending', 'sending', 'sent', 'failed')`,
    ),
  ],
);

export type LeadNotification = typeof leadNotifications.$inferSelect;
export type NewLeadNotification = typeof leadNotifications.$inferInsert;
