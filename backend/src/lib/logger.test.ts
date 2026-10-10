import "../test-env";

import assert from "node:assert/strict";
import { describe, it, afterEach } from "node:test";

import { clearSecretValues, registerSecretValue, sanitiseForTest } from "./loggingTestHooks";

/**
 * Behavioural tests for log redaction.
 *
 * The property that matters: a log line must never carry a credential or a submitted email
 * address, while still carrying enough detail to diagnose a failure. Over-redaction is a
 * real failure mode too — an early version masked any value under an "email" key, which
 * turned field-validation messages into "[redacted]" and made debugging much harder.
 */
describe("log redaction", () => {
  afterEach(() => {
    clearSecretValues();
  });

  it("masks an email address wherever it appears in a nested string", () => {
    const result = sanitiseForTest({
      context: "lead from ada.lovelace@example.com was rejected",
    }) as Record<string, string>;

    assert.ok(!JSON.stringify(result).includes("ada.lovelace@example.com"));
    assert.ok(JSON.stringify(result).includes("[redacted]"));
  });

  it("masks a registered secret value", () => {
    registerSecretValue("re_abcdefghijklmnop");
    const result = sanitiseForTest({
      note: "calling Resend with re_abcdefghijklmnop failed",
    }) as Record<string, string>;

    assert.ok(!JSON.stringify(result).includes("re_abcdefghijklmnop"));
  });

  it("masks a credential embedded in a database URL", () => {
    registerSecretValue("postgresql://user:hunter2@db.example.com/app");
    const result = sanitiseForTest({
      err: "connect ECONNREFUSED for postgresql://user:hunter2@db.example.com/app",
    }) as Record<string, string>;

    assert.ok(!JSON.stringify(result).includes("hunter2"));
  });

  it("redacts values under credential-shaped keys", () => {
    const result = sanitiseForTest({
      authorization: "Bearer abc",
      password: "swordfish",
      resend_api_key: "re_key",
    }) as Record<string, string>;

    assert.equal(result.authorization, "[redacted]");
    assert.equal(result.password, "[redacted]");
    assert.equal(result.resend_api_key, "[redacted]");
  });

  it("does NOT mangle a field-validation message that merely sits under an email key", () => {
    // This is the regression the content-based approach fixes: key-name redaction turned
    // useful validation messages into "[redacted]".
    const result = sanitiseForTest({
      fieldErrors: { email: "Invalid input: expected string, received undefined" },
    }) as { fieldErrors: Record<string, string> };

    assert.equal(
      result.fieldErrors.email,
      "Invalid input: expected string, received undefined",
      "diagnostic messages must survive redaction",
    );
  });

  it("keeps a stack trace available for diagnosis (logs only, never responses)", () => {
    const result = sanitiseForTest({ err: new Error("boom") }) as {
      err: { name: string; message: string; stack: string };
    };

    assert.equal(result.err.name, "Error");
    assert.equal(result.err.message, "boom");
    assert.ok(result.err.stack.includes("boom"));
  });

  it("truncates very deeply nested structures rather than hanging", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let node: any = { leaf: "value" };
    for (let i = 0; i < 20; i += 1) node = { nested: node };

    const result = JSON.stringify(sanitiseForTest(node));

    assert.ok(result.includes("[truncated]"));
  });
});
