import type { LeadInput } from "./validators";

const TEAM_INBOX = process.env.LEAD_INBOX_EMAIL ?? "team@larptech.io";

/**
 * Best-effort Resend notification on new lead submission.
 * If RESEND_API_KEY is not configured (local dev / free tier), the lead is
 * still persisted and the notification is skipped silently with a log line.
 */
export async function notifyTeamOfLead(lead: LeadInput): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info("[email] RESEND_API_KEY not set — skipping lead notification.", {
      email: lead.email,
      service: lead.serviceInterest,
    });
    return { sent: false, reason: "no-api-key" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? "LarpTech Leads <leads@larptech.io>",
        to: [TEAM_INBOX],
        reply_to: lead.email,
        subject: `New consultation request — ${lead.serviceInterest} — ${lead.name}${lead.company ? ` (${lead.company})` : ""}`,
        text: [
          `Name: ${lead.name}`,
          `Email: ${lead.email}`,
          `Company: ${lead.company || "—"}`,
          `Service interest: ${lead.serviceInterest}`,
          "",
          "Message:",
          lead.message || "—",
        ].join("\n"),
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("[email] Resend error", res.status, body);
      return { sent: false, reason: "resend-error" };
    }
    return { sent: true };
  } catch (err) {
    console.error("[email] Failed to send lead notification", err);
    return { sent: false, reason: "exception" };
  }
}
