import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

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
