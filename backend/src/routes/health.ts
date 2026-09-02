import { Router } from "express";
import { db } from "../db";
import { sql } from "drizzle-orm";

const router = Router();

/**
 * GET /api/health
 * Simple liveness check — returns {"ok":true} if the DB connection is healthy.
 */
router.get("/", async (_req, res) => {
  try {
    await db.execute(sql`select 1`);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
});

export default router;
