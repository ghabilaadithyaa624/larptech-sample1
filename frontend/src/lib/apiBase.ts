/**
 * Backend API base URL resolution.
 *
 * The forms previously did this:
 *
 *     const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
 *
 * That is dangerous in production. `NEXT_PUBLIC_*` values are inlined at build time, so if
 * the variable is missing from the Vercel project the built bundle contains the literal
 * string "http://localhost:4000". Every visitor's browser then posts their enquiry to
 * *their own machine*, the request fails, and the lead is lost — with no server-side signal
 * anywhere, because the request never reaches our infrastructure. It also fails differently
 * per visitor, so it is close to impossible to diagnose from support reports.
 *
 * Now: in production a missing value is a hard, build-time failure. A deploy that would
 * silently swallow every enquiry must not be able to succeed.
 *
 * Note that `NEXT_PUBLIC_API_URL` is *public* by definition — it is embedded in the client
 * bundle. It must never carry a secret, and the backend must not rely on it for
 * authentication (it does not; CORS is not access control).
 */

const DEV_FALLBACK = "http://localhost:4000";

function resolveApiBaseUrl(): string {
  // Must be read as a property access: Next.js statically inlines `process.env.NEXT_PUBLIC_*`
  // at build time and cannot follow destructuring or dynamic key access.
  const raw = process.env.NEXT_PUBLIC_API_URL;
  const trimmed = raw?.trim();

  if (trimmed !== undefined && trimmed !== "") {
    // Trim trailing slashes so `${API_BASE_URL}/api/leads` never yields a double slash.
    return trimmed.replace(/\/+$/, "");
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not set. In production the contact and waitlist forms must " +
        "post to a real API origin. Falling back to http://localhost:4000 would send visitor " +
        "submissions to the visitor's own machine and silently lose every lead. Set " +
        "NEXT_PUBLIC_API_URL in the deployment environment and rebuild.",
    );
  }

  if (typeof window !== "undefined") {
    console.warn(
      `NEXT_PUBLIC_API_URL is not set. Falling back to ${DEV_FALLBACK} for local development.`,
    );
  }

  return DEV_FALLBACK;
}

/**
 * Resolved at module load. In production this throws during prerendering, so `next build`
 * fails loudly rather than shipping forms that go nowhere.
 */
export const API_BASE_URL = resolveApiBaseUrl();

export type ParsedApiError = {
  message: string;
  fieldErrors?: Record<string, string>;
};

/**
 * Normalise an error response body from the API.
 *
 * Two shapes are accepted deliberately. The current envelope is
 * `{ error: { code, message, requestId, details?: { fieldErrors } } }`, but the frontend and
 * backend deploy independently (Vercel and Render), so during a release window a new
 * frontend can legitimately talk to an older backend that still replies with the flat
 * `{ message, fieldErrors }` shape — and vice versa. Accepting both keeps forms working
 * across that window instead of showing a generic failure.
 */
export function parseApiError(body: unknown, fallback: string): ParsedApiError {
  if (typeof body !== "object" || body === null) {
    return { message: fallback };
  }

  const record = body as Record<string, unknown>;

  const envelope = record.error;
  if (typeof envelope === "object" && envelope !== null) {
    const inner = envelope as Record<string, unknown>;
    const details = inner.details;
    const fieldErrors =
      typeof details === "object" && details !== null
        ? (details as Record<string, unknown>).fieldErrors
        : undefined;

    return {
      message: typeof inner.message === "string" ? inner.message : fallback,
      fieldErrors:
        typeof fieldErrors === "object" && fieldErrors !== null
          ? (fieldErrors as Record<string, string>)
          : undefined,
    };
  }

  // Legacy flat shape.
  return {
    message: typeof record.message === "string" ? record.message : fallback,
    fieldErrors:
      typeof record.fieldErrors === "object" && record.fieldErrors !== null
        ? (record.fieldErrors as Record<string, string>)
        : undefined,
  };
}
