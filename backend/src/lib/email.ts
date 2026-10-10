import { logger } from "./logger";
import type { LeadInput } from "./validators";

/**
 * Delivery result.
 *
 * `kind` is what the outbox worker retries on:
 *   - transient  the provider is likely to succeed later (timeout, 5xx, 429, DNS blip).
 *                Retrying is correct and safe.
 *   - permanent  the request itself will never succeed (bad API key, malformed payload,
 *                4xx that is not a rate limit). Retrying burns quota and delays nothing.
 *
 * Getting this wrong is expensive in both directions: retrying a permanent failure keeps a
 * dead row in the queue until it exhausts its attempts, while giving up on a transient one
 * loses the notification — which loses the lead.
 */
export type DeliveryResult =
  | { ok: true }
  | { ok: false; kind: "transient" | "permanent"; reason: string; status?: number };

/** HTTP statuses worth retrying: rate limits and the server's own transient faults. */
const RETRYABLE_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);

/**
 * Bounded send.
 *
 * `timeoutMs` bounds the whole request including connection setup. Without it a hung
 * provider holds the caller open indefinitely — which, when the caller was the request
 * handler, held the visitor's browser open too.
 */
export async function sendLeadNotification(args: {
  lead: LeadInput;
  idempotencyKey: string;
  timeoutMs: number;
  apiKey: string;
  from: string;
  to: string;
}): Promise<DeliveryResult> {
  const { lead, idempotencyKey, timeoutMs, apiKey, from, to } = args;

  const subject = `New consultation request — ${lead.serviceInterest} — ${lead.name}${
    lead.company ? ` (${lead.company})` : ""
  }`;
  const text = [
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `Company: ${lead.company || "—"}`,
    `Service interest: ${lead.serviceInterest}`,
    "",
    "Message:",
    lead.message || "—",
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // Must be stable across retries of THIS notification. Resend matches on key plus
        // payload within a 24h window; a fresh UUID per attempt would be exactly as good as
        // no key at all, and a crashed attempt that the provider had already accepted would
        // be re-sent on retry.
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: lead.email,
        subject,
        text,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (res.ok) {
      return { ok: true };
    }

    // The response body can echo the submission, so it is never logged at a level that is
    // on by default.
    const body = await res.text().catch(() => "");
    logger.debug("lead_notification_error_body", {
      status: res.status,
      body: body.slice(0, 500),
    });

    const retryable = RETRYABLE_STATUSES.has(res.status);
    return {
      ok: false,
      kind: retryable ? "transient" : "permanent",
      reason: `resend-responded-${res.status}`,
      status: res.status,
    };
  } catch (err) {
    // An AbortError here is the timeout firing. Timeouts are the clearest case of a
    // transient failure: the provider may even have accepted the request, which is exactly
    // why the idempotency key above is stable.
    const message = err instanceof Error ? err.name : "unknown";
    return { ok: false, kind: "transient", reason: `transport-error:${message}` };
  }
}

/**
 * Best-effort inline notification, retained for callers that are not the outbox worker.
 *
 * Prefer the outbox path: this one is fire-and-forget, so a transient failure loses the
 * notification entirely. It is kept only so that a local run without a worker still tells
 * someone about a lead.
 */
export async function notifyTeamOfLead(
  lead: LeadInput,
): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    logger.info("lead_notification_skipped", {
      reason: "no-api-key",
      service: lead.serviceInterest,
    });
    return { sent: false, reason: "no-api-key" };
  }

  const result = await sendLeadNotification({
    lead,
    idempotencyKey: `lead-notification/inline/${crypto.randomUUID()}`,
    timeoutMs: Number(process.env.RESEND_TIMEOUT_MS ?? 5_000),
    apiKey,
    from: process.env.EMAIL_FROM ?? "LarpTech Leads <leads@larptech.io>",
    to: process.env.LEAD_INBOX_EMAIL ?? "team@larptech.io",
  });

  if (result.ok) {
    logger.info("lead_notification_sent", { service: lead.serviceInterest });
    return { sent: true };
  }

  logger.error("lead_notification_failed", {
    reason: result.reason,
    status: result.status,
    kind: result.kind,
    service: lead.serviceInterest,
  });
  return { sent: false, reason: result.reason };
}
