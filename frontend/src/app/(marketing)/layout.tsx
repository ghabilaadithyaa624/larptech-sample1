import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ArrowRight, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/Button";

function MobileCtaBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/92 p-3 backdrop-blur-xl lg:hidden">
      <div className="flex gap-2">
        <Button href="/services" variant="outline" className="flex-1" aria-label="Explore services">
          <LayoutGrid className="h-4 w-4" aria-hidden="true" />
          Services
        </Button>
        <Button href="/contact" className="flex-[1.6]">
          Book a Consultation
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip">
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
      <MobileCtaBar />
    </div>
  );
}
