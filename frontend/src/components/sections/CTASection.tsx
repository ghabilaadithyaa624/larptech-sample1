import { ArrowRight, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MonoLabel } from "@/components/ui/bits";
import { Reveal } from "@/components/ui/Reveal";

export function CTASection({
  title = "Start with one vertical. Keep the partner.",
  sub = "Book a 30-minute consultation. We'll map your fastest-payback AI use case — and tell you honestly if you don't need us yet.",
  primaryHref = "/contact",
  primaryLabel = "Book a Consultation",
  secondaryHref = "/pricing",
  secondaryLabel = "See engagement models",
  accent = "indigo",
}: {
  title?: string;
  sub?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  accent?: "indigo" | "cyan";
}) {
  return (
    <Reveal>
      <section className="relative overflow-hidden rounded-[12px] border border-line bg-surface px-6 py-14 sm:px-12 sm:py-16">
        <div className="bg-grid bg-grid-fade absolute inset-0 opacity-70" aria-hidden="true" />
        <div
          className={`pointer-events-none absolute -top-32 left-1/2 h-72 w-[560px] -translate-x-1/2 ${
            accent === "cyan" ? "glow-cyan" : "glow-accent"
          }`}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-2xl text-center">
          <MonoLabel tone={accent === "cyan" ? "cyan" : "accent"}>{"// next_step"}</MonoLabel>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-snow sm:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-fog sm:text-lg">{sub}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href={primaryHref} size="lg" variant={accent === "cyan" ? "cyan" : "primary"}>
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
            no rfp process · no six-month discovery · reply &lt; 1 business day
          </p>
        </div>
      </section>
    </Reveal>
  );
}
