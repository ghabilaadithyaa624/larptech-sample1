import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { leads } from "../db/schema";
import { notifyTeamOfLead } from "../lib/email";
import { leadSchema } from "../lib/validators";

const router = Router();

/**
 * POST /api/leads
 * Validates the contact form payload, inserts a lead into the database,
 * and sends a best-effort email notification to the team.
 */
router.post("/", async (req: Request, res: Response) => {
  const parsed = leadSchema.safeParse(req.body);

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

  const lead = parsed.data;

  try {
    const [inserted] = await db
      .insert(leads)
      .values({
        name: lead.name,
        email: lead.email,
        company: lead.company || null,
        serviceInterest: lead.serviceInterest,
        message: lead.message || null,
        status: "new",
      })
      .returning({ id: leads.id });

    // Best-effort notification — a missing mail key must never lose a lead.
    await notifyTeamOfLead(lead);

    res.status(201).json({ ok: true, id: inserted?.id ?? null });
  } catch (err) {
    console.error("[api/leads] insert failed", err);
    res.status(500).json({
      message:
        "We couldn't save your request right now. Your details are preserved — hit retry, or email team@larptech.io directly.",
    });
  }
});

export default router;
