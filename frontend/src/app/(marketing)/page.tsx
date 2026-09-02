import type { Metadata } from "next";
import { ArrowRight, FileClock, FlaskConical, Handshake, Users, X } from "lucide-react";
import Link from "next/link";
import { CTASection } from "@/components/sections/CTASection";
import { HeroConsole } from "@/components/sections/HeroConsole";
import { ServiceGrid } from "@/components/sections/ServiceGrid";
import { Button } from "@/components/ui/Button";
import { MonoLabel, SectionHeading } from "@/components/ui/bits";
import { Counter } from "@/components/ui/Counter";
import { Reveal } from "@/components/ui/Reveal";
import { SERVICES } from "@/lib/services";

export const metadata: Metadata = {
  title: "LarpTech — AI solutions for everything that pays",
  description:
    "One AI partner across every revenue-driving function: marketing, sales, agents, security, e-commerce and trading. We scope, build and hand off working AI systems.",
  alternates: { canonical: "/" },
};

const MARQUEE_ITEMS = [
  "marketing_ai",
  "sales_ai",
  "ai_agents",
  "security_mssp",
  "ecommerce_ai",
  "trading_ai",
  "one_partner",
  "zero_vendor_sprawl",
];

const VENDOR_PAIN = [
  "Six onboarding calls, six pricing models, six support queues",
  "None of the tools share context or data models",
  "The integration glue becomes your ops team's side job",
  "Every vendor optimizes their own metric, not your P&L",
  "Renewals staggered across the year, forever",
  "When something breaks, five vendors point at each other",
];

const LARPTECH_GAIN = [
  "One relationship, one delivery team, one roadmap",
  "Technical context carries across every vertical",
  "Systems handed over documented — you own the keys",
  "Every build measured against revenue or risk, not demos",
  "The second vertical ships faster than the first",
  "One number to call when something needs attention",
];

const PROCESS = [
  {
    step: "00",
    title: "Scope",
    window: "day 1–5",
    body: "A paid diagnostic sprint: we map the money path, quantify the hours and errors, and pick the use case with fastest payback.",
  },
  {
    step: "01",
    title: "Build",
    window: "week 1–3",
    body: "We build in your stack with guardrails, approval gates and observability from the first commit — not bolted on at the end.",
  },
  {
    step: "02",
    title: "Handoff",
    window: "week 3–4",
    body: "Runbooks, training sessions and keys transferred. Your team can operate without us; that's the point.",
  },
  {
    step: "03",
    title: "Compound",
    window: "ongoing",
    body: "Results feed back into the system. When you're ready for the next vertical, the context already exists.",
  },
];

const PROOF_TEASERS = [
  {
    icon: FlaskConical,
    vertical: "E-commerce AI",
    title: "Mid-market home goods retailer",
    body: "Semantic search + margin-aware personalization across a 12k-SKU catalog. Publishable numbers pending client sign-off.",
  },
  {
    icon: Handshake,
    vertical: "Sales AI",
    title: "B2B services firm, 60 seats",
    body: "AI SDR with human approval gates and a self-writing CRM. Case study in production with the client's marketing team.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ---------- hero ---------- */}
      <section className="relative overflow-hidden">
        <div className="bg-grid bg-grid-fade pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="glow-accent pointer-events-none absolute -top-52 left-[8%] h-[480px] w-[480px]" aria-hidden="true" />
        <div className="glow-cyan pointer-events-none absolute right-[-6%] top-24 h-[380px] w-[380px]" aria-hidden="true" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-16 sm:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28">
          <Reveal>
            <MonoLabel>{"// one ai partner · six revenue functions"}</MonoLabel>
            <h1 className="mt-6 text-[42px] font-semibold leading-[1.03] tracking-[-0.04em] text-snow sm:text-6xl lg:text-[64px]">
              AI solutions for{" "}
              <span className="text-accent-soft">everything that pays.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-fog sm:text-lg">
              Most businesses don't need six AI vendors. They need one partner who can scope, build
              and hand off working AI systems across marketing, sales, operations, security,
              commerce and trading — without a six-month RFP process.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button href="/contact" size="lg">
                Book a Consultation
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button href="/services" size="lg" variant="outline">
                Explore Services
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-5 gap-y-2">
              {SERVICES.map((s) => {
                const Icon = s.icon;
                return (
                  <Link
                    key={s.slug}
                    href={`/services/${s.slug}`}
                    className="group inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-fog-dim transition-colors hover:text-snow"
                  >
                    <Icon
                      className={`h-3.5 w-3.5 ${s.accent === "cyan" ? "text-cyan/70" : "text-accent-soft/70"} transition-colors group-hover:text-snow`}
                      aria-hidden="true"
                    />
                    {s.slug.replace("-", "_")}
                  </Link>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <HeroConsole />
          </Reveal>
        </div>
      </section>

      {/* ---------- marquee ---------- */}
      <div className="overflow-hidden border-y border-line bg-ink-2/70 py-3.5" aria-hidden="true">
        <div className="animate-marquee flex w-max">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 items-center">
              {MARQUEE_ITEMS.map((item) => (
                <span
                  key={`${dup}-${item}`}
                  className="flex items-center gap-6 pr-6 font-mono text-[11px] uppercase tracking-[0.24em] text-fog-dim"
                >
                  {item}
                  <span className="h-1 w-1 rounded-full bg-accent/60" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ---------- social proof ---------- */}
      <section className="mx-auto max-w-7xl px-5 py-14">
        <Reveal>
          <MonoLabel className="block text-center">// trusted_by</MonoLabel>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {["NORTHWIND", "HELIOSTAT", "KRAFT & CO", "MERIDIAN LABS", "OSTRAVIA", "BLUEFIN CAPITAL"].map(
              (name) => (
                <span
                  key={name}
                  className="text-sm font-semibold tracking-[0.18em] text-fog-dim/80 transition-colors hover:text-fog"
                >
                  {name}
                </span>
              ),
            )}
          </div>
          <p className="mt-6 text-center font-mono text-[10.5px] uppercase tracking-[0.16em] text-fog-dim/70">
            client logos published with sign-off · first cohort landing soon
          </p>
        </Reveal>
      </section>

      {/* ---------- services grid ---------- */}
      <section className="mx-auto max-w-7xl px-5 pb-24 pt-8">
        <Reveal>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              label="svc_index"
              title={
                <>
                  Six verticals.
                  <br />
                  One delivery team.
                </>
              }
              sub="Pick the function where AI pays back fastest. Every vertical is built by the same team, on the same delivery spine — so context compounds instead of resetting."
            />
            <Button href="/services" variant="ghost" className="shrink-0 self-start sm:self-auto">
              Compare all six
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </Reveal>
        <div className="mt-12">
          <ServiceGrid />
        </div>
      </section>

      {/* ---------- why one partner ---------- */}
      <section className="border-t border-line bg-ink-2/60">
        <div className="mx-auto max-w-7xl px-5 py-24">
          <Reveal>
            <SectionHeading
              label="why_one_partner"
              title="Managing AI vendors is not running your business."
              sub="The default path to AI adoption is stitching together five specialist point solutions. Here's what that actually costs — and what the alternative looks like."
            />
          </Reveal>
          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            <Reveal>
              <div className="card-line h-full rounded-[12px] p-7">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-fog-dim" aria-hidden="true" />
                  <MonoLabel>{"// the vendor stack today"}</MonoLabel>
                </div>
                <ul className="mt-6 space-y-4">
                  {VENDOR_PAIN.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-fog">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-err/80" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="card-line h-full rounded-[12px] border-accent/30 bg-accent-dim/40 p-7">
                <div className="flex items-center gap-3">
                  <Handshake className="h-4 w-4 text-accent-soft" aria-hidden="true" />
                  <MonoLabel tone="accent">{"// with larptech"}</MonoLabel>
                </div>
                <ul className="mt-6 space-y-4">
                  {LARPTECH_GAIN.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-snow/90">
                      <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-accent-soft" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- process ---------- */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <Reveal>
          <SectionHeading
            label="how_engagements_run"
            title="From first call to handed-over system in weeks."
            sub="Human-led sales, machine-speed delivery. You always know what week you're in and what lands at the end of it."
          />
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS.map((p, i) => (
            <Reveal key={p.step} delay={i * 0.08}>
              <div className="card-line card-hover relative h-full rounded-[12px] p-6">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-2xl font-semibold tracking-[-0.02em] text-accent-soft">
                    {p.step}
                  </span>
                  <MonoLabel>{p.window}</MonoLabel>
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-[-0.02em] text-snow">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-fog">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- metrics band ---------- */}
      <section className="border-y border-line bg-ink-2/70">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { to: 6, suffix: "", label: "verticals under one roof", mono: "SVC_01 → SVC_06" },
            { to: 21, suffix: " days", label: "median kickoff → first production deploy", mono: "MEDIAN_2025" },
            { to: 40, suffix: "+", label: "workflows automated across client engagements", mono: "CUMULATIVE" },
            { to: 1, suffix: "", label: "partner instead of six disconnected vendors", mono: "VENDOR_SPRAWL = 0" },
          ].map((m, i) => (
            <Reveal key={m.mono} delay={i * 0.07}>
              <div>
                <p className="text-4xl font-semibold tracking-[-0.03em] text-snow">
                  <Counter to={m.to} suffix={m.suffix} />
                </p>
                <p className="mt-2 text-sm leading-relaxed text-fog">{m.label}</p>
                <MonoLabel className="mt-3 block">{m.mono}</MonoLabel>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- proof teasers ---------- */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <Reveal>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              label="proof_points"
              title="Work in the field."
              sub="First client case studies are being written with sign-off right now. Here's what's in flight."
            />
            <Button href="/case-studies" variant="ghost" className="shrink-0 self-start sm:self-auto">
              All case studies
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {PROOF_TEASERS.map((t, i) => {
            const Icon = t.icon;
            return (
              <Reveal key={t.title} delay={i * 0.1}>
                <Link
                  href="/case-studies"
                  className="card-line card-hover group flex h-full flex-col rounded-[12px] p-7"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-ink px-3 py-1">
                      <FileClock className="h-3.5 w-3.5 text-accent-soft" aria-hidden="true" />
                      <MonoLabel tone="accent">in progress</MonoLabel>
                    </span>
                    <MonoLabel>{t.vertical}</MonoLabel>
                  </div>
                  <h3 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-snow">{t.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-fog">{t.body}</p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm text-fog transition-colors group-hover:text-snow">
                    Read when published
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ---------- cta ---------- */}
      <section className="mx-auto max-w-7xl px-5 pb-24">
        <CTASection />
      </section>
    </>
  );
}
