import "../test-env";

import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { sendLeadNotification } from "./email";
import type { LeadInput } from "./validators";

/**
 * The outbound call is stubbed by replacing `globalThis.fetch`. These tests cover the
 * decisions around the call — what gets retried, how long we wait, what key we send — not
 * Resend itself.
 */

const LEAD: LeadInput = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  company: "Analytical Engines",
  serviceInterest: "marketing-ai",
  message: "Attribution question",
};

const BASE = {
  lead: LEAD,
  timeoutMs: 5_000,
  apiKey: "re_test_key",
  from: "LarpTech Leads <leads@larptech.io>",
  to: "team@larptech.io",
};

type Captured = { url: string; init?: RequestInit };

let captured: Captured[] = [];

function stubFetch(impl: (url: string, init?: RequestInit) => Promise<Response>): void {
  globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) =>
    impl(String(input), init)) as typeof fetch;
}

function jsonResponse(status: number, body: unknown = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

afterEach(() => {
  captured = [];
});

describe("sendLeadNotification", () => {
  it("reports success on a 2xx response", async () => {
    stubFetch(async (url, init) => {
      captured.push({ url, init });
      return jsonResponse(200, { id: "abc" });
    });

    const result = await sendLeadNotification({ ...BASE, idempotencyKey: "k/1" });

    assert.deepEqual(result, { ok: true });
    assert.equal(captured[0].url, "https://api.resend.com/emails");
  });

  it("sends the idempotency key as an HTTP header, not in the body", async () => {
    // Resend only deduplicates on the HTTP header; putting the key in the JSON body is a
    // no-op and leaves retries able to double-send.
    stubFetch(async (_url, init) => {
      captured.push({ url: _url, init });
      return jsonResponse(200);
    });

    await sendLeadNotification({ ...BASE, idempotencyKey: "lead-notification/abc-123" });

    const headers = captured[0].init?.headers as Record<string, string>;
    assert.equal(headers["Idempotency-Key"], "lead-notification/abc-123");

    const body = JSON.parse(String(captured[0].init?.body));
    assert.equal(body.Idempotency_Key, undefined);
    assert.equal(body.idempotency_key, undefined);
  });

  it("uses the key it was given on every call, so retries de-duplicate", async () => {
    const keys: (string | undefined)[] = [];
    stubFetch(async (_url, init) => {
      keys.push((init?.headers as Record<string, string>)["Idempotency-Key"]);
      return jsonResponse(503);
    });

    await sendLeadNotification({ ...BASE, idempotencyKey: "stable-key" });
    await sendLeadNotification({ ...BASE, idempotencyKey: "stable-key" });

    assert.deepEqual(keys, ["stable-key", "stable-key"]);
  });


  it("treats 5xx as transient", async () => {
    stubFetch(async () => jsonResponse(500));
    const result = await sendLeadNotification({ ...BASE, idempotencyKey: "k" });
    assert.equal(result.ok, false);
    assert.equal((result as { kind: string }).kind, "transient");
  });

  it("treats 429 rate limiting as transient", async () => {
    stubFetch(async () => jsonResponse(429));
    const result = await sendLeadNotification({ ...BASE, idempotencyKey: "k" });
    assert.equal((result as { kind: string }).kind, "transient");
  });

  it("treats 408 as transient", async () => {
    stubFetch(async () => jsonResponse(408));
    const result = await sendLeadNotification({ ...BASE, idempotencyKey: "k" });
    assert.equal((result as { kind: string }).kind, "transient");
  });

  it("treats 422 as permanent — retrying a malformed request cannot help", async () => {
    stubFetch(async () => jsonResponse(422));
    const result = await sendLeadNotification({ ...BASE, idempotencyKey: "k" });
    assert.equal((result as { kind: string }).kind, "permanent");
  });

  it("treats 401 as permanent", async () => {
    stubFetch(async () => jsonResponse(401));
    const result = await sendLeadNotification({ ...BASE, idempotencyKey: "k" });
    assert.equal((result as { kind: string }).kind, "permanent");
  });

  it("bounds the request with a timeout", async () => {
    // A hung provider must not hang the caller. This is the defect that made a slow Resend
    // hold a visitor's browser open.
    stubFetch(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          const signal = init?.signal as AbortSignal | undefined;
          // AbortSignal.timeout's own timer is unref'd, so it will not keep the event loop
          // alive on its own. Hold it open until the abort lands, or node:test reports the
          // promise as abandoned before the timeout ever fires.
          const keepAlive = setInterval(() => {}, 10);
          const finish = (err: Error) => {
            clearInterval(keepAlive);
            reject(err);
          };
          if (!signal) {
            finish(new Error("no signal passed"));
            return;
          }
          if (signal.aborted) {
            finish(new Error("aborted"));
            return;
          }
          signal.addEventListener("abort", () => finish(new Error("aborted")), { once: true });
        }),
    );

    const started = Date.now();
    const result = await sendLeadNotification({ ...BASE, idempotencyKey: "k", timeoutMs: 120 });
    const elapsed = Date.now() - started;

    assert.equal(result.ok, false);
    assert.equal((result as { kind: string }).kind, "transient");
    assert.ok(elapsed < 2_000, `expected the call to be bounded, took ${elapsed}ms`);
  });

  it("treats a transport failure as transient", async () => {
    stubFetch(async () => {
      throw new Error("ECONNREFUSED");
    });
    const result = await sendLeadNotification({ ...BASE, idempotencyKey: "k" });
    assert.equal(result.ok, false);
    assert.equal((result as { kind: string }).kind, "transient");
  });

  it("sends the lead content in the body and sets reply-to", async () => {
    stubFetch(async (_url, init) => {
      captured.push({ url: _url, init });
      return jsonResponse(200);
    });

    await sendLeadNotification({ ...BASE, idempotencyKey: "k" });

    const body = JSON.parse(String(captured[0].init?.body));
    assert.equal(body.to[0], "team@larptech.io");
    assert.equal(body.reply_to, "ada@example.com");
    assert.match(body.text, /Ada Lovelace/);
    assert.match(body.subject, /marketing-ai/);
  });
});
