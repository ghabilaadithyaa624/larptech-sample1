import { index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

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
    email: text("email").notNull(),
    company: text("company"),
    serviceInterest: text("service_interest").notNull(),
    message: text("message"),
    status: text("status").notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("leads_email_idx").on(table.email),
    index("leads_created_at_idx").on(table.createdAt),
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
    uniqueIndex("waitlist_email_product_idx").on(table.email, table.product),
    index("waitlist_created_at_idx").on(table.createdAt),
  ],
);

export type Waitlist = typeof waitlist.$inferSelect;
export type NewWaitlist = typeof waitlist.$inferInsert;
