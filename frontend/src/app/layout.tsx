import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, EB_Garamond } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { Analytics } from "@/components/Analytics";
import { CookieConsent } from "@/components/CookieConsent";

const gaId = process.env.NEXT_PUBLIC_GA_ID;

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });
// Only weight 500 is loaded: every element that uses this font sets `font-medium`, so the
// other three weights were downloaded and never rendered. If a different weight is ever
// needed, add it here or the browser will synthesise it.
const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb-garamond",
  display: "swap",
  weight: ["500"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://larptech.io";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "LarpTech — AI solutions for everything that pays",
    template: "%s — LarpTech",
  },
  description:
    "One AI partner across every revenue-driving function: marketing, sales, agents, security, e-commerce and trading. We scope, build and hand off working AI systems.",
  keywords: [
    "AI consulting",
    "AI marketing automation",
    "AI sales",
    "AI agents",
    "security MSSP",
    "e-commerce AI",
    "trading AI",
  ],
  openGraph: {
    type: "website",
    siteName: "LarpTech",
    title: "LarpTech — AI solutions for everything that pays",
    description:
      "One AI partner across every revenue-driving function: marketing, sales, agents, security, e-commerce and trading. We scope, build and hand off working AI systems.",
    url: siteUrl,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "LarpTech — AI solutions for everything that pays" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LarpTech — AI solutions for everything that pays",
    description:
      "One AI partner across every revenue-driving function: marketing, sales, agents, security, e-commerce and trading. We scope, build and hand off working AI systems.",
    images: ["/og.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0F",
  colorScheme: "dark",
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "LarpTech",
  slogan: "AI solutions for everything that pays.",
  description:
    "One AI partner across every revenue-driving function: marketing, sales, agents, security, e-commerce and trading. We scope, build and hand off working AI systems.",
  url: siteUrl,
  email: "team@larptech.io",
  areaServed: "Worldwide",
  knowsAbout: [
    "Marketing AI",
    "Sales AI",
    "AI Agents",
    "Security MSSP",
    "E-commerce AI",
    "Trading AI",
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${ebGaramond.variable}`} suppressHydrationWarning>
      <body className="bg-ink text-snow font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        {/* Google Consent Mode defaults.
            This must run before any Google tag, and it must run even when the visitor has
            already consented — on a later page load the stored answer is not known yet at
            this point in the document, so `wait_for_update` holds the tag until the
            Analytics component grants or denies it. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}" +
              "gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied'," +
              "ad_personalization:'denied',analytics_storage:'denied'," +
              "functionality_storage:'granted',security_storage:'granted'," +
              "personalization_storage:'denied',wait_for_update:500});",
          }}
        />
        {children}
        <Analytics />
        <CookieConsent />
      </body>
    </html>
  );
}
