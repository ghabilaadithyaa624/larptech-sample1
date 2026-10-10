import { z } from "zod";

export const SERVICE_SLUGS = [
  "marketing-ai",
  "sales-ai",
  "ai-agents",
  "security-mssp",
  "ecommerce-ai",
  "trading-ai",
  "not-sure",
] as const;

export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

export const WAITLIST_PRODUCTS = ["crack-it", "meeting-assistant"] as const;
export type WaitlistProduct = (typeof WAITLIST_PRODUCTS)[number];

/** Version-proof email check (works identically on zod v3 and v4). */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Canonical form of an email address, applied to everything we store or match on.
 *
 * Deliberately limited to trimming surrounding whitespace and lower-casing:
 *
 *  - The local part is technically case-sensitive per RFC 5321, but in practice no
 *    mainstream provider treats `Ada@Example.com` and `ada@example.com` as different
 *    mailboxes, and not normalising it lets one person occupy two waitlist rows.
 *  - Stripping dots or `+tags` (the Gmail trick) is NOT done: some providers do treat
 *    those as distinct mailboxes, and a uniqueness rule built on that assumption would
 *    reject genuinely different people. It is also a well-known way for one person to
 *    sign up many times, so a claim of "no duplicates" would be false either way.
 *
 * Unicode/IDN addresses are stored as received; Postgres compares them bytewise, which is
 * consistent as long as every write goes through this function.
 */
export function normaliseEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export const leadSchema = z.object({
  name: z.string().trim().min(2, "Please tell us your name.").max(80, "That name looks too long."),
  email: z
    .string()
    .trim()
    .min(1, "We need an email to reply to.")
    .regex(EMAIL_RE, "Enter a valid work email, e.g. you@company.com")
    .transform(normaliseEmail),
  company: z.string().trim().max(120, "That company name looks too long.").optional().or(z.literal("")),
  serviceInterest: z.enum(SERVICE_SLUGS, {
    error: "Pick the service you want to talk about.",
  }),
  message: z
    .string()
    .trim()
    .max(2000, "Keep it under 2000 characters — we can go deeper on the call.")
    .optional()
    .or(z.literal("")),
});

export type LeadInput = z.infer<typeof leadSchema>;

export const waitlistSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .regex(EMAIL_RE, "Enter a valid email address.")
    .transform(normaliseEmail),
  product: z.enum(WAITLIST_PRODUCTS, {
    error: "Unknown product.",
  }),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;
