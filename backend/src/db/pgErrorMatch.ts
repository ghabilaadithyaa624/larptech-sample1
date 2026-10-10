/**
 * Helpers for asserting on PostgreSQL errors from drizzle.
 *
 * drizzle wraps driver errors: the thrown Error's `message` is
 * `Failed query: <sql>\nparams: ...`, and the underlying PostgreSQL error — the one that
 * names the violated constraint — is attached as `cause`. Matching only against `message`
 * therefore silently passes or fails for the wrong reason, so assertions must look at both.
 */

function errorParts(err: unknown): string[] {
  const parts: string[] = [];
  const e = err as {
    message?: unknown;
    code?: unknown;
    cause?: { message?: unknown; code?: unknown; constraint?: unknown };
  };
  if (typeof e.message === "string") parts.push(e.message);
  if (typeof e.code === "string") parts.push(e.code);
  if (e.cause && typeof e.cause === "object") {
    if (typeof e.cause.message === "string") parts.push(e.cause.message);
    if (typeof e.cause.code === "string") parts.push(e.cause.code);
    if (typeof e.cause.constraint === "string") parts.push(e.cause.constraint);
  }
  return parts;
}

/** True if any part of a (possibly wrapped) PostgreSQL error matches `pattern`. */
export function pgErrorMatches(err: unknown, pattern: RegExp): boolean {
  return errorParts(err).some((part) => pattern.test(part));
}

/**
 * An `assert.rejects` validator that understands drizzle's error wrapping.
 *
 * Usage: `await assert.rejects(promise, rejectsWith(/my_constraint/i));`
 */
export function rejectsWith(pattern: RegExp): (err: unknown) => boolean {
  return (err) => pgErrorMatches(err, pattern);
}
