import "../test-env";

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { leadSchema, normaliseEmail, waitlistSchema } from "./validators";

describe("normaliseEmail", () => {
  it("lower-cases the address", () => {
    assert.equal(normaliseEmail("Ada@Example.COM"), "ada@example.com");
  });

  it("trims surrounding whitespace", () => {
    assert.equal(normaliseEmail("  ada@example.com  "), "ada@example.com");
  });

  it("trims and lower-cases together", () => {
    assert.equal(normaliseEmail("  Ada@Example.COM\n"), "ada@example.com");
  });

  it("is idempotent — normalising twice changes nothing", () => {
    const once = normaliseEmail("  Ada@Example.COM ");
    assert.equal(normaliseEmail(once), once);
  });

  /**
   * Documents a deliberate decision. Stripping dots or +tags is the usual "clever" next step
   * and it is wrong here: some providers treat those as distinct mailboxes, so a uniqueness
   * rule built on stripping them would reject genuinely different people.
   */
  it("preserves dots and plus-tags in the local part", () => {
    assert.equal(normaliseEmail("Ada.Lovelace+news@Example.com"), "ada.lovelace+news@example.com");
  });
});

describe("leadSchema", () => {
  const valid = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    company: "Analytical Engines",
    serviceInterest: "marketing-ai",
    message: "Hello",
  };

  it("normalises the email as part of validation", () => {
    const parsed = leadSchema.safeParse({ ...valid, email: "  Ada@Example.COM  " });
    assert.equal(parsed.success, true);
    assert.equal(parsed.data?.email, "ada@example.com");
  });

  it("trims the name", () => {
    const parsed = leadSchema.safeParse({ ...valid, name: "  Ada Lovelace  " });
    assert.equal(parsed.success, true);
    assert.equal(parsed.data?.name, "Ada Lovelace");
  });

  it("rejects an invalid email", () => {
    const parsed = leadSchema.safeParse({ ...valid, email: "not-an-email" });
    assert.equal(parsed.success, false);
  });

  it("rejects an unknown service slug", () => {
    const parsed = leadSchema.safeParse({ ...valid, serviceInterest: "telepathy" });
    assert.equal(parsed.success, false);
  });
});

describe("waitlistSchema", () => {
  it("normalises the email as part of validation", () => {
    const parsed = waitlistSchema.safeParse({ email: "  Ada@Example.COM ", product: "crack-it" });
    assert.equal(parsed.success, true);
    assert.equal(parsed.data?.email, "ada@example.com");
  });

  it("accepts both known products", () => {
    for (const product of ["crack-it", "meeting-assistant"]) {
      const parsed = waitlistSchema.safeParse({ email: "ada@example.com", product });
      assert.equal(parsed.success, true, `${product} should be accepted`);
    }
  });

  it("rejects an unknown product", () => {
    const parsed = waitlistSchema.safeParse({ email: "ada@example.com", product: "time-machine" });
    assert.equal(parsed.success, false);
  });
});
