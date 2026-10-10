"use client";

/**
 * Consent state for analytics cookies.
 *
 * Nothing is tracked until the visitor says so. The default is therefore DENIED, not
 * "granted until they object" — loading an analytics tag on page load and asking
 * afterwards is the pattern that GDPR and the ePrivacy Directive reject, and it is what
 * the previous implementation did.
 *
 * These are pure helpers with no React dependency so they can be reasoned about (and
 * tested) on their own. All storage access is defensive: `localStorage` throws in Safari
 * private browsing and when cookies are blocked, and a consent banner must never break
 * the page it appears on.
 */

export const CONSENT_STORAGE_KEY = "larptech.consent.v1";
/** Dispatched on `window` when the choice changes, so the analytics loader can react. */
export const CONSENT_CHANGE_EVENT = "larptech:consentchange";

export type ConsentDecision = "granted" | "denied";
/** `unknown` means the visitor has not answered yet. */
export type ConsentState = ConsentDecision | "unknown";

export type StoredConsent = {
  analytics: ConsentDecision;
  /** ISO timestamp of when the choice was made. */
  decidedAt: string;
  /** Bumping this invalidates choices recorded under an older policy. */
  version: number;
};

export const CONSENT_VERSION = 1;

function isDecision(value: unknown): value is ConsentDecision {
  return value === "granted" || value === "denied";
}

/**
 * Parse a raw stored value.
 *
 * Anything malformed, or recorded under a different consent version, is treated as
 * `unknown` — which means we ask again rather than guessing. Guessing "granted" from a
 * corrupted value would be the one failure mode that matters.
 */
export function parseStoredConsent(raw: string | null): StoredConsent | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object") return null;
    const record = parsed as Partial<StoredConsent>;
    if (record.version !== CONSENT_VERSION) return null;
    if (!isDecision(record.analytics)) return null;
    if (typeof record.decidedAt !== "string") return null;
    return { analytics: record.analytics, decidedAt: record.decidedAt, version: CONSENT_VERSION };
  } catch {
    return null;
  }
}

export function getStoredConsent(): StoredConsent | null {
  try {
    return parseStoredConsent(window.localStorage.getItem(CONSENT_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function storeConsent(analytics: ConsentDecision): StoredConsent {
  const record: StoredConsent = {
    analytics,
    decidedAt: new Date().toISOString(),
    version: CONSENT_VERSION,
  };
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Storage unavailable: the choice still applies for this page view, it just will not
    // be remembered. Not worth surfacing to the visitor.
  }
  return record;
}

export function currentConsent(): ConsentState {
  return getStoredConsent()?.analytics ?? "unknown";
}

/** True only when analytics has been explicitly granted. */
export function hasAnalyticsConsent(): boolean {
  return currentConsent() === "granted";
}

/**
 * Subscribe to consent changes, for `useSyncExternalStore`.
 *
 * Listens for our own change event (same tab) and for `storage` (another tab deciding),
 * so a banner open in two tabs does not end up showing a stale answer in one of them.
 */
export function subscribeToConsent(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
