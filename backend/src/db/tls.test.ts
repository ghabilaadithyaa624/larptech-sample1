import "../../src/test-env";

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildDatabaseConfig, DatabaseConfigError, isLoopbackHost } from "./tls";

const NEON = "postgresql://user:pa%40ss@ep-cool-mist-123456.us-east-2.aws.neon.tech/neondb";
const LOCAL = "postgresql://postgres:postgres@127.0.0.1:5432/app_db";

describe("isLoopbackHost", () => {
  it("recognises loopback addresses", () => {
    assert.equal(isLoopbackHost("127.0.0.1"), true);
    assert.equal(isLoopbackHost("localhost"), true);
    assert.equal(isLoopbackHost("::1"), true);
    assert.equal(isLoopbackHost("db.localhost"), true);
  });

  it("does not treat real hosts as loopback", () => {
    assert.equal(isLoopbackHost("ep-cool-mist.us-east-2.aws.neon.tech"), false);
    assert.equal(isLoopbackHost("db.internal"), false);
  });
});

describe("buildDatabaseConfig — TLS is always verified against a remote host", () => {
  it("upgrades a Neon sslmode=require URL to verify-full", () => {
    const cfg = buildDatabaseConfig({
      databaseUrl: `${NEON}?sslmode=require`,
      isProduction: true,
    });

    assert.equal(cfg.mode, "verify-full");
    assert.ok(cfg.connectionString.includes("sslmode=verify-full"));
    assert.ok(!cfg.connectionString.includes("sslmode=require"));
    assert.deepEqual(cfg.ssl, { rejectUnauthorized: true });
  });

  it("adds verify-full when the URL carries no sslmode at all", () => {
    // This is the defect case: the previous host-name sniffing left this URL with
    // ssl: undefined, i.e. a plaintext connection.
    const cfg = buildDatabaseConfig({ databaseUrl: NEON, isProduction: true });

    assert.equal(cfg.mode, "verify-full");
    assert.ok(cfg.connectionString.includes("sslmode=verify-full"));
  });

  it("upgrades verify-ca and prefer as well, so behaviour cannot depend on pg's aliasing", () => {
    for (const mode of ["prefer", "require", "verify-ca"]) {
      const cfg = buildDatabaseConfig({
        databaseUrl: `${NEON}?sslmode=${mode}`,
        isProduction: true,
      });
      assert.equal(cfg.mode, "verify-full", `sslmode=${mode} should be upgraded`);
    }
  });

  it("does not corrupt other connection string parameters or the password", () => {
    const cfg = buildDatabaseConfig({
      databaseUrl: `${NEON}?sslmode=require&connect_timeout=15`,
      isProduction: true,
    });

    // Percent-encoded password must survive the parse/serialise round trip.
    assert.ok(cfg.connectionString.includes("pa%40ss"));
    assert.ok(cfg.connectionString.includes("connect_timeout=15"));
    assert.ok(cfg.connectionString.includes("ep-cool-mist-123456.us-east-2.aws.neon.tech"));
  });
});

describe("buildDatabaseConfig — refuses to silently weaken production", () => {
  it("rejects sslmode=disable in production", () => {
    assert.throws(
      () => buildDatabaseConfig({ databaseUrl: `${NEON}?sslmode=disable`, isProduction: true }),
      DatabaseConfigError,
    );
  });

  it("rejects sslmode=allow in production", () => {
    assert.throws(
      () => buildDatabaseConfig({ databaseUrl: `${NEON}?sslmode=allow`, isProduction: true }),
      DatabaseConfigError,
    );
  });

  it("rejects a loopback database host in production", () => {
    assert.throws(
      () => buildDatabaseConfig({ databaseUrl: LOCAL, isProduction: true }),
      DatabaseConfigError,
    );
  });

  it("never returns an unverified mode for a remote host in production", () => {
    // Property-style guard: whatever the input, production + remote host always verifies.
    for (const mode of ["prefer", "require", "verify-ca", "verify-full"]) {
      const cfg = buildDatabaseConfig({
        databaseUrl: `${NEON}?sslmode=${mode}`,
        isProduction: true,
      });
      assert.equal(cfg.mode, "verify-full");
      assert.notDeepEqual(cfg.ssl, { rejectUnauthorized: false });
    }
  });
});

describe("buildDatabaseConfig — local development still works", () => {
  it("disables TLS for a loopback host outside production", () => {
    const cfg = buildDatabaseConfig({ databaseUrl: LOCAL, isProduction: false });

    assert.equal(cfg.mode, "disable");
    assert.equal(cfg.ssl, false);
  });

  it("still verifies against a remote host outside production", () => {
    const cfg = buildDatabaseConfig({ databaseUrl: NEON, isProduction: false });

    assert.equal(cfg.mode, "verify-full");
  });

  it("honours an explicit sslmode=disable from a developer", () => {
    const cfg = buildDatabaseConfig({
      databaseUrl: `${NEON}?sslmode=disable`,
      isProduction: false,
    });

    assert.equal(cfg.mode, "disable");
  });
});

describe("buildDatabaseConfig — input validation", () => {
  it("rejects a non-postgres scheme", () => {
    assert.throws(
      () => buildDatabaseConfig({ databaseUrl: "mysql://u:p@host/db", isProduction: false }),
      DatabaseConfigError,
    );
  });

  it("rejects an unparseable URL", () => {
    assert.throws(
      () => buildDatabaseConfig({ databaseUrl: "not a url", isProduction: false }),
      DatabaseConfigError,
    );
  });
});

describe("buildDatabaseConfig — private CA support", () => {
  it("maps DATABASE_SSL_CA_FILE onto sslrootcert in the connection string", () => {
    const cfg = buildDatabaseConfig({
      databaseUrl: NEON,
      isProduction: true,
      caFile: "/etc/ssl/private-ca.pem",
    });

    assert.ok(cfg.connectionString.includes("sslrootcert="));
  });

  it("removes a stale sslrootcert when no CA file is supplied", () => {
    const cfg = buildDatabaseConfig({
      databaseUrl: `${NEON}?sslrootcert=/tmp/old.pem`,
      isProduction: true,
    });

    assert.ok(!cfg.connectionString.includes("sslrootcert"));
  });
});
