import type { Metadata } from "next";
import { ServiceTemplate } from "@/components/sections/ServiceTemplate";
import { getService } from "@/lib/services";

const service = getService("ai-agents")!;

export const metadata: Metadata = {
  title: service.seoTitle,
  description: service.seoDescription,
  alternates: { canonical: "/services/ai-agents" },
};

export default function AiAgentsPage() {
  return <ServiceTemplate service={service} />;
}
