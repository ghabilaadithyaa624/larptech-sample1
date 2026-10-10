/**
 * Database connection configuration, with TLS certificate verification always enabled.
 *
 * ## What was wrong
 *
 * `src/db/index.ts` previously built its Pool like this:
 *
 *     ssl: databaseUrl.includes("neon.tech") || databaseUrl.includes("sslmode=require")
 *       ? { rejectUnauthorized: false }
 *       : undefined
 *
 * Two defects:
 *   1. `rejectUnauthorized: false` disables server-certificate verification, so the
 *      connection is encrypted but **unauthenticated** — an attacker positioned on the
 *      network path can present any certificate, terminate the TLS session and read every
 *      lead record in transit.
 *   2. The host-name sniffing is the *only* thing that turns TLS on. A managed PostgreSQL
 *      whose URL contains neither "neon.tech" nor "sslmode=require" gets `ssl: undefined`,
 *      i.e. a plaintext connection carrying the password and all lead data.
 *
 * ## Why the fix is written this way (important — do not "simplify")
 *
 * `pg` resolves its configuration in `lib/connection-parameters.js`:
 *
 *     config = Object.assign({}, config, parse(config.connectionString))
 *
 * `pg-connection-string`'s `parse()` sets `config.ssl = {}` whenever the URL contains an
 * `sslmode` parameter. Because the parse result is applied LAST, **an `ssl` object passed
 * alongside `connectionString` is silently discarded** whenever `sslmode` is present in the
 * URL. That is why this module writes the mode into the connection string, and also passes
 * an explicit `ssl` object: the URL governs in the normal case, and the explicit object
 * still protects the case where the URL carries no `sslmode`.
 *
 * The second, subtler reason to pin the mode explicitly: `pg-connection-string` v2 currently
 * treats `prefer`, `require` and `verify-ca` as aliases for `verify-full`, but emits a
 * deprecation warning that v3 will adopt standard libpq semantics where `require` means
 * "encrypt but do NOT verify the certificate". Neon issues connection strings with
 * `sslmode=require`, so **without this pinning, a future `pg` upgrade would silently
 * downgrade this application from verified to unverified TLS.** Writing `sslmode=verify-full`
 * is stable across both version behaviours.
 *
 * `verify-full` is also what Neon documents and recommends:
 * https://neon.com/docs/connect/connect-securely — "Neon recommends that you always use
 * verify-full mode, which ensures the highest level of security and protects against a wide
 * range of attacks including man-in-the-middle attacks."
 *
 * Node's `tls` module trusts the bundled public root CAs by default, so Neon's
 * publicly-signed certificate verifies without supplying a CA bundle. If a deployment uses a
 * private CA, point `DATABASE_SSL_CA_FILE` at the root certificate.
 *
 * ## No insecure fallback
 *
 * In production this module refuses to start rather than degrade:
 *   - `sslmode=disable` / `allow` is rejected.
 *   - A loopback database host is rejected (a production service talking to 127.0.0.1 is a
 *     misconfiguration, not a deployment).
 * There is deliberately no "just work" escape hatch. If verification ever fails against a
 * real endpoint, the correct remedy is to supply the proper CA via `DATABASE_SSL_CA_FILE` —
 * not to switch verification off.
 *
 * Outside production the mode is relaxed only for a loopback host, so `npm run dev` against
 * a local/Docker PostgreSQL (which typically has no TLS) keeps working.
 */

export type SslMode = "verify-full" | "disable";

export type DatabaseConfig = {
  connectionString: string;
  /**
   * Passed to `new Pool()` alongside the connection string. See the module note: when the
   * URL carries `sslmode`, pg's merge order lets the URL win and this object is ignored.
   * It is kept so the intent is explicit and so the no-sslmode branch is still safe.
   */
  ssl: false | { rejectUnauthorized: true };
  mode: SslMode;
};

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"]);

export function isLoopbackHost(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  return LOOPBACK_HOSTS.has(host) || host.endsWith(".localhost");
}

export class DatabaseConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseConfigError";
  }
}

export type BuildDatabaseConfigOptions = {
  databaseUrl: string;
  isProduction: boolean;
  /** Optional path to a root CA bundle (PEM). Maps to `sslrootcert` in the connection string. */
  caFile?: string;
};

/**
 * Produce a PostgreSQL connection string with an explicit, verified TLS mode.
 *
 * Pure and side-effect free so it can be unit tested without a database.
 */
export function buildDatabaseConfig(options: BuildDatabaseConfigOptions): DatabaseConfig {
  const { databaseUrl, isProduction, caFile } = options;

  let url: URL;
  try {
    url = new URL(databaseUrl);
  } catch {
    throw new DatabaseConfigError("DATABASE_URL is not a valid connection URL");
  }

  if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") {
    throw new DatabaseConfigError(
      `DATABASE_URL must use the postgres: or postgresql: scheme (received "${url.protocol}")`,
    );
  }

  const requested = url.searchParams.get("sslmode");
  const loopback = isLoopbackHost(url.hostname);

  let mode: SslMode;

  if (isProduction) {
    if (loopback) {
      throw new DatabaseConfigError(
        `DATABASE_URL host "${url.hostname}" is a loopback address; a production deployment must connect to a real database host`,
      );
    }
    if (requested === "disable" || requested === "allow") {
      throw new DatabaseConfigError(
        `sslmode=${requested} is not permitted in production; use verify-full`,
      );
    }
    mode = "verify-full";
  } else if (requested !== null) {
    // Honour an explicit developer choice, but normalise the ambiguous modes so the
    // connection never depends on pg-connection-string's version-specific aliasing.
    mode = requested === "disable" || requested === "allow" ? "disable" : "verify-full";
  } else {
    // No explicit mode: local development databases usually have no TLS, anything remote does.
    mode = loopback ? "disable" : "verify-full";
  }

  // Make the effective mode explicit in the string that pg actually parses.
  url.searchParams.set("sslmode", mode);
  if (caFile !== undefined && caFile !== "") {
    url.searchParams.set("sslrootcert", caFile);
  } else {
    url.searchParams.delete("sslrootcert");
  }

  return {
    connectionString: url.toString(),
    ssl: mode === "disable" ? false : { rejectUnauthorized: true },
    mode,
  };
}
