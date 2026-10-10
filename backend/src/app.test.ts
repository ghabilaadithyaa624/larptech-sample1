import "./test-env";

import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import type { AddressInfo } from "node:net";
import type { Express } from "express";

import { createApp } from "./app";
import { validateEnv, type AppConfig } from "./lib/env";
import { MemoryRateLimitStore } from "./lib/rateLimit";

/**
 * HTTP-level tests against a real listening server.
 *
 * Scope note: there is no database available in this environment, so these tests cover the
 * request-handling surface that sits *in front of* the database — validation, rate limiting,
 * body parsing, CORS, headers and the error contract. Tests that require real persistence
 * (successful lead insert, duplicate waitlist, migration application) belong to the database
 * batch, which provisions a disposable PostgreSQL.
 */

function makeConfig(overrides: Record<string, string> = {}): AppConfig {
  return validateEnv({
    NODE_ENV: "test",
    DATABASE_URL: "postgresql://test:test@127.0.0.1:5432/larptech_test",
    FRONTEND_ORIGIN: "https://app.example.com",
    ...overrides,
  });
}

type Harness = { baseUrl: string; close: () => Promise<void> };

async function startServer(config: AppConfig): Promise<Harness> {
  const app: Express = createApp({ config, rateLimitStore: new MemoryRateLimitStore() });
  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", () => resolve()));
  const { port } = server.address() as AddressInfo;

  return {
    baseUrl: `http://127.0.0.1:${port}`,
    close: () =>
      new Promise<void>((resolve) => {
        server.closeAllConnections?.();
        server.close(() => resolve());
      }),
  };
}

describe("app — error contract", () => {
  let harness: Harness;

  before(async () => {
    harness = await startServer(makeConfig());
  });
  after(async () => {
    await harness.close();
  });

  it("returns JSON (not HTML) for an unknown route, with a stable envelope", async () => {
    const res = await fetch(`${harness.baseUrl}/nope`);

    assert.equal(res.status, 404);
    assert.match(res.headers.get("content-type") ?? "", /application\/json/);

    const body = (await res.json()) as { error: { code: string; requestId: string } };
    assert.equal(body.error.code, "not_found");
    assert.ok(body.error.requestId, "a requestId lets an operator find the log line");
  });

  it("echoes the request id so a user report can be correlated with logs", async () => {
    const res = await fetch(`${harness.baseUrl}/nope`, {
      headers: { "X-Request-Id": "abc123XYZ_-" },
    });

    assert.equal(res.headers.get("x-request-id"), "abc123XYZ_-");
  });

  it("returns 400 with malformed_json for a broken body", async () => {
    const res = await fetch(`${harness.baseUrl}/api/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{not json",
    });

    assert.equal(res.status, 400);
    const body = (await res.json()) as { error: { code: string } };
    assert.equal(body.error.code, "malformed_json");
  });

  it("returns 413 with payload_too_large for an oversized body", async () => {
    // jsonBodyLimit is 16kb; 64kb must be rejected before any parsing work.
    const res = await fetch(`${harness.baseUrl}/api/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "x".repeat(64 * 1024) }),
    });

    assert.equal(res.status, 413);
    const body = (await res.json()) as { error: { code: string } };
    assert.equal(body.error.code, "payload_too_large");
  });

  it("never leaks a stack trace, file path or SQL in an error body", async () => {
    const responses = await Promise.all([
      fetch(`${harness.baseUrl}/nope`),
      fetch(`${harness.baseUrl}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{not json",
      }),
      fetch(`${harness.baseUrl}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Ada Lovelace",
          email: "ada@example.com",
          serviceInterest: "ai-agents",
        }),
      }),
    ]);

    for (const res of responses) {
      const text = await res.text();
      // Match the actual shapes a leak would take, rather than loose substrings: a stack
      // frame is "    at fn (path:line:col)", an internal path contains "node_modules".
      assert.ok(!/\n\s+at\s/.test(text), `stack frame leaked: ${text.slice(0, 200)}`);
      assert.ok(!text.includes("node_modules"), `internal path leaked: ${text.slice(0, 200)}`);
      assert.ok(
        !/insert into|select\s+1|update\s+"|delete from/i.test(text),
        `SQL leaked: ${text.slice(0, 200)}`,
      );
      assert.ok(!text.includes("Error:"), `error type leaked: ${text.slice(0, 200)}`);
    }
  });
});

describe("app — input validation is authoritative on the server", () => {
  let harness: Harness;

  before(async () => {
    harness = await startServer(makeConfig());
  });
  after(async () => {
    await harness.close();
  });

  it("rejects an empty lead payload with per-field messages", async () => {
    const res = await fetch(`${harness.baseUrl}/api/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });

    assert.equal(res.status, 422);
    const body = (await res.json()) as {
      error: { code: string; details: { fieldErrors: Record<string, string> } };
    };
    assert.equal(body.error.code, "validation_failed");
    assert.ok(body.error.details.fieldErrors.name);
    assert.ok(body.error.details.fieldErrors.email);
    assert.ok(body.error.details.fieldErrors.serviceInterest);
  });

  it("rejects a service slug outside the allow-list", async () => {
    const res = await fetch(`${harness.baseUrl}/api/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Ada Lovelace",
        email: "ada@example.com",
        serviceInterest: "not-a-real-service",
      }),
    });

    assert.equal(res.status, 422);
  });

  it("rejects an unknown waitlist product", async () => {
    const res = await fetch(`${harness.baseUrl}/api/waitlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "ada@example.com", product: "free-money" }),
    });

    assert.equal(res.status, 422);
  });

  it("does not parse form-encoded bodies: the urlencoded parser is not mounted", async () => {
    // Removing express.urlencoded also removes the `qs` parser from the request path. A
    // form-encoded submission must therefore not reach the handler with a populated body.
    const res = await fetch(`${harness.baseUrl}/api/waitlist`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "email=ada@example.com&product=crack-it",
    });

    assert.equal(
      res.status,
      422,
      "a form-encoded body must not be accepted as a valid submission",
    );
  });
});

describe("app — rate limiting", () => {
  it("returns 429 with Retry-After after the configured budget is spent", async () => {
    const harness = await startServer(makeConfig({ RATE_LIMIT_LEADS_MAX: "2" }));

    try {
      const statuses: number[] = [];
      for (let i = 0; i < 3; i += 1) {
        const res = await fetch(`${harness.baseUrl}/api/leads`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Deliberately invalid so the request never reaches the database; the limiter
          // runs before the handler regardless.
          body: "{}",
        });
        statuses.push(res.status);
        if (res.status === 429) {
          const body = (await res.json()) as { error: { code: string } };
          assert.equal(body.error.code, "rate_limited");
          assert.ok(res.headers.get("retry-after"), "429 must carry Retry-After");
          assert.match(res.headers.get("content-type") ?? "", /application\/json/);
        }
      }

      assert.deepEqual(statuses.slice(0, 2), [422, 422], "the first two are within budget");
      assert.equal(statuses[2], 429, "the third exceeds the budget");
    } finally {
      await harness.close();
    }
  });

  it("applies separate budgets per endpoint", async () => {
    const harness = await startServer(
      makeConfig({ RATE_LIMIT_LEADS_MAX: "1", RATE_LIMIT_WAITLIST_MAX: "1" }),
    );

    try {
      const post = async (path: string) =>
        (
          await fetch(`${harness.baseUrl}${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "{}",
          })
        ).status;

      assert.equal(await post("/api/leads"), 422);
      assert.equal(await post("/api/leads"), 429, "leads budget is exhausted");
      assert.equal(await post("/api/waitlist"), 422, "waitlist has its own budget");
    } finally {
      await harness.close();
    }
  });

  it("advertises RateLimit headers on allowed requests", async () => {
    const harness = await startServer(makeConfig());

    try {
      const res = await fetch(`${harness.baseUrl}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });

      assert.ok(res.headers.get("ratelimit-limit"));
      assert.ok(res.headers.get("ratelimit-remaining"));
    } finally {
      await harness.close();
    }
  });
});

describe("app — CORS", () => {
  let harness: Harness;

  before(async () => {
    harness = await startServer(makeConfig());
  });
  after(async () => {
    await harness.close();
  });

  it("reflects an allow-listed origin", async () => {
    const res = await fetch(`${harness.baseUrl}/api/health`, {
      headers: { Origin: "https://app.example.com" },
    });

    assert.equal(res.headers.get("access-control-allow-origin"), "https://app.example.com");
    assert.equal(res.headers.get("vary"), "Origin");
  });

  it("omits CORS headers for a disallowed origin and does not 500", async () => {
    // Previously a disallowed origin produced callback(new Error(...)), which fell through
    // to Express's default handler: an HTML 500, with a stack trace outside production.
    //
    // Deliberately targets a route that does not touch the database, so the status reflects
    // CORS handling and not the absent test database.
    const res = await fetch(`${harness.baseUrl}/api/leads`, {
      method: "POST",
      headers: { Origin: "https://evil.example", "Content-Type": "application/json" },
      body: "{}",
    });

    assert.equal(res.headers.get("access-control-allow-origin"), null);
    assert.equal(res.status, 422, "the request is processed but the browser blocks the response");
  });

  it("allows requests with no Origin header (server-to-server, health checks)", async () => {
    const res = await fetch(`${harness.baseUrl}/api/health`);

    assert.notEqual(res.status, 403);
  });

  it("does not enable credentialed CORS, since no cookie or session exists", async () => {
    const res = await fetch(`${harness.baseUrl}/api/health`, {
      headers: { Origin: "https://app.example.com" },
    });

    assert.equal(res.headers.get("access-control-allow-credentials"), null);
  });
});

describe("app — security headers", () => {
  let harness: Harness;

  before(async () => {
    harness = await startServer(makeConfig());
  });
  after(async () => {
    await harness.close();
  });

  it("sets baseline hardening headers on every response", async () => {
    const res = await fetch(`${harness.baseUrl}/api/health`);

    assert.equal(res.headers.get("x-content-type-options"), "nosniff");
    assert.equal(res.headers.get("x-frame-options"), "DENY");
    assert.equal(res.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
    assert.equal(res.headers.get("cross-origin-opener-policy"), "same-origin");
    assert.ok(res.headers.get("content-security-policy")?.includes("default-src 'none'"));
  });

  it("does not advertise the framework", async () => {
    const res = await fetch(`${harness.baseUrl}/api/health`);

    assert.equal(res.headers.get("x-powered-by"), null);
  });

  it("omits HSTS outside production, where the server is plain HTTP", async () => {
    const res = await fetch(`${harness.baseUrl}/api/health`);

    assert.equal(res.headers.get("strict-transport-security"), null);
  });
});
