import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { db } from "../db";
import { waitlist } from "../db/schema";

const router = Router();

const PRODUCTS = ["crack-it", "meeting-assistant"] as const;
type Product = (typeof PRODUCTS)[number];

const waitlistSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Enter a valid email address."),
  product: z.enum(PRODUCTS, {
    error: "Unknown product.",
  }),
});

/**
 * POST /api/waitlist
 * Captures a waitlist signup (email + product) and stores it.
 * Duplicate email+product combinations are silently accepted (idempotent).
 */
router.post("/", async (req: Request, res: Response) => {
  const parsed = waitlistSchema.safeParse(req.body);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    res.status(422).json({
      message: "Please fix the highlighted fields and retry.",
      fieldErrors,
    });
    return;
  }

  const { email, product } = parsed.data;

  try {
    // Insert; ignore duplicate email+product (ON CONFLICT DO NOTHING via try/catch)
    await db
      .insert(waitlist)
      .values({ email, product })
      .onConflictDoNothing();

    res.status(201).json({ ok: true });
  } catch (err) {
    console.error("[api/waitlist] insert failed", err);
    res.status(500).json({
      message:
        "We couldn't save your signup right now. Please email team@larptech.io directly to be added.",
    });
  }
});

export default router;
