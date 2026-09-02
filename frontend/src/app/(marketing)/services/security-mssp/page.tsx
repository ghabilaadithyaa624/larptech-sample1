import type { Metadata } from "next";
import { ServiceTemplate } from "@/components/sections/ServiceTemplate";
import { getService } from "@/lib/services";

const service = getService("security-mssp")!;

export const metadata: Metadata = {
  title: service.seoTitle,
  description: service.seoDescription,
  alternates: { canonical: "/services/security-mssp" },
};

export default function SecurityMsspPage() {
  return <ServiceTemplate service={service} />;
}
