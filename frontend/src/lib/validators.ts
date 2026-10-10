import { z } from "zod";

/**
 * Mirrors `backend/src/lib/validators.ts`.
 *
 * These two files are deliberately kept in step, but the backend copy is authoritative:
 * validation on the client is a convenience, and a caller can bypass it entirely by posting
 * to the API directly. If you change one, change the other — and if they ever need to
 * diverge, prefer moving the shared rule somewhere both can import rather than letting them
 * drift silently.
 */

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
 * Canonical form of an email address. See the full rationale in the backend copy — the short
 * version is that we trim and lower-case, but deliberately do NOT strip dots or +tags, since
 * some providers treat those as distinct mailboxes.
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
