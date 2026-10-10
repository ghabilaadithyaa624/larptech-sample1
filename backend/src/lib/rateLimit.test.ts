import "../test-env";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Request } from "express";

import type { RateLimitRule } from "./env";
import { MemoryRateLimitStore, rateLimit, resolveClientIp } from "./rateLimit";

const RULE: RateLimitRule = { windowMs: 60_000, max: 3 };

/** Minimal stand-in for an Express request; only the fields under test are meaningful. */
function fakeReq(ip: string | undefined): Request {
  return { ip, socket: { remoteAddress: ip } } as unknown as Request;
}

describe("MemoryRateLimitStore", () => {
  it("allows requests up to the limit and blocks the next one", () => {
    const store = new MemoryRateLimitStore();

    assert.equal(store.consume("k", RULE, 0).allowed, true);
    assert.equal(store.consume("k", RULE, 10).allowed, true);
    assert.equal(store.consume("k", RULE, 20).allowed, true);
    assert.equal(store.consume("k", RULE, 30).allowed, false);

    store.stop();
  });

  it("counts keys independently", () => {
    const store = new MemoryRateLimitStore();

    for (let i = 0; i < 3; i += 1) store.consume("alice", RULE, i);
    assert.equal(store.consume("alice", RULE, 4).allowed, false);
    assert.equal(store.consume("bob", RULE, 4).allowed, true, "a different key has its own budget");

    store.stop();
  });

  it("resets the counter when the window rolls over", () => {
    const store = new MemoryRateLimitStore();

    for (let i = 0; i < 3; i += 1) store.consume("k", RULE, i);
    assert.equal(store.consume("k", RULE, 4).allowed, false);

    // Same key, one full window later.
    const afterWindow = store.consume("k", RULE, RULE.windowMs + 1);
    assert.equal(afterWindow.allowed, true);
    assert.equal(afterWindow.remaining, RULE.max - 1);

    store.stop();
  });

  it("reports remaining budget and reset time", () => {
    const store = new MemoryRateLimitStore();

    const first = store.consume("k", RULE, 0);
    assert.equal(first.remaining, 2);
    assert.equal(first.resetAt, RULE.windowMs);

    const blocked = store.consume("k", { windowMs: 60_000, max: 1 }, 5);
    assert.equal(blocked.allowed, false);
    assert.equal(blocked.remaining, 0);

    store.stop();
  });

  it("never returns a Retry-After below one second", () => {
    const store = new MemoryRateLimitStore();
    const decision = store.consume("k", { windowMs: 10, max: 0 }, 9);

    assert.equal(decision.allowed, false);
    assert.ok(decision.retryAfterSeconds >= 1, "a zero Retry-After is not usable by clients");

    store.stop();
  });
});

describe("resolveClientIp", () => {
  it("uses req.ip, which already applies the trust proxy setting", () => {
    assert.equal(resolveClientIp(fakeReq("203.0.113.7")), "203.0.113.7");
  });

  it("normalises IPv4-mapped IPv6 addresses", () => {
    assert.equal(resolveClientIp(fakeReq("::ffff:203.0.113.7")), "203.0.113.7");
  });

  it("normalises the IPv6 loopback", () => {
    assert.equal(resolveClientIp(fakeReq("::1")), "127.0.0.1");
  });

  it("groups IPv6 addresses by /64 so prefix rotation cannot trivially evade the limit", () => {
    // A single host usually gets a whole /64; keying per address would be useless.
    assert.equal(
      resolveClientIp(fakeReq("2001:db8:abcd:1234:1111:2222:3333:4444")),
      "2001:db8:abcd:1234::/64",
    );
    assert.equal(
      resolveClientIp(fakeReq("2001:db8:abcd:1234:9999:8888:7777:6666")),
      "2001:db8:abcd:1234::/64",
      "two addresses in one /64 must share a bucket",
    );
  });

  it("falls back to the socket address", () => {
    const req = { ip: undefined, socket: { remoteAddress: "198.51.100.9" } } as unknown as Request;
    assert.equal(resolveClientIp(req), "198.51.100.9");
  });

  it("returns a single shared bucket when the address is unknown", () => {
    // Over-limiting is the safe failure mode: it degrades service rather than removing it.
    assert.equal(resolveClientIp(fakeReq("")), "unknown");
  });
});

describe("rateLimit middleware", () => {
  /** Drive the middleware with a canned request and capture what it does. */
  function run(
    req: Request,
    limit: number,
    keyFn?: (r: Request) => string,
  ): { status: number; body: unknown; headers: Record<string, string>; nextCalled: boolean } {
    const store = new MemoryRateLimitStore();
    const middleware = rateLimit({
      name: "test",
      rule: { windowMs: 60_000, max: limit },
      store,
      ...(keyFn === undefined ? {} : { keyFn }),
    });

    const headers: Record<string, string> = {};
    let status = 200;
    let body: unknown;
    let nextCalled = false;

    const res = {
      setHeader: (k: string, v: string) => {
        headers[k] = v;
      },
      status: (s: number) => {
        status = s;
        return res;
      },
      json: (b: unknown) => {
        body = b;
        return res;
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    middleware(req, res as any, (() => {
      nextCalled = true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any);

    store.stop();
    return { status, body, headers, nextCalled };
  }

  it("calls next() while within budget", () => {
    const result = run(fakeReq("203.0.113.7"), 2);

    assert.equal(result.nextCalled, true);
    assert.equal(result.status, 200);
    assert.equal(result.headers["RateLimit-Remaining"], "1");
  });

  it("returns 429 with Retry-After once the budget is exhausted", () => {
    const store = new MemoryRateLimitStore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const middleware = rateLimit({ name: "test", rule: { windowMs: 60_000, max: 1 }, store });

    const headers: Record<string, string> = {};
    let status = 200;
    let body: unknown;
    const res = {
      setHeader: (k: string, v: string) => {
        headers[k] = v;
      },
      status: (s: number) => {
        status = s;
        return res;
      },
      json: (b: unknown) => {
        body = b;
        return res;
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const next = (() => {}) as any;

    middleware(fakeReq("203.0.113.7"), res as any, next);
    middleware(fakeReq("203.0.113.7"), res as any, next);

    assert.equal(status, 429);
    assert.ok(headers["Retry-After"], "Retry-After must be present so clients can back off");
    assert.equal(Number(headers["Retry-After"]) > 0, true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assert.equal((body as any).error.code, "rate_limited");

    store.stop();
  });

  it("keys on the resolved client IP by default", () => {
    const store = new MemoryRateLimitStore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const middleware = rateLimit({ name: "test", rule: { windowMs: 60_000, max: 1 }, store });

    let blockedStatus = 200;
    const res = {
      setHeader: () => {},
      status: (s: number) => {
        blockedStatus = s;
        return res;
      },
      json: () => res,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const next = (() => {}) as any;

    middleware(fakeReq("203.0.113.7"), res as any, next);
    middleware(fakeReq("198.51.100.9"), res as any, next);

    assert.equal(blockedStatus, 200, "a different IP must not inherit another IP's budget");

    store.stop();
  });
});
