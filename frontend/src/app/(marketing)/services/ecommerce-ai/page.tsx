import type { Metadata } from "next";
import { ServiceTemplate } from "@/components/sections/ServiceTemplate";
import { getService } from "@/lib/services";

const service = getService("ecommerce-ai")!;

export const metadata: Metadata = {
  title: service.seoTitle,
  description: service.seoDescription,
  alternates: { canonical: "/services/ecommerce-ai" },
};

export default function EcommerceAiPage() {
  return <ServiceTemplate service={service} />;
}
