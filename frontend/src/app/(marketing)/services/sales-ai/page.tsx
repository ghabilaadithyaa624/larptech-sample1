import type { Metadata } from "next";
import { ServiceTemplate } from "@/components/sections/ServiceTemplate";
import { getService } from "@/lib/services";

const service = getService("sales-ai")!;

export const metadata: Metadata = {
  title: service.seoTitle,
  description: service.seoDescription,
  alternates: { canonical: "/services/sales-ai" },
};

export default function SalesAiPage() {
  return <ServiceTemplate service={service} />;
}
