"use client";

import { useEffect } from "react";

import { CONSENT_CHANGE_EVENT, currentConsent } from "@/lib/consent";

const gaId = process.env.NEXT_PUBLIC_GA_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Loads Google Analytics — but only once the visitor has consented.
 *
 * Why a client component instead of the `<Script>` tags that were here before: a
 * server-rendered script has no way to know what the visitor chose, so it loads
 * unconditionally. The choice lives in `localStorage`, which only the browser can read, so
 * the decision to load has to happen there too.
 *
 * Google Consent Mode v2 is used so that, before any choice is made, GA is told
 * `analytics_storage: denied` (see the inline defaults in `app/layout.tsx`, which must run
 * before this file does). Granting consent sends an update and then loads the tag.
 */

let loaded = false;

function loadGoogleAnalytics(id: string): void {
  if (loaded) return;
  loaded = true;

  window.dataLayer = window.dataLayer ?? [];
  const gtag =
    window.gtag ??
    ((...args: unknown[]) => {
      window.dataLayer?.push(args);
    });
  window.gtag = gtag;

  gtag("consent", "update", {
    analytics_storage: "granted",
    ad_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "granted",
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);

  gtag("js", new Date());
  gtag("config", id, {
    // Truncate the visitor's IP before it is stored, and mark the cookie so it is not sent
    // cross-site. Neither makes tracking acceptable without consent, but both reduce what
    // is collected from someone who has consented.
    anonymize_ip: true,
    cookie_flags: "SameSite=Lax;Secure",
  });
}

export function Analytics() {
  useEffect(() => {
    if (!gaId) return;

    const sync = () => {
      if (currentConsent() === "granted") loadGoogleAnalytics(gaId);
    };

    sync();
    window.addEventListener(CONSENT_CHANGE_EVENT, sync);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, sync);
  }, []);

  return null;
}
