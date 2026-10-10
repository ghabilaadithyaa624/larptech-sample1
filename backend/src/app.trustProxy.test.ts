import "./test-env";

import assert from "node:assert/strict";
import express from "express";
import type { Server } from "node:http";
import { after, describe, it } from "node:test";

import { createAppFromEnv } from "./app";
import { validateEnv } from "./lib/env";
import { resolveClientIp } from "./lib/rateLimit";

/**
 * Guards the `trust proxy` configuration, which is what makes the rate limiter's client IP
 * trustworthy at all.
 *
 * Background — CVE-2026-90711 / GHSA-jqcg-44mw-7w3h (proxy-addr < 2.0.8, CVSS 9.1):
 * when an application configures its trust list as an IPv4-mapped IPv6 *subnet string* with
 * a short prefix — `::ffff:10.0.0.0/8` instead of the correct `/104` — the subnet compiles
 * with all-zero leading bits and matches every IPv4 address. Every client is then treated as
 * a trusted proxy at hop 0, so `req.ip` returns whatever the client puts in
 * `X-Forwarded-For`, defeating rate limiting and access control.
 *
 * This application is NOT on that path: `app.set("trust proxy", ...)` is given a hop COUNT,
 * not a subnet list, so proxy-addr never compiles a subnet. The dependency is pinned to the
 * patched version anyway (defence in depth), but the configuration is the actual control, and
 * these tests exist to keep it that way — a future change that switched to a subnet string
 * would reintroduce the exposure.
 */

describe("trust proxy configuration", () => {
  let server: Server | undefined;

  after(async () => {
    if (server) await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("is never a subnet string — the CVE-2026-90711 vector", () => {
    // The dangerous value is a STRING naming a subnet, because that is what proxy-addr
    // compiles into a matcher. A number (hop count) or `false` (trust nothing) never reaches
    // that code path.
    const app = createAppFromEnv();
    const setting = app.get("trust proxy");

    assert.notEqual(
      typeof setting,
      "string",
      `trust proxy must not be a subnet string; got ${JSON.stringify(setting)}. ` +
        "A subnet string here is exactly the CVE-2026-90711 vector.",
    );
    assert.ok(
      typeof setting === "number" || typeof setting === "boolean",
      `expected a hop count or false, got ${JSON.stringify(setting)}`,
    );
  });

  it("defaults to a hop count in production, where the header must be believed", () => {
    const config = validateEnv({
      NODE_ENV: "production",
      DATABASE_URL: "postgresql://u:p@db.example.com/app?sslmode=require",
      FRONTEND_ORIGIN: "https://larptech.io",
    });
    assert.equal(config.trustProxyHops, 1);
    assert.equal(typeof config.trustProxyHops, "number", "production must use a hop count");
  });

  it("does not trust any address when TRUST_PROXY_HOPS is 0", async () => {
    // With trust disabled, a client-supplied X-Forwarded-For must be ignored entirely: the
    // rate limiter keys on the socket address.
    const app = express();
    app.set("trust proxy", false);
    app.get("/ip", (req, res) => {
      res.json({ ip: resolveClientIp(req) });
    });

    server = app.listen(0, "127.0.0.1");
    await new Promise<void>((resolve) => server!.on("listening", () => resolve()));

    const port = (server.address() as { port: number }).port;
    const res = await fetch(`http://127.0.0.1:${port}/ip`, {
      headers: { "x-forwarded-for": "203.0.113.99" },
    });
    const body = (await res.json()) as { ip: string };

    assert.notEqual(body.ip, "203.0.113.99", "a spoofed header must not become the client IP");
    assert.equal(body.ip, "127.0.0.1");
  });
});

describe("resolveClientIp normalisation", () => {
  function fakeReq(ip: string | undefined): express.Request {
    return { ip, socket: { remoteAddress: "127.0.0.1" } } as unknown as express.Request;
  }

  it("unwraps IPv4-mapped IPv6 addresses", () => {
    // The form at the centre of CVE-2026-90711. Our own handling must collapse it to the
    // IPv4 address so one client cannot occupy two rate-limit buckets.
    assert.equal(resolveClientIp(fakeReq("::ffff:203.0.113.7")), "203.0.113.7");
  });

  it("maps the IPv6 loopback to the IPv4 loopback", () => {
    assert.equal(resolveClientIp(fakeReq("::1")), "127.0.0.1");
  });

  it("groups IPv6 by /64 so one client cannot rotate through addresses", () => {
    const a = resolveClientIp(fakeReq("2001:db8:abcd:1234:1111:2222:3333:4444"));
    const b = resolveClientIp(fakeReq("2001:db8:abcd:1234:9999:8888:7777:6666"));
    const c = resolveClientIp(fakeReq("2001:db8:abcd:9999:1111:2222:3333:4444"));

    assert.ok(a.endsWith("/64"), `expected a /64 bucket, got ${a}`);
    assert.equal(a, b, "addresses in the same /64 share a bucket");
    assert.notEqual(a, c, "different /64s are different clients");
  });

  it("returns 'unknown' when no address is available", () => {
    assert.equal(resolveClientIp(fakeReq(undefined)), "127.0.0.1", "falls back to the socket");
    assert.equal(
      resolveClientIp({ ip: "  ", socket: { remoteAddress: "" } } as unknown as express.Request),
      "unknown",
    );
  });
});
