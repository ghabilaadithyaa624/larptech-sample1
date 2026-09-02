"use client";

/**
 * Tiny analytics shim. If GA4 (NEXT_PUBLIC_GA_ID) is loaded on the page the
 * event is forwarded to gtag(); otherwise it is logged for dev visibility.
 * Conversion events fire on page views (automatic) and form submissions.
 */
export function trackEvent(name: string, params?: Record<string, string | number | boolean>) {
  try {
    const w = window as unknown as {
      gtag?: (...args: unknown[]) => void;
      dataLayer?: unknown[];
    };
    if (typeof w.gtag === "function") {
      w.gtag("event", name, params);
    } else if (process.env.NODE_ENV !== "production") {
      console.info("[analytics]", name, params ?? {});
    }
  } catch {
    /* analytics must never break the user flow */
  }
}
