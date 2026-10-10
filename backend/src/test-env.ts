/**
 * Test bootstrap. Import this FIRST in every test file (before any module that reads
 * configuration) so a valid environment is in place before the app graph — and therefore the
 * database pool — is constructed.
 *
 * The pool is lazy, so these credentials are never actually dialled; they only have to be
 * well-formed enough to pass validation. The loopback host keeps TLS off in tests (see
 * `db/tls.ts`), which is exactly what a local database would do.
 */

const defaults: Record<string, string> = {
  NODE_ENV: "test",
  DATABASE_URL: "postgresql://test:test@127.0.0.1:5432/larptech_test",
  FRONTEND_ORIGIN: "https://app.example.com",
};

for (const [key, value] of Object.entries(defaults)) {
  if (process.env[key] === undefined || process.env[key] === "") {
    process.env[key] = value;
  }
}

export {};
