import { ArrowRight, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function CTASection({
  title = "Start with one vertical. Keep the partner.",
  sub = "Book a 30-minute consultation. We'll map your fastest-payback AI use case — and tell you honestly if you don't need us yet.",
  primaryHref = "/contact",
  primaryLabel = "Start a Project",
  secondaryHref = "/services",
  secondaryLabel = "See all services",
}: {
  title?: string;
  sub?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <Reveal>
      <section className="relative overflow-hidden rounded-2xl border border-line bg-surface/60 px-6 py-14 backdrop-blur sm:px-12 sm:py-16">
        <div className="bg-grid bg-grid-fade absolute inset-0 opacity-40" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[560px] -translate-x-1/2"
          style={{
            background:
              "radial-gradient(circle at center, rgba(74, 122, 255, 0.15), transparent 65%)",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-2xl text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent-soft">
            {"// next_step"}
          </span>
          <h2
            style={{ fontFamily: "var(--font-eb-garamond)" }}
            className="mt-4 text-[32px] font-medium leading-[96%] tracking-[-1px] text-white sm:text-[44px]"
          >
            {title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-fog sm:text-lg">{sub}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href={primaryHref} size="lg">
              <CalendarCheck className="h-4 w-4" aria-hidden="true" />
              {primaryLabel}
            </Button>
            {secondaryHref && (
              <Button href={secondaryHref} size="lg" variant="outline">
                {secondaryLabel}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
          </div>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-fog-dim">
            no rfp · reply &lt; 1 business day
          </p>
        </div>
      </section>
    </Reveal>
  );
}
