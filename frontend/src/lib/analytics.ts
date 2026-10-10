"use client";

import { hasAnalyticsConsent } from "./consent";

/**
 * Analytics shim.
 *
 * Events are forwarded to `gtag()` only when the visitor has granted consent. Previously
 * this forwarded whenever `window.gtag` happened to exist, which made "is analytics
 * permitted?" depend on whether a script had loaded rather than on what the visitor chose.
 *
 * Two deliberate properties:
 *  - Failing silently is correct. Analytics is not part of the product; a visitor must never
 *    see an error, or lose a form submission, because a tracking call failed.
 *  - In development, events are logged instead of sent, so the flow can be exercised without
 *    a GA property and without sending real traffic anywhere.
 */
export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
): void {
  try {
    if (!hasAnalyticsConsent()) {
      if (process.env.NODE_ENV !== "production") {
        console.info("[analytics:skipped — no consent]", name, params ?? {});
      }
      return;
    }

    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (typeof w.gtag !== "function") {
      // Consent granted but the tag has not finished loading yet. Drop the event rather
      // than queueing it: a queued event fired after a later withdrawal of consent would
      // be harder to explain than a missing one.
      return;
    }

    w.gtag("event", name, params);
  } catch {
    /* analytics must never break the user flow */
  }
}
