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
      "One AI partner across marketing, sales, agents, security, commerce and trading. Pick one vertical to start; keep the partner for the next.",
    url: siteUrl,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "LarpTech — AI solutions for everything that pays" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LarpTech — AI solutions for everything that pays",
    description: "One AI partner. Every revenue channel.",
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
    "LarpTech builds and hands off working AI systems across marketing, sales, workflow agents, security operations, e-commerce and trading.",
  url: siteUrl,
  email: "team@larptech.io",
  areaServed: "Worldwide",
  knowsAbout: [
    "AI marketing automation",
    "AI sales systems",
    "Custom AI agents",
    "Managed security services",
    "E-commerce personalization",
    "Systematic trading research",
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
