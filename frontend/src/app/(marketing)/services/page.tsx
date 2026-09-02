import type { Metadata } from "next";
import { ArrowRight, Compass } from "lucide-react";
import Link from "next/link";
import { CTASection } from "@/components/sections/CTASection";
import { Button } from "@/components/ui/Button";
import { MonoLabel, SectionHeading } from "@/components/ui/bits";
import { Reveal } from "@/components/ui/Reveal";
import { SERVICES } from "@/lib/services";

export const metadata: Metadata = {
  title: "Services — six AI verticals, one partner",
  description:
    "Marketing AI, Sales AI, AI Agents, Security MSSP, E-commerce AI and Trading AI. Compare all six LarpTech verticals and pick where AI pays back fastest.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="bg-grid bg-grid-fade pointer-events-none absolute inset-x-0 top-0 h-[520px]" aria-hidden="true" />
        <div className="glow-accent pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[560px] -translate-x-1/2" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-16 sm:pt-24">
          <Reveal>
            <SectionHeading
              label="svc_index // all_verticals"
              title={
                <>
                  Every revenue function,
                  <br />
                  covered by one team.
                </>
              }
              sub="Each vertical below is a complete service: scoped, built, handed over and documented. Most clients start with one and add the next when the first pays for itself."
            />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20">
        <div className="space-y-4">
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            const cyan = s.accent === "cyan";
            return (
              <Reveal key={s.slug} delay={i * 0.05}>
                <Link
                  href={`/services/${s.slug}`}
                  className={`card-line card-hover group grid gap-6 rounded-[12px] p-6 sm:p-7 lg:grid-cols-[auto_1fr_auto] lg:items-center ${
                    cyan ? "card-hover-cyan" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`grid h-12 w-12 shrink-0 place-items-center rounded-[10px] border border-line ${
                        cyan ? "bg-cyan-dim" : "bg-accent-dim"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${cyan ? "text-cyan" : "text-accent-soft"}`} aria-hidden="true" />
                    </span>
                    <MonoLabel className="hidden sm:block">{s.code}</MonoLabel>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-semibold tracking-[-0.02em] text-snow">{s.name}</h2>
                      <MonoLabel className="sm:hidden">{s.code}</MonoLabel>
                    </div>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-fog">{s.hook}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {s.deliverables.slice(0, 3).map((d) => (
                        <span
                          key={d}
                          className="rounded-full border border-line bg-ink px-3 py-1 text-[11px] text-fog"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 lg:flex-col lg:items-end lg:gap-3">
                    <span className="font-mono text-lg font-semibold tracking-[-0.02em] text-fog-dim transition-colors group-hover:text-snow">
                      {s.stats[0].value}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-fog transition-colors group-hover:text-snow">
                      Explore
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.1}>
          <div className="card-line mt-8 flex flex-col items-start gap-5 rounded-[12px] border-accent/25 bg-accent-dim/30 p-7 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <Compass className="mt-1 h-5 w-5 shrink-0 text-accent-soft" aria-hidden="true" />
              <div>
                <h2 className="text-lg font-semibold tracking-[-0.02em] text-snow">
                  Not sure which vertical fits?
                </h2>
                <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-fog">
                  That's normal — most founders know something is leaking, not which function to fix
                  first. We'll run a 30-minute triage and point at the fastest payback.
                </p>
              </div>
            </div>
            <Button href="/contact?service=not-sure" className="shrink-0">
              Help me pick
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24">
        <CTASection
          title="One conversation beats six vendor demos."
          sub="Tell us which function hurts most. We'll tell you which vertical to start with — including 'none of them yet', if that's the honest answer."
        />
      </section>
    </>
  );
}
