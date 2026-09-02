import type { Metadata } from "next";
import { ArrowRight, Blocks, Route, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { CTASection } from "@/components/sections/CTASection";
import { Button } from "@/components/ui/Button";
import { MonoLabel, SectionHeading } from "@/components/ui/bits";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "About — one partner for every revenue function",
  description:
    "Who LarpTech is, why the multi-vertical model works, and the principles we build every AI system on: guardrails before autonomy, hand over the keys, measure in money or risk.",
  alternates: { canonical: "/about" },
};

const FOUNDER_PHOTO =
  "https://images.pexels.com/photos/28442318/pexels-photo-28442318.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

const TEAM = [
  {
    name: "Lena Osei",
    role: "Head of Security Practice",
    value: "Guardrails before autonomy",
    quote: "Autonomy is earned by evidence, not by enthusiasm.",
    photo:
      "https://images.pexels.com/photos/33680700/pexels-photo-33680700.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    name: "Tomas Ruiz",
    role: "Lead Agent Engineer",
    value: "Own the boring 80%",
    quote: "The last edge case is the product.",
    photo:
      "https://images.pexels.com/photos/14950779/pexels-photo-14950779.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    name: "Priya Anand",
    role: "Head of Growth AI",
    value: "Measure in money or risk",
    quote: "If we can't tie it to revenue or risk, we shouldn't build it.",
    photo:
      "https://images.pexels.com/photos/6497112/pexels-photo-6497112.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    name: "Dario Wenk",
    role: "Head of Trading & Data",
    value: "Point-in-time or it didn't happen",
    quote: "A backtest you can't reproduce is a story, not evidence.",
    photo:
      "https://images.pexels.com/photos/33799456/pexels-photo-33799456.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
];

const WHY = [
  {
    icon: Blocks,
    title: "Context compounds",
    body: "The team that built your sales AI already knows your CRM, your data model and your edge cases. The second vertical starts from knowledge, not from zero.",
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
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:py-24 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <MonoLabel>{"// about_larptech"}</MonoLabel>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-[-0.035em] text-snow sm:text-5xl lg:text-[56px]">
              One partner for every revenue function.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-fog sm:text-lg">
              LarpTech started in 2023 as a single-vertical AI studio. Clients kept asking us for the
              second system, then the third — because the context already existed. Today we run six
              practices on one delivery spine, for companies that want AI leverage without a vendor
              management job.
            </p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-fog">
              We're senior-only by design: every practice is led by someone who has owned that
              function's P&L, on-call rotation or quota — not just its slide deck.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button href="/contact" size="lg">
                Work with us
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button href="/services" size="lg" variant="outline">
                See how we deliver
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <figure className="relative">
              <div className="overflow-hidden rounded-[12px] border border-line bg-surface">
                <Image
                  src={FOUNDER_PHOTO}
                  alt="Marc Keller, founder of LarpTech, standing with arms crossed"
                  width={940}
                  height={650}
                  className="h-auto w-full object-cover"
                  priority
                />
              </div>
              <figcaption className="mt-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-snow">Marc Keller</p>
                  <p className="text-xs text-fog">Founder &amp; Principal AI Engineer</p>
                </div>
                <MonoLabel>{"// est_2023"}</MonoLabel>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* three columns: company / team / principles */}
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
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-snow">Team</h2>
            <MonoLabel tone="accent" className="mt-2 block">
              senior-only, hand-assembled
            </MonoLabel>
            <ul className="mt-5 space-y-3.5 text-sm leading-relaxed text-fog">
              <li>Engineers and operators who ran these functions in-house before consulting.</li>
              <li>No junior bench learning on your budget — the person scoping is the person building.</li>
              <li>Each practice lead has owned the quota, the on-call rotation or the P&amp;L.</li>
              <li>Trusted specialist network for peak load, under our name and our accountability.</li>
            </ul>
          </Reveal>
          <Reveal delay={0.16}>
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-snow">Principles</h2>
            <MonoLabel tone="accent" className="mt-2 block">
              how we behave
            </MonoLabel>
            <ul className="mt-5 space-y-3.5 text-sm leading-relaxed text-fog">
              <li>Ship working systems, not decks. Production is the only demo that counts.</li>
              <li>Guardrails before autonomy: permissions, approvals, audit logs, kill switches.</li>
              <li>Hand over the keys — repos, docs, credentials. Dependency is a failure mode.</li>
              <li>Say no when AI isn't the answer. Trust is the asset; the engagement is the interest.</li>
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
              title="Specialists sell depth. We sell depth that remembers."
              sub="The multi-vertical model only works if delivery quality holds in every practice. Three structural reasons ours does:"
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

      {/* values + team */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:py-24">
        <Reveal>
          <SectionHeading
            label="values // the_people"
            title="Four values, four practice leads."
            sub="Values are only real if someone senior is accountable for each one. These are the people who are."
          />
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM.map((m, i) => (
            <Reveal key={m.name} delay={i * 0.08}>
              <div className="card-line card-hover group h-full overflow-hidden rounded-[12px]">
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={m.photo}
                    alt={`Portrait of ${m.name}, ${m.role} at LarpTech`}
                    width={650}
                    height={650}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" aria-hidden="true" />
                </div>
                <div className="p-5">
                  <p className="text-base font-semibold tracking-[-0.01em] text-snow">{m.name}</p>
                  <p className="mt-0.5 text-xs text-fog">{m.role}</p>
                  <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-accent-soft">
                    {m.value}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-fog">“{m.quote}”</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24">
        <CTASection
          title="Meet the partner before you hire it."
          sub="The first call is with the people who would actually build your system — not a sales layer."
        />
      </section>
    </>
  );
}
