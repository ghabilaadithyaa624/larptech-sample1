import { getConfig } from "./env";
import { sendLeadNotification, type DeliveryResult } from "./email";
import { logger } from "./logger";
import { loadLeadForNotification, type OutboxSendFn } from "./outbox";
import type { ServiceSlug } from "./validators";

/**
 * The outbox sender used in production: loads the lead and hands it to Resend.
 *
 * The Idempotency-Key is derived from the notification id, not generated per attempt. That
 * is the whole point — Resend deduplicates on key plus payload within 24 hours, so a retry
 * after a timeout (where the provider may already have accepted the send) returns the
 * original result instead of sending a second email. A key that changed per attempt would
 * provide no protection whatsoever.
 */
export function createOutboxSender(): OutboxSendFn {
  return async ({ notificationId, leadId }): Promise<DeliveryResult> => {
    const config = getConfig();

    if (!config.resendApiKey) {
      // Not a failure to retry: there is no credential to retry with. Marking it permanent
      // keeps the row from cycling, and the lead is still stored.
      logger.info("lead_notification_skipped", { reason: "no-api-key" });
      return { ok: false, kind: "permanent", reason: "no-api-key" };
    }

    const lead = await loadLeadForNotification(leadId);
    if (!lead) {
      // The lead was deleted (the FK cascades, so this should not happen) — nothing to send.
      return { ok: false, kind: "permanent", reason: "lead-missing" };
    }

    return sendLeadNotification({
      lead: {
        name: lead.name,
        email: lead.email,
        company: lead.company ?? undefined,
        serviceInterest: lead.serviceInterest as ServiceSlug,
        message: lead.message ?? undefined,
      },
      idempotencyKey: `lead-notification/${notificationId}`,
      timeoutMs: config.resendTimeoutMs,
      apiKey: config.resendApiKey,
      from: config.emailFrom,
      to: config.leadInboxEmail,
    });
  };
}
