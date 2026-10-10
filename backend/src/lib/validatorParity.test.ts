import "../test-env";

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  leadSchema as backendLeadSchema,
  normaliseEmail as backendNormaliseEmail,
  SERVICE_SLUGS as BACKEND_SERVICES,
  waitlistSchema as backendWaitlistSchema,
  WAITLIST_PRODUCTS as BACKEND_PRODUCTS,
} from "./validators";

/**
 * Keeps the frontend and backend validation rules in step.
 *
 * `frontend/src/lib/validators.ts` is a copy of this module. It exists because the two
 * packages cannot easily share code, but the copy had already drifted once: the backend
 * gained `normaliseEmail` and `waitlistSchema` in the database batch and the frontend did
 * not, so the waitlist form was validating with its own inline regex while the API applied
 * different rules.
 *
 * The backend copy is authoritative — a caller can bypass client validation entirely by
 * posting to the API directly — so this test asserts the frontend agrees with it rather
 * than the other way round. Divergence fails CI instead of surfacing as a confusing
 * "your input is invalid" against a form the user thought was correct.
 *
 * The import reaches across package boundaries on purpose; this is a monorepo and both
 * files live in it. Test files are excluded from `tsconfig.json`, so no build artefact
 * depends on this path.
 */
import {
  leadSchema as frontendLeadSchema,
  normaliseEmail as frontendNormaliseEmail,
  SERVICE_SLUGS as FRONTEND_SERVICES,
  waitlistSchema as frontendWaitlistSchema,
  WAITLIST_PRODUCTS as FRONTEND_PRODUCTS,
  // @ts-expect-error -- resolved at test time by tsx; not part of the backend build graph.
} from "../../../frontend/src/lib/validators";

const EMAILS = [
  "ada@example.com",
  "  Ada@Example.COM  ",
  "\tGRACE@Example.co \n",
  "not-an-email",
  "missing@tld",
  "a@b",
  "",
  "   ",
  "a.b+c@sub.example.co.uk",
  "user@[not-a-domain]",
];

const VALID_LEAD = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  company: "Analytical Engines",
  serviceInterest: "marketing-ai",
  message: "Attribution question",
};

describe("frontend/backend validator parity", () => {
  it("agrees on the allowed service slugs", () => {
    assert.deepEqual([...FRONTEND_SERVICES], [...BACKEND_SERVICES]);
  });

  it("agrees on the allowed waitlist products", () => {
    assert.deepEqual([...FRONTEND_PRODUCTS], [...BACKEND_PRODUCTS]);
  });

  it("normalises email identically", () => {
    for (const email of EMAILS) {
      assert.equal(
        frontendNormaliseEmail(email),
        backendNormaliseEmail(email),
        `normaliseEmail disagreed for ${JSON.stringify(email)}`,
      );
    }
  });

  it("accepts and rejects the same waitlist submissions", () => {
    for (const email of EMAILS) {
      for (const product of BACKEND_PRODUCTS) {
        const fe = frontendWaitlistSchema.safeParse({ email, product });
        const be = backendWaitlistSchema.safeParse({ email, product });

        assert.equal(fe.success, be.success, `waitlist verdict differs for ${JSON.stringify(email)}`);
        if (fe.success && be.success) {
          assert.deepEqual(fe.data, be.data, `waitlist output differs for ${JSON.stringify(email)}`);
        }
      }
    }
  });

  it("rejects an unknown product on both sides", () => {
    const fe = frontendWaitlistSchema.safeParse({ email: "a@b.co", product: "time-machine" });
    const be = backendWaitlistSchema.safeParse({ email: "a@b.co", product: "time-machine" });
    assert.equal(fe.success, be.success);
    assert.equal(fe.success, false, "an unknown product must be rejected");
  });

  it("accepts and rejects the same lead submissions", () => {
    const cases: Array<Record<string, unknown>> = [
      VALID_LEAD,
      { ...VALID_LEAD, email: "  Ada@Example.COM  " },
      { ...VALID_LEAD, email: "nope" },
      { ...VALID_LEAD, name: "A" }, // too short
      { ...VALID_LEAD, serviceInterest: "telepathy" },
      { ...VALID_LEAD, message: "x".repeat(2001) }, // too long
      { ...VALID_LEAD, company: "x".repeat(121) },
    ];

    for (const candidate of cases) {
      const fe = frontendLeadSchema.safeParse(candidate);
      const be = backendLeadSchema.safeParse(candidate);
      assert.equal(
        fe.success,
        be.success,
        `lead verdict differs for ${JSON.stringify(candidate).slice(0, 80)}`,
      );
      if (fe.success && be.success) {
        assert.deepEqual(fe.data, be.data, "lead normalisation differs");
      }
    }
  });
});
