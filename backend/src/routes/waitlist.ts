import { Router, type Request, type Response, type NextFunction } from "express";
import { and, eq, sql } from "drizzle-orm";
import { db } from "../db";
import { waitlist } from "../db/schema";
import { HttpError } from "../lib/httpErrors";
import { logger } from "../lib/logger";
import { waitlistSchema } from "../lib/validators";

const router = Router();

/**
 * POST /api/waitlist
 *
 * Captures a waitlist signup (email + product) and stores it.
 *
 * Duplicate email+product combinations are accepted and reported as `duplicate: true`
 * rather than an error: the caller's intent ("I want to be on this list") is satisfied
 * either way, and turning a resubmission into an error would leak whether an address is
 * already registered.
 *
 * The email is normalised (trimmed, lower-cased) by the schema before it reaches the
 * database, and uniqueness is enforced on lower(email) by
 * `waitlist_email_product_idx`. `Ada@Example.com` and `ada@example.com` therefore
 * collapse to one row — previously they were two, because the index covered the raw
 * column text.
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  const parsed = waitlistSchema.safeParse(req.body);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    next(
      new HttpError(
        422,
        "validation_failed",
        "Please fix the highlighted fields and retry.",
        { fieldErrors },
      ),
    );
    return;
  }

  const { email, product } = parsed.data;

  try {
    // ON CONFLICT DO NOTHING with no conflict target covers every unique constraint on the
    // table, which matters here because the index is on an expression (lower(email)) and so
    // cannot be named as a target. `returning()` yields no row when the insert was skipped,
    // which detects a duplicate without a second round trip or an error response.
    const inserted = await db
      .insert(waitlist)
      .values({ email, product })
      .onConflictDoNothing()
      .returning({ id: waitlist.id });

    if (inserted.length > 0) {
      res.status(201).json({ ok: true, duplicate: false, id: inserted[0].id });
      return;
    }

    // Already registered. Re-read the existing row so the response carries a stable id
    // rather than null; a concurrent insert may have won between our two statements, in
    // which case the row is there now even though our insert was skipped.
    const [existing] = await db
      .select({ id: waitlist.id })
      .from(waitlist)
      .where(and(eq(sql`lower(${waitlist.email})`, email), eq(waitlist.product, product)))
      .limit(1);

    res.status(201).json({ ok: true, duplicate: true, id: existing?.id ?? null });
  } catch (err) {
    // Deliberately does not log the address: this is a public endpoint handling personal
    // data, and the product name plus error is enough to diagnose.
    logger.error("waitlist_insert_failed", {
      requestId: req.requestId,
      product,
      err,
    });
    next(
      new HttpError(
        500,
        "waitlist_persist_failed",
        "We couldn't save your signup right now. Please email team@larptech.io directly to be added.",
      ),
    );
  }
});

export default router;
