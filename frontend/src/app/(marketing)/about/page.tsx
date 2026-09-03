import type { Metadata } from "next";
import { ArrowRight, Blocks, Route, ShieldCheck } from "lucide-react";
import { CTASection } from "@/components/sections/CTASection";
import { Button } from "@/components/ui/Button";
import { MonoLabel, SectionHeading } from "@/components/ui/bits";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "About — one partner for every revenue function",
  description:
    "Who LarpTech is, why the multi-vertical model works, and the principles I build every AI system on: guardrails before autonomy, hand over the keys, measure in money or risk.",
  alternates: { canonical: "/about" },
};

const WHY = [
  {
    icon: Blocks,
    title: "Context compounds",
    body: "Once I've built your sales AI, I already know your CRM, your data model and your edge cases. The second vertical starts from knowledge, not from zero.",
  },
  {
    icon: Route,
    title: "One delivery spine",
    body: "Audit → build with guardrails → handoff with docs → feed results back. Same spine in every vertical, refined on every engagement since 2023.",
  },
  {
    icon: ShieldCheck,
    title: "One accountability",
    body: "When five vendors touch one revenue process, nobody owns the outcome. When one partner touches six, there's exactly one number to call.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="bg-grid bg-grid-fade pointer-events-none absolute inset-x-0 top-0 h-full" aria-hidden="true" />
        <div className="glow-accent pointer-events-none absolute -top-40 left-[-8%] h-[420px] w-[420px]" aria-hidden="true" />
        <div className="relative mx-auto max-w-4xl px-5 py-16 sm:py-24">
          <Reveal>
            <MonoLabel>{"// about_larptech"}</MonoLabel>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-[-0.035em] text-snow sm:text-5xl lg:text-[56px]">
              One partner for every revenue function.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-fog sm:text-lg">
              LarpTech started in 2023 as a single-vertical AI studio. Clients kept asking for the
              second system, then the third — because the context already existed. Today I run six
              practices on one delivery spine, for companies that want AI leverage without a vendor
              management job.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-fog">
              I&apos;m senior-only by design: every engagement is scoped and delivered by the same
              person who owns the outcome — not passed to a junior bench after the sale.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button href="/contact" size="lg">
                Work with me
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button href="/services" size="lg" variant="outline">
                See how I deliver
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* three columns: company / approach / principles */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-3">
          <Reveal>
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-snow">Company</h2>
            <MonoLabel tone="accent" className="mt-2 block">
              multi-vertical by design
            </MonoLabel>
            <ul className="mt-5 space-y-3.5 text-sm leading-relaxed text-fog">
              <li>Founded 2023 as a one-vertical AI studio for growth-stage companies.</li>
              <li>Grew practice-by-practice because clients kept asking for the next system.</li>
              <li>Six practices today, sharing one delivery spine and one technical context store.</li>
              <li>Remote-first across EU and US time zones; small on purpose.</li>
            </ul>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-snow">Approach</h2>
            <MonoLabel tone="accent" className="mt-2 block">
              senior-only, no bench
            </MonoLabel>
            <ul className="mt-5 space-y-3.5 text-sm leading-relaxed text-fog">
              <li>I&apos;ve run these functions in-house before consulting — not just read the slide decks.</li>
              <li>No junior hand-off after the sale — the person scoping is the person building.</li>
              <li>Trusted specialist network for peak load, under my name and my accountability.</li>
              <li>Every engagement measured against revenue or risk, not activity or hours.</li>
            </ul>
          </Reveal>
          <Reveal delay={0.16}>
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-snow">Principles</h2>
            <MonoLabel tone="accent" className="mt-2 block">
              how I behave
            </MonoLabel>
            <ul className="mt-5 space-y-3.5 text-sm leading-relaxed text-fog">
              <li>Ship working systems, not decks. Production is the only demo that counts.</li>
              <li>Guardrails before autonomy: permissions, approvals, audit logs, kill switches.</li>
              <li>Hand over the keys — repos, docs, credentials. Dependency is a failure mode.</li>
              <li>Say no when AI isn&apos;t the answer. Trust is the asset; the engagement is the interest.</li>
            </ul>
          </Reveal>
        </div>
      </section>

      {/* why multi-vertical works */}
      <section className="border-y border-line bg-ink-2/60">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:py-24">
          <Reveal>
            <SectionHeading
              label="why_multi_vertical_works"
              title="Specialists sell depth. I sell depth that remembers."
              sub="The multi-vertical model only works if delivery quality holds in every practice. Three structural reasons mine does:"
            />
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {WHY.map((w, i) => {
              const Icon = w.icon;
              return (
                <Reveal key={w.title} delay={i * 0.09}>
                  <div className="card-line card-hover h-full rounded-[12px] p-6">
                    <span className="grid h-10 w-10 place-items-center rounded-[10px] border border-line bg-accent-dim">
                      <Icon className="h-4.5 w-4.5 text-accent-soft" aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold tracking-[-0.02em] text-snow">{w.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-fog">{w.body}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* values */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:py-24">
        <Reveal>
          <SectionHeading
            label="values // how_i_work"
            title="Four values. All owned by the same person."
            sub="Values are only real if someone is accountable for each one. Here's how I hold myself to them on every engagement."
          />
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {[
            {
              value: "Guardrails before autonomy",
              quote: "Autonomy is earned by evidence, not by enthusiasm.",
              detail:
                "Every agent ships with explicit permissions, spending limits, approval gates and kill switches — before anything touches production.",
            },
            {
              value: "Own the boring 80%",
              quote: "The last edge case is the product.",
              detail:
                "Edge cases aren't interruptions to the build — they're the reason the build exists. I document and handle them, not defer them.",
            },
            {
              value: "Measure in money or risk",
              quote: "If I can't tie it to revenue or risk, I won't build it.",
              detail:
                "Every deliverable is evaluated against a financial or risk metric agreed at the start. Activity without a number is theatre.",
            },
            {
              value: "Point-in-time or it didn't happen",
              quote: "A backtest you can't reproduce is a story, not evidence.",
              detail:
                "All research, models and experiments are reproducible — no leakage, no survivorship bias, no results that can only be run once.",
            },
          ].map((v, i) => (
            <Reveal key={v.value} delay={i * 0.08}>
              <div className="card-line card-hover h-full rounded-[12px] p-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent-soft">
                  {v.value}
                </p>
                <p className="mt-4 text-lg font-semibold tracking-[-0.02em] text-snow">
                  &ldquo;{v.quote}&rdquo;
                </p>
                <p className="mt-3 text-sm leading-relaxed text-fog">{v.detail}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24">
        <CTASection
          title="Meet the partner before you hire it."
          sub="The first call is with the person who would actually build your system — not a sales layer."
        />
      </section>
    </>
  );
}
