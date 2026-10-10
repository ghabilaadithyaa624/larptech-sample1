import "../test-env";

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import tls from "node:tls";
import { after, before, describe, it } from "node:test";
import { Client } from "pg";

import { buildDatabaseConfig } from "./tls";

/**
 * Verifies that the application's TLS configuration actually causes node-postgres to
 * validate the server certificate.
 *
 * Why this test exists: `tls.test.ts` asserts the configuration `buildDatabaseConfig`
 * *produces*. It cannot prove pg consumes it as intended, because pg merges
 * `connectionString` and `ssl` in a surprising order (see the header comment in `tls.ts`).
 * This test drives the real pg client and observes the TLS handshake itself.
 *
 * Method: stand up a TCP listener that speaks just enough of the PostgreSQL protocol to
 * negotiate TLS — it answers the 8-byte SSLRequest with 'S', then upgrades the socket. The
 * listener presents a **self-signed certificate**, so verification must fail unless the
 * client is configured to skip it. We then assert:
 *   1. the PREVIOUS configuration (ssl: { rejectUnauthorized: false }) completes the
 *      handshake — i.e. it would have accepted an impostor server;
 *   2. the CURRENT configuration refuses with a certificate error;
 *   3. supplying the certificate as a trust anchor (sslrootcert) makes it succeed again —
 *      the documented remedy for a private CA, rather than disabling verification.
 *
 * Note on `isProduction: false`: the production config deliberately rejects a loopback
 * database host, so the listener cannot be reached via a production-shaped URL. The URL here
 * therefore carries an explicit `sslmode` and is built with isProduction false. Case 2
 * asserts that the resulting (mode, ssl) tuple is *identical* to what production produces
 * for a remote host, so what this test exercises is exactly what ships. The loopback guard
 * itself is covered in `tls.test.ts`.
 */

const CERT_DIR = path.join(os.tmpdir(), "larptech-tls-test-certs");
const CERT = path.join(CERT_DIR, "server.crt");
const KEY = path.join(CERT_DIR, "server.key");

/** PostgreSQL SSLRequest: 8 bytes, int32 length 8, int32 code 80877103. */
const SSL_REQUEST_CODE = 80877103;

function generateCerts(): void {
  fs.rmSync(CERT_DIR, { recursive: true, force: true });
  fs.mkdirSync(CERT_DIR, { recursive: true });
  execFileSync(
    "openssl",
    [
      "req", "-new", "-x509", "-days", "365", "-nodes",
      "-newkey", "rsa:2048",
      "-keyout", KEY, "-out", CERT,
      "-subj", "/CN=localhost",
      "-addext", "subjectAltName=DNS:localhost,IP:127.0.0.1",
    ],
    { stdio: "ignore" },
  );
  fs.chmodSync(KEY, 0o600);
}

function opensslAvailable(): boolean {
  try {
    execFileSync("openssl", ["version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

type Harness = {
  port: number;
  /** Number of TLS handshakes the server completed (i.e. certificates it got away with). */
  handshakesCompleted: () => number;
  close: () => Promise<void>;
};

function startFakePostgres(): Promise<Harness> {
  const cert = fs.readFileSync(CERT);
  const key = fs.readFileSync(KEY);
  let completed = 0;
  const sockets: tls.TLSSocket[] = [];

  const server = net.createServer((socket) => {
    socket.on("error", () => {});
    socket.once("data", (chunk) => {
      if (chunk.length < 8 || chunk.readInt32BE(4) !== SSL_REQUEST_CODE) {
        socket.destroy();
        return;
      }
      socket.write("S");
      const secure = new tls.TLSSocket(socket, { isServer: true, cert, key });
      sockets.push(secure);
      secure.on("error", () => {});
      secure.on("secure", () => {
        completed += 1;
        secure.destroy();
      });
    });
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address() as net.AddressInfo;
      resolve({
        port,
        handshakesCompleted: () => completed,
        close: () =>
          new Promise<void>((done) => {
            for (const s of sockets) s.destroy();
            server.close(() => done());
          }),
      });
    });
  });
}

function isCertificateError(err: unknown): boolean {
  const code = (err as { code?: string } | null)?.code ?? "";
  return [
    "SELF_SIGNED_CERT_IN_CHAIN",
    "DEPTH_ZERO_SELF_SIGNED_CERT",
    "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
    "CERT_HAS_EXPIRED",
    "ERR_TLS_CERT_ALTNAME_INVALID",
  ].includes(code);
}

async function attemptConnect(opts: {
  connectionString: string;
  ssl?: false | { rejectUnauthorized: boolean };
}): Promise<{ connected: boolean; error?: unknown }> {
  const client = new Client({
    connectionString: opts.connectionString,
    ...(opts.ssl === undefined ? {} : { ssl: opts.ssl }),
    connectionTimeoutMillis: 5_000,
  });
  try {
    await client.connect();
    await client.end().catch(() => {});
    return { connected: true };
  } catch (err) {
    await client.end().catch(() => {});
    return { connected: false, error: err };
  }
}

describe("database TLS — certificate verification is enforced end to end", () => {
  if (!opensslAvailable()) {
    it("skipped: openssl is not available", { skip: true }, () => {});
    return;
  }

  let server: Harness;
  let baseUrl: string;

  before(async () => {
    generateCerts();
    server = await startFakePostgres();
    baseUrl = `postgresql://user:pass@127.0.0.1:${server.port}/db`;
  });

  after(async () => {
    await server?.close();
  });

  it("the PREVIOUS configuration accepted an untrusted certificate (the vulnerability)", async () => {
    // Exactly what src/db/index.ts did before this batch: ssl: { rejectUnauthorized: false }.
    const result = await attemptConnect({
      connectionString: baseUrl,
      ssl: { rejectUnauthorized: false },
    });

    assert.equal(
      isCertificateError(result.error),
      false,
      `handshake must not be rejected when verification is disabled (got ${String((result.error as { code?: string })?.code)})`,
    );
    assert.ok(
      server.handshakesCompleted() > 0,
      "the server must have completed a handshake, proving the certificate was accepted",
    );
  });

  it("the CURRENT configuration rejects an untrusted certificate", async () => {
    const underTest = buildDatabaseConfig({
      databaseUrl: `${baseUrl}?sslmode=require`,
      isProduction: false,
    });

    // Bridge to production: assert the settings exercised below are exactly what a
    // production deployment produces for a real remote database host.
    const productionForRemoteHost = buildDatabaseConfig({
      databaseUrl: "postgresql://user:pass@ep-cool-mist.us-east-2.aws.neon.tech/neondb?sslmode=require",
      isProduction: true,
    });
    assert.equal(underTest.mode, productionForRemoteHost.mode, "mode must match production");
    assert.deepEqual(underTest.ssl, productionForRemoteHost.ssl, "ssl options must match production");

    assert.equal(underTest.mode, "verify-full");
    assert.deepEqual(underTest.ssl, { rejectUnauthorized: true });

    const before = server.handshakesCompleted();
    const result = await attemptConnect({
      connectionString: underTest.connectionString,
      ssl: underTest.ssl,
    });

    assert.equal(result.connected, false, "connection must not succeed against an impostor");
    assert.equal(
      isCertificateError(result.error),
      true,
      `expected a certificate verification failure, got: ${String((result.error as { code?: string })?.code)} ${String((result.error as Error)?.message).slice(0, 120)}`,
    );
    assert.equal(
      server.handshakesCompleted(),
      before,
      "the server must not have completed any further handshake",
    );
  });

  it("supplying the certificate as a trust anchor restores the connection", async () => {
    const cfg = buildDatabaseConfig({
      databaseUrl: `${baseUrl}?sslmode=require`,
      isProduction: false,
      caFile: CERT,
    });

    assert.equal(cfg.mode, "verify-full", "verification stays on — only the trust anchor changes");
    assert.ok(cfg.connectionString.includes("sslrootcert"));

    const before = server.handshakesCompleted();
    const result = await attemptConnect({
      connectionString: cfg.connectionString,
      ssl: cfg.ssl,
    });

    assert.equal(
      isCertificateError(result.error),
      false,
      `with the CA supplied the handshake must not be rejected (got ${String((result.error as { code?: string })?.code)})`,
    );
    assert.ok(
      server.handshakesCompleted() > before,
      "the server should have completed a handshake using the supplied trust anchor",
    );
  });
});
