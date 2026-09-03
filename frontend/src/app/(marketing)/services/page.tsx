import type { Metadata } from "next";
import { ArrowRight, Compass, Mic2, Video, Zap } from "lucide-react";
import Link from "next/link";
import { CTASection } from "@/components/sections/CTASection";
import { WaitlistForm } from "@/components/WaitlistForm";
import { Button } from "@/components/ui/Button";
import { MonoLabel, SectionHeading } from "@/components/ui/bits";
import { Reveal } from "@/components/ui/Reveal";
import { SERVICES } from "@/lib/services";

export const metadata: Metadata = {
  title: "Services — six AI practices across marketing, sales, operations & more",
  description:
    "Six AI practices across marketing, sales, agents, security, e-commerce, and trading — scoped, built, and handed off by LarpTech. Plus upcoming SaaS products.",
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
              label="svc_index // all_practices"
              title={
                <>
                  Everything we build —
                  <br />
                  scoped, shipped, yours.
                </>
              }
              sub="Each practice below is a complete engagement: defined scope, fixed delivery spine, full handoff with docs and credentials. Most clients start with one and add the next when the first pays for itself."
            />
          </Reveal>
        </div>
      </section>

      {/* Available Now */}
      <section className="mx-auto max-w-7xl px-5 pb-6">
        <Reveal>
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ok">
              available now
            </span>
            <span className="h-px flex-1 bg-line" />
          </div>
        </Reveal>

        <div className="space-y-4">
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.slug} delay={i * 0.05} id={s.slug}>
                <Link
                  href={`/services/${s.slug}`}
                  className="card-line card-hover group grid gap-6 rounded-[12px] p-6 sm:p-7 lg:grid-cols-[auto_1fr_auto] lg:items-center"
                >
                  <div className="flex items-center gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[10px] border border-line bg-accent-dim">
                      <Icon className="h-5 w-5 text-accent-soft" aria-hidden="true" />
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
                        <span key={d} className="rounded-full border border-line bg-ink px-3 py-1 text-[11px] text-fog">
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
      </section>

      {/* Coming Soon */}
      <section className="mx-auto max-w-7xl px-5 pb-20">
        <Reveal>
          <div className="mb-5 mt-10 flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-fog-dim">
              coming soon · saas products
            </span>
            <span className="h-px flex-1 bg-line" />
          </div>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-2">
          <Reveal delay={0}>
            <div className="card-line flex h-full flex-col rounded-[12px] p-7 opacity-80">
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-[10px] border border-line bg-accent-dim/60">
                  <Mic2 className="h-5 w-5 text-accent-soft/70" aria-hidden="true" />
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-fog-dim">
                  <Zap className="h-3 w-3" aria-hidden="true" />
                  Coming Soon
                </span>
              </div>
              <h3 className="mt-5 text-xl font-semibold tracking-[-0.025em] text-snow/80">
                Interview Assistant{" "}
                <span className="font-mono text-sm font-normal text-fog-dim">{"// Crack It"}</span>
              </h3>
              <p className="mt-2.5 flex-1 text-sm leading-relaxed text-fog/80">
                Real-time AI assistance during interviews — question prediction, live answer
                structuring (STAR/CAR), and post-session coaching reports.
              </p>
              <div className="mt-5">
                <p className="mb-2.5 text-xs font-medium text-fog">Get early access</p>
                <WaitlistForm product="crack-it" productName="Crack It" />
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="card-line flex h-full flex-col rounded-[12px] p-7 opacity-80">
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-[10px] border border-line bg-accent-dim/60">
                  <Video className="h-5 w-5 text-accent-soft/70" aria-hidden="true" />
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-fog-dim">
                  <Zap className="h-3 w-3" aria-hidden="true" />
                  Coming Soon
                </span>
              </div>
              <h3 className="mt-5 text-xl font-semibold tracking-[-0.025em] text-snow/80">
                Meeting Assistant{" "}
                <span className="font-mono text-sm font-normal text-fog-dim">{"// auto-pilot for calls"}</span>
              </h3>
              <p className="mt-2.5 flex-1 text-sm leading-relaxed text-fog/80">
                Joins your calls, captures decisions and action items, writes the follow-up and
                pushes it to your CRM — before the window closes.
              </p>
              <div className="mt-5">
                <p className="mb-2.5 text-xs font-medium text-fog">Get early access</p>
                <WaitlistForm product="meeting-assistant" productName="Meeting Assistant" />
              </div>
            </div>
          </Reveal>
        </div>

        {/* Not sure card */}
        <Reveal delay={0.1}>
          <div className="card-line mt-8 flex flex-col items-start gap-5 rounded-[12px] border-accent/25 bg-accent-dim/30 p-7 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <Compass className="mt-1 h-5 w-5 shrink-0 text-accent-soft" aria-hidden="true" />
              <div>
                <h2 className="text-lg font-semibold tracking-[-0.02em] text-snow">
                  Not sure which one fits?
                </h2>
                <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-fog">
                  That&apos;s fine — most people know something needs fixing, not which practice to
                  start with. One 30-minute call and we&apos;ll point at the fastest payback.
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
          sub="Tell us what you're trying to build or fix. We'll tell you whether we can help — and if not, who can."
        />
      </section>
    </>
  );
}
