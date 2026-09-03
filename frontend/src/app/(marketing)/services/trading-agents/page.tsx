import { getService } from "@/lib/services";
import { ServiceTemplate } from "@/components/sections/ServiceTemplate";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const service = getService("trading-agents");
  if (!service) return {};
  return {
    title: service.seoTitle,
    description: service.seoDescription,
    alternates: { canonical: `/services/${service.slug}` },
  };
}

export default function TradingAgentsPage() {
  const service = getService("trading-agents");
  if (!service) notFound();
  return <ServiceTemplate service={service} />;
}
