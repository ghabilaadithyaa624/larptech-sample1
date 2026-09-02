import type { Metadata } from "next";
import { ServiceTemplate } from "@/components/sections/ServiceTemplate";
import { getService } from "@/lib/services";

const service = getService("trading-ai")!;

export const metadata: Metadata = {
  title: service.seoTitle,
  description: service.seoDescription,
  alternates: { canonical: "/services/trading-ai" },
};

export default function TradingAiPage() {
  return <ServiceTemplate service={service} />;
}
