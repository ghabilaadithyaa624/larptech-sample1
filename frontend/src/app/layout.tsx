import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import type { ReactNode } from "react";
import "./globals.css";

const gaId = process.env.NEXT_PUBLIC_GA_ID;

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://larptech.io";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Larptech — AI Agents for Everything Your Business Runs On",
    template: "%s — Larptech",
  },
  description:
    "Larptech builds custom AI agents, algorithmic trading systems, marketing automation and modern websites — scoped, built and fully handed off.",
  keywords: [
    "custom AI agents",
    "trading agents",
    "AI marketing automation",
    "website development",
    "algorithmic trading AI",
    "AI automation",
    "AI consulting",
  ],
  openGraph: {
    type: "website",
    siteName: "Larptech",
    title: "Larptech — AI Agents for Everything Your Business Runs On",
    description:
      "Custom AI agents, trading automation, marketing systems and modern websites — scoped, built and handed off by one person who's done it before.",
    url: siteUrl,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Larptech — AI Agents" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Larptech — AI Agents for Everything Your Business Runs On",
    description: "Custom AI. Shipped. Yours.",
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
  name: "Larptech",
  slogan: "AI agents for everything your business runs on.",
  description:
    "Larptech builds and hands off custom AI agents, algorithmic trading systems, AI marketing automation and modern websites.",
  url: siteUrl,
  email: "team@larptech.io",
  areaServed: "Worldwide",
  knowsAbout: [
    "Custom AI agents",
    "Algorithmic trading systems",
    "AI marketing automation",
    "Website development",
    "AI workflow automation",
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="bg-ink text-snow font-sans antialiased">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        {gaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
            </Script>
          </>
        ) : null}
        {children}
      </body>
    </html>
  );
}
