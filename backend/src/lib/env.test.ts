import "../test-env";

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ConfigError, describeConfig, validateEnv } from "./env";

/** Minimal environment that must validate cleanly. */
const BASE = {
  NODE_ENV: "production",
  DATABASE_URL: "postgresql://user:pass@ep-cool-mist.us-east-2.aws.neon.tech/neondb",
  FRONTEND_ORIGIN: "https://larptech.io",
} as const;

describe("validateEnv — happy path", () => {
  it("accepts a minimal valid production environment", () => {
    const config = validateEnv({ ...BASE });

    assert.equal(config.isProduction, true);
    assert.equal(config.port, 4000, "PORT should fall back to 4000");
    assert.deepEqual(config.allowedOrigins, ["https://larptech.io"]);
    assert.equal(config.trustProxyHops, 1, "production should default to 1 proxy hop");
  });

  it("accepts several comma separated origins for Vercel preview deployments", () => {
    const config = validateEnv({
      ...BASE,
      FRONTEND_ORIGIN:
        "https://larptech.io, https://larptech-git-feature.vercel.app ,https://preview.example.com",
    });

    assert.deepEqual(config.allowedOrigins, [
      "https://larptech.io",
      "https://larptech-git-feature.vercel.app",
      "https://preview.example.com",
    ]);
  });

  it("strips a trailing slash so CORS matching is not silently broken", () => {
    // An origin with a trailing slash would never equal the browser's Origin header, which
    // historically blocked every submission with no server-side error.
    const config = validateEnv({ ...BASE, FRONTEND_ORIGIN: "https://larptech.io/" });

    assert.deepEqual(config.allowedOrigins, ["https://larptech.io"]);
  });
});

describe("validateEnv — production misconfiguration fails loudly", () => {
  it("rejects a missing DATABASE_URL", () => {
    assert.throws(
      () => validateEnv({ ...BASE, DATABASE_URL: "" }),
      (err: unknown) =>
        err instanceof ConfigError && err.issues.some((i) => i.includes("DATABASE_URL")),
    );
  });

  it("rejects a missing FRONTEND_ORIGIN, naming the consequence", () => {
    // The exact failure this guards against: CORS silently defaulting to localhost.
    assert.throws(
      () => validateEnv({ ...BASE, FRONTEND_ORIGIN: "" }),
      (err: unknown) =>
        err instanceof ConfigError &&
        err.issues.some((i) => i.includes("FRONTEND_ORIGIN") && i.includes("CORS")),
    );
  });

  it("rejects a loopback FRONTEND_ORIGIN in production", () => {
    assert.throws(
      () => validateEnv({ ...BASE, FRONTEND_ORIGIN: "http://localhost:3000" }),
      (err: unknown) =>
        err instanceof ConfigError && err.issues.some((i) => i.includes("loopback")),
    );
  });

  it("rejects RATE_LIMIT_DISABLED in production", () => {
    assert.throws(
      () => validateEnv({ ...BASE, RATE_LIMIT_DISABLED: "1" }),
      (err: unknown) =>
        err instanceof ConfigError && err.issues.some((i) => i.includes("RATE_LIMIT_DISABLED")),
    );
  });

  it("reports every problem at once rather than only the first", () => {
    try {
      validateEnv({ NODE_ENV: "production" });
      assert.fail("expected ConfigError");
    } catch (err) {
      assert.ok(err instanceof ConfigError);
      assert.ok(err.issues.length >= 2, `expected multiple issues, got ${err.issues.length}`);
    }
  });
});

describe("validateEnv — value validation", () => {
  it("rejects a non-numeric PORT", () => {
    assert.throws(
      () => validateEnv({ ...BASE, PORT: "http" }),
      (err: unknown) => err instanceof ConfigError && err.issues.some((i) => i.includes("PORT")),
    );
  });

  it("rejects an out-of-range PORT", () => {
    assert.throws(
      () => validateEnv({ ...BASE, PORT: "99999" }),
      (err: unknown) => err instanceof ConfigError && err.issues.some((i) => i.includes("PORT")),
    );
  });

  it("rejects a FRONTEND_ORIGIN with a path", () => {
    assert.throws(
      () => validateEnv({ ...BASE, FRONTEND_ORIGIN: "https://larptech.io/app" }),
      (err: unknown) =>
        err instanceof ConfigError && err.issues.some((i) => i.includes("FRONTEND_ORIGIN")),
    );
  });

  it("rejects a non-http scheme", () => {
    assert.throws(
      () => validateEnv({ ...BASE, FRONTEND_ORIGIN: "ftp://larptech.io" }),
      (err: unknown) =>
        err instanceof ConfigError && err.issues.some((i) => i.includes("http or https")),
    );
  });

  it("rejects a non-postgres DATABASE_URL scheme", () => {
    assert.throws(
      () => validateEnv({ ...BASE, DATABASE_URL: "mysql://u:p@host/db" }),
      (err: unknown) => err instanceof ConfigError && err.issues.some((i) => i.includes("scheme")),
    );
  });
});

describe("validateEnv — rate limit configuration", () => {
  it("applies documented defaults", () => {
    const config = validateEnv({ ...BASE });

    assert.equal(config.rateLimits.leads.max, 10);
    assert.equal(config.rateLimits.leads.windowMs, 15 * 60_000);
    assert.equal(config.rateLimits.waitlist.max, 10);
    assert.equal(config.rateLimits.health.max, 120);
  });

  it("honours overrides", () => {
    const config = validateEnv({ ...BASE, RATE_LIMIT_LEADS_MAX: "2", RATE_LIMIT_LEADS_WINDOW_MS: "1000" });

    assert.equal(config.rateLimits.leads.max, 2);
    assert.equal(config.rateLimits.leads.windowMs, 1000);
  });

  it("rejects a nonsensical limit", () => {
    assert.throws(
      () => validateEnv({ ...BASE, RATE_LIMIT_LEADS_MAX: "0" }),
      (err: unknown) =>
        err instanceof ConfigError && err.issues.some((i) => i.includes("RATE_LIMIT_LEADS_MAX")),
    );
  });
});

describe("describeConfig — safe for logs", () => {
  it("never renders credential values", () => {
    const config = validateEnv({
      ...BASE,
      RESEND_API_KEY: "re_SUPER_SECRET_VALUE_1234567890",
    });
    const serialised = JSON.stringify(describeConfig(config));

    assert.ok(!serialised.includes("re_SUPER_SECRET"), "API key must not appear in the summary");
    assert.ok(!serialised.includes("pass"), "database password must not appear in the summary");
  });

  it("reports only whether the key is configured, not its value", () => {
    const withoutKey = describeConfig(validateEnv({ ...BASE }));
    const withKey = describeConfig(validateEnv({ ...BASE, RESEND_API_KEY: "re_abc123456789" }));

    assert.equal(withoutKey.resendConfigured, false);
    assert.equal(withKey.resendConfigured, true);
  });

  it("reports the database host but not the credentials", () => {
    const summary = describeConfig(validateEnv({ ...BASE }));

    assert.equal(summary.databaseHost, "ep-cool-mist.us-east-2.aws.neon.tech");
  });
});
