/**
 * Minimal structured logger.
 *
 * Design constraints:
 *   - One JSON object per line, so Render's log pipeline can parse it without a custom
 *     formatter and operators can grep by requestId.
 *   - Never emit secrets. Redaction is defence in depth: matching is done both on key name
 *     and on known secret *values*, so a credential that leaks into a nested string is
 *     still masked.
 *   - Never emit personal data submitted through the public forms. Call sites must pass
 *     identifiers (lead id) rather than names, emails or message bodies.
 *
 * Deliberately dependency-free: this is ~80 lines and avoids adding a logging framework.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

/**
 * Keys whose values are replaced wholesale before serialisation.
 *
 * Note what is deliberately NOT here: "email" and "message". Redacting by those key names
 * looked safer but mangled ordinary diagnostics — a field-validation message such as
 * `{ email: "Invalid input: expected string, received undefined" }` was masked to
 * "[redacted]", which made real failures much harder to diagnose. Personal data is instead
 * caught by *content* (see EMAIL_PATTERN below) and by call sites not passing it at all.
 */
const REDACTED_KEYS = new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "password",
  "passwd",
  "secret",
  "token",
  "apikey",
  "api_key",
  "resend_api_key",
  "database_url",
]);

const REDACTED_KEY_PATTERN = /(key|secret|token|password|credential|dsn|connectionstring)/i;

const REDACTED_VALUE = "[redacted]";

let minimumLevel: LogLevel = "info";

export function setLogLevel(level: LogLevel): void {
  minimumLevel = level;
}

/** Register literal secret values that must be masked wherever they appear. */
const secretValues = new Set<string>();

export function registerSecretValue(value: string | undefined): void {
  if (value && value.length >= 8) secretValues.add(value);
}

export function clearSecretValues(): void {
  secretValues.clear();
}

/** Matches anything shaped like an email address, wherever it appears in a string. */
const EMAIL_PATTERN = /\b[^\s@,;'"()]+@[^\s@,;'"()]+\.[A-Za-z]{2,}\b/g;

function maskString(value: string): string {
  let out = value;
  for (const secret of secretValues) {
    if (out.includes(secret)) out = out.split(secret).join(REDACTED_VALUE);
  }
  // Content-based PII masking: catches an address that leaks into a nested string or a
  // third-party error body, without suppressing unrelated messages that merely sit under an
  // "email" key.
  out = out.replace(EMAIL_PATTERN, REDACTED_VALUE);
  return out;
}

function sanitise(value: unknown, key?: string, depth = 0): unknown {
  if (depth > 6) return "[truncated]";

  if (key !== undefined) {
    const lower = key.toLowerCase();
    if (REDACTED_KEYS.has(lower) || REDACTED_KEY_PATTERN.test(lower)) return REDACTED_VALUE;
  }

  if (typeof value === "string") return maskString(value);
  if (typeof value === "number" || typeof value === "boolean" || value === null) return value;
  if (value === undefined) return undefined;

  if (value instanceof Date) return value.toISOString();

  if (value instanceof Error) {
    return {
      name: value.name,
      message: maskString(value.message),
      // The stack is emitted to logs only — it is never sent to a client (see httpErrors.ts).
      stack: value.stack === undefined ? undefined : maskString(value.stack),
    };
  }

  if (Array.isArray(value)) {
    return value.slice(0, 50).map((item) => sanitise(item, undefined, depth + 1));
  }

  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = sanitise(v, k, depth + 1);
    }
    return out;
  }

  return String(value);
}

function emit(level: LogLevel, event: string, fields: Record<string, unknown>): void {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[minimumLevel]) return;

  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    event,
    ...(sanitise(fields) as Record<string, unknown>),
  });

  // Errors and warnings go to stderr so Render separates them from request traffic.
  if (level === "error" || level === "warn") {
    // eslint-disable-next-line no-console
    console.error(line);
  } else {
    // eslint-disable-next-line no-console
    console.log(line);
  }
}

export const logger = {
  debug: (event: string, fields: Record<string, unknown> = {}) => emit("debug", event, fields),
  info: (event: string, fields: Record<string, unknown> = {}) => emit("info", event, fields),
  warn: (event: string, fields: Record<string, unknown> = {}) => emit("warn", event, fields),
  error: (event: string, fields: Record<string, unknown> = {}) => emit("error", event, fields),
};

export type Logger = typeof logger;

/**
 * Internal: exported only so `loggingTestHooks.ts` can exercise redaction. Application code
 * should use `logger` and never call this directly.
 */
export { sanitise };
