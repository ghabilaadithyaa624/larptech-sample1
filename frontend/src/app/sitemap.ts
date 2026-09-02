import type { MetadataRoute } from "next";
import { SERVICES } from "@/lib/services";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://larptech.io";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/services`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/case-studies`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/pricing`, changeFrequency: "monthly", priority: 0.8 },
  ];
  const serviceRoutes: MetadataRoute.Sitemap = SERVICES.map((s) => ({
    url: `${siteUrl}/services/${s.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));
  return [...staticRoutes, ...serviceRoutes].map((r) => ({ ...r, lastModified: now }));
}
