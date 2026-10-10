"use client";

import { useSyncExternalStore } from "react";

import {
  CONSENT_CHANGE_EVENT,
  currentConsent,
  storeConsent,
  subscribeToConsent,
  type ConsentDecision,
  type ConsentState,
} from "@/lib/consent";

/**
 * Consent banner.
 *
 * Shown only while the visitor has not answered. It is a region rather than a modal dialog:
 * it does not block the page, does not trap focus, and can be ignored without the site
 * becoming unusable — which is also why declining is exactly as easy as accepting. A banner
 * with a prominent "Accept all" and a buried "Decline" is a dark pattern, and consent given
 * that way is not freely given.
 *
 * Nothing here is written to storage until the visitor actually chooses; the absence of a
 * stored answer is itself the answer, and analytics stays off.
 */
export function CookieConsent() {
  // `useSyncExternalStore` rather than an effect that calls setState: the stored answer is
  // external state, and this reads it without a render-then-correct pass. The server
  // snapshot is "unknown", so the banner is absent from the server-rendered HTML and appears
  // only once the browser reports that no choice has been made — no hydration mismatch.
  const consent = useSyncExternalStore<ConsentState>(
    subscribeToConsent,
    currentConsent,
    () => "unknown",
  );

  const decide = (analytics: ConsentDecision) => {
    storeConsent(analytics);
    window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
  };

  if (consent !== "unknown") return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-[90] border-t border-white/10 bg-ink/95 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="text-sm leading-relaxed text-fog">
          We use analytics cookies to understand which pages are useful. Nothing is tracked
          until you agree, and declining changes nothing about how the site works.
        </p>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => decide("denied")}
            className="rounded-[8px] border border-line px-4 py-2 text-sm font-medium text-fog transition-colors hover:border-fog hover:text-snow focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => decide("granted")}
            className="rounded-[8px] bg-accent px-4 py-2 text-sm font-medium text-ink transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Accept analytics
          </button>
        </div>
      </div>
    </div>
  );
}
