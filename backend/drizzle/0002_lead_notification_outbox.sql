-- 0002_lead_notification_outbox
--
-- Additive only: creates one new table. No existing rows are read, rewritten or deleted,
-- so unlike 0001 this migration is safe to apply without a data review.
--
-- It adds a foreign key to `leads` ON DELETE CASCADE. That constrains *deletion* of leads
-- (a lead with a pending notification can still be deleted — the notification goes with
-- it), and does not affect inserts.

CREATE TABLE "lead_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 5 NOT NULL,
	"next_attempt_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_error" text,
	"locked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone,
	CONSTRAINT "lead_notifications_status_check" CHECK ("lead_notifications"."status" in ('pending', 'sending', 'sent', 'failed'))
);
--> statement-breakpoint
ALTER TABLE "lead_notifications" ADD CONSTRAINT "lead_notifications_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lead_notifications_due_idx" ON "lead_notifications" USING btree ("status","next_attempt_at");--> statement-breakpoint
CREATE INDEX "lead_notifications_lead_idx" ON "lead_notifications" USING btree ("lead_id");