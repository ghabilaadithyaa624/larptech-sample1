import { getService } from "@/lib/services";
import { ServiceTemplate } from "@/components/sections/ServiceTemplate";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const service = getService("website-development");
  if (!service) return {};
  return {
    title: service.seoTitle,
    description: service.seoDescription,
    alternates: { canonical: `/services/${service.slug}` },
  };
}

export default function WebsiteDevelopmentPage() {
  const service = getService("website-development");
  if (!service) notFound();
  return <ServiceTemplate service={service} />;
}
