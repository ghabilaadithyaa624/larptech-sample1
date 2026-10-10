import type { Metadata } from "next";
import { ArrowRight, FileBarChart, GitBranch, Gauge, RefreshCcw } from "lucide-react";
import { CTASection } from "@/components/sections/CTASection";
import { Button } from "@/components/ui/Button";
import { MonoLabel, SectionHeading } from "@/components/ui/bits";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Case studies — proof points, published with sign-off",
  description:
    "LarpTech case studies across e-commerce, sales, security and trading AI. First client results are landing soon — here's what's in flight and what every study will include.",
  alternates: { canonical: "/case-studies" },
};

const COMING_SOON = [
  {
    vertical: "ecommerce-ai",
    client: "Mid-market home goods retailer",
    scope: "Semantic search + margin-aware personalization across a 12k-SKU catalog",
    metrics: ["Conversion lift", "AOV delta", "Zero-result search rate"],
  },
  {
    vertical: "sales-ai",
    client: "B2B services firm, 60 seats",
    scope: "AI SDR with human approval gates, signal scoring and a self-writing CRM",
    metrics: ["Speed-to-lead", "Meetings booked per rep", "Forecast accuracy"],
  },
  {
    vertical: "security-mssp",
    client: "Fintech scale-up, 85 employees",
    scope: "24/7 AI-monitored SOC with auto-containment and SOC 2 evidence pack",
    metrics: ["Alert noise reduction", "Mean time to escalate", "Audit findings closed"],
  },
];

const INCLUDES = [
  {
    icon: FileBarChart,
    title: "The baseline, unedited",
    body: "Where the client started: hours spent, error rates, conversion or risk numbers — before we touched anything.",
  },
  {
    icon: GitBranch,
    title: "What we actually built",
    body: "Architecture, guardrails and the decisions we got wrong first. Real system diagrams, not marketing blocks.",
  },
  {
    icon: Gauge,
    title: "Measured outcomes",
    body: "Post-launch numbers over a defined window, with the measurement method stated so you can distrust them properly.",
  },
  {
    icon: RefreshCcw,
    title: "What we'd do differently",
    body: "Every engagement teaches something. Each case study ends with the version we'd build next time.",
  },
];

export default function CaseStudiesPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="bg-grid bg-grid-fade pointer-events-none absolute inset-x-0 top-0 h-[520px]" aria-hidden="true" />
        <div className="glow-accent pointer-events-none absolute -top-40 left-1/2 h-[400px] w-[560px] -translate-x-1/2" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-16 sm:pt-24">
          <Reveal>
            <SectionHeading
              label="case_studies // proof_points"
              level="h1"
              title={
                <>
                  Proof, published
                  <br />
                  with client sign-off.
                </>
              }
              sub="We don't publish numbers a client hasn't approved, and we don't invent them while we wait. First cohort results are landing soon — here's exactly what's in flight."
            />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-8">
        <Reveal>
          <div className="flex items-start gap-3 rounded-[10px] border border-line bg-surface px-5 py-4">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-ok animate-pulse-dot" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-fog">
              <span className="font-medium text-snow">First client results landing soon.</span> Three
              engagements are in the measurement window right now. Studies publish as soon as each
              client signs off on the numbers.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20">
        <div className="grid gap-4 md:grid-cols-3">
          {COMING_SOON.map((c, i) => (
            <Reveal key={c.client} delay={i * 0.08}>
              <article className="flex h-full flex-col rounded-[12px] border border-dashed border-line-strong bg-surface/50 p-6">
                <div className="flex items-center justify-between">
                  <MonoLabel tone="accent">coming_soon</MonoLabel>
                  <MonoLabel>{c.vertical}</MonoLabel>
                </div>
                <h2 className="mt-5 text-lg font-semibold tracking-[-0.02em] text-snow">{c.client}</h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-fog">{c.scope}</p>
                <div className="mt-6 border-t border-line pt-4">
                  <MonoLabel className="block">metrics_to_be_published</MonoLabel>
                  <ul className="mt-3 space-y-2">
                    {c.metrics.map((m) => (
                      <li key={m} className="flex items-center justify-between text-sm text-fog">
                        {m}
                        <span className="font-mono text-xs tracking-[0.1em] text-fog-dim">— — —</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-ink-2/60">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:py-24">
          <Reveal>
            <SectionHeading
              label="our_standard"
              title="What every case study will include."
              sub="A case study without a baseline is an advertisement. Ours follow a fixed structure so you can compare them — and challenge them."
            />
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {INCLUDES.map((item, i) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} delay={i * 0.07}>
                  <div className="card-line card-hover h-full rounded-[12px] p-6">
                    <span className="grid h-10 w-10 place-items-center rounded-[10px] border border-line bg-accent-dim">
                      <Icon className="h-4.5 w-4.5 text-accent-soft" aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 text-base font-semibold tracking-[-0.02em] text-snow">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-fog">{item.body}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:py-24">
        <CTASection
          title="Be the first case study."
          sub="Founding-cohort clients get priority scheduling, founding pricing and full veto over what we publish. Three slots open per quarter."
          primaryLabel="Apply for the founding cohort"
        />
        <Reveal delay={0.1}>
          <p className="mt-6 text-center">
            <Button href="/pricing" variant="ghost" size="sm">
              See engagement models first
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </p>
        </Reveal>
      </section>
    </>
  );
}
