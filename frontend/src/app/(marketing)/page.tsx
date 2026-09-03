import { Fragment } from "react";
import type { Metadata } from "next";
import {
  ArrowRight,
  ArrowDown,
  Check,
  X,
  Mic2,
  Video,
  Zap,
  Blocks,
  Route,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { WaitlistForm } from "@/components/WaitlistForm";
import { Button } from "@/components/ui/Button";
import { MonoLabel } from "@/components/ui/bits";
import { Reveal } from "@/components/ui/Reveal";
import { SERVICES } from "@/lib/services";

export const metadata: Metadata = {
  title: "LarpTech — AI solutions for everything that pays",
  description:
    "One AI partner across every revenue-driving function: marketing, sales, agents, security, e-commerce and trading. We scope, build and hand off working AI systems.",
  alternates: { canonical: "/" },
};

const HERO_WORDS = ["AI", "solutions", "for", "everything", "that", "pays."];

const COMING_SOON = [
  {
    icon: Mic2,
    name: "Interview Assistant",
    codename: "Crack It",
    desc: "Real-time AI assistance during interviews — question prediction, live answer structuring, and post-session coaching.",
    product: "crack-it" as const,
  },
  {
    icon: Video,
    name: "Meeting Assistant",
    codename: "auto-pilot for calls",
    desc: "Joins your calls, captures decisions and action items, writes the follow-up — before the window closes.",
    product: "meeting-assistant" as const,
  },
];

const COMPARISON = {
  today: [
    "Six onboarding calls, pricing models and support queues",
    "Tools don't share context or data models",
    "Integration glue becomes your ops team's side job",
    "Every vendor optimizes its own metric, not your P&L",
    "Staggered renewals forever",
    "Five vendors point at each other when something breaks",
  ],
  withUs: [
    "One relationship, one delivery team, one roadmap",
    "Technical context carries across every vertical",
    "Systems handed over documented — you own the keys",
    "Every build measured against revenue or risk",
    "The second vertical ships faster than the first",
    "One number to call",
  ],
};

const PROCESS = [
  {
    n: "01",
    stage: "Scope",
    timeline: "Day 1–5",
    body: "Paid diagnostic sprint. We map your fastest-payback use case, review data & security, and deliver a fixed-scope build plan.",
  },
  {
    n: "02",
    stage: "Build",
    timeline: "Week 1–3",
    body: "Production build with guardrails, approval gates and observability from commit one — not bolted on at the end.",
  },
  {
    n: "03",
    stage: "Handoff",
    timeline: "Week 3–4",
    body: "Runbooks, team training, credentials and repos transferred. You own the system; we teach you to run it.",
  },
  {
    n: "04",
    stage: "Compound",
    timeline: "Ongoing",
    body: "Context carries into the next vertical. The second system ships faster and integrates deeper than the first.",
  },
];

const WHY = [
  {
    icon: Blocks,
    title: "Context compounds",
    body: "Once we've built your sales AI, we already know your CRM, your data model and your edge cases. The second vertical starts from knowledge, not from zero.",
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

export default function HomePage() {
  return (
    <>
      {/* ─── HERO ──────────────────────────────────────────────── */}
      <section className="hero-v2 relative flex min-h-svh flex-col items-center justify-center overflow-hidden">
        {/* ambient background */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(74, 122, 255, 0.12) 0%, rgba(123, 159, 255, 0.05) 40%, transparent 70%)",
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 h-px w-[600px] -translate-x-1/2"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(207,226,255,0.3) 50%, rgba(255,255,255,0) 100%)",
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto flex max-w-[620px] flex-col items-center gap-6 px-5 pt-32 text-center lg:gap-5 lg:pt-40">
          {/* Eyebrow */}
          <div className="hero-fade-up" style={{ animation: "hero-fade-up 0.5s ease-out 0s both" }}>
            <MonoLabel tone="accent">one ai partner // six revenue functions</MonoLabel>
          </div>

          {/* Hero headline — EB Garamond, Cluely-style word-rise */}
          <h1
            style={{ fontFamily: "var(--font-eb-garamond)" }}
            className="max-w-[620px] text-center text-[56px] font-medium leading-[96%] tracking-[-1px] text-white lg:text-[80px]"
          >
            {HERO_WORDS.map((word, i) => (
              <Fragment key={i}>
                <span className="-mb-[0.22em] inline-block overflow-hidden pb-[0.22em] align-bottom">
                  <span
                    className="hero-word-rise inline-block"
                    style={{
                      animation: `hero-word-rise 0.55s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.1}s both`,
                    }}
                  >
                    {word}
                  </span>
                </span>
                {i < HERO_WORDS.length - 1 ? " " : ""}
              </Fragment>
            ))}
          </h1>

          {/* Divider line */}
          <hr
            className="hero-fade-up hidden h-px w-96 border-none lg:block"
            style={{
              animation: "hero-fade-up 0.5s ease-out 0.9s both",
              background:
                "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(207,226,255,0.3) 50%, rgba(255,255,255,0) 100%)",
            }}
          />

          {/* Subtitle */}
          <h2
            className="hero-fade-up max-w-[560px] text-center text-base font-medium leading-[140%] tracking-[-0.02em] text-white/80 lg:text-[19px]"
            style={{ animation: "hero-fade-up 0.5s ease-out 1.1s both" }}
          >
            Most businesses don&apos;t need six AI vendors. They need one partner who can scope, build and hand off working AI systems across marketing, sales, operations, security, commerce and trading — without a six-month RFP process.
          </h2>

          {/* CTA buttons */}
          <div
            className="hero-fade-up flex flex-col items-center gap-3 pt-4 sm:flex-row"
            style={{ animation: "hero-fade-up 0.5s ease-out 1.3s both" }}
          >
            <Button href="/contact" size="lg" className="h-12 px-7 text-[15px]">
              Start a project
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button href="#services" size="lg" variant="outline" className="h-12 px-7 text-[15px]">
              See what we build
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>

      {/* ─── SIX PRACTICES / SERVICES ──────────────────────────── */}
      <section id="services" className="relative">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:py-32">
          <Reveal>
            <div className="mb-16 max-w-2xl">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent-soft">
                {"// six_practices"}
              </span>
              <h2
                style={{ fontFamily: "var(--font-eb-garamond)" }}
                className="mt-4 text-[40px] font-medium leading-[96%] tracking-[-1px] text-white sm:text-[56px]"
              >
                Six practices.
                <br />
                One delivery spine.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-fog sm:text-lg">
                Every engagement ends with something deployed, documented and yours.
              </p>
            </div>
          </Reveal>

          {/* Available Now divider */}
          <Reveal>
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-line" />
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ok">
                available now
              </span>
              <span className="h-px flex-1 bg-line" />
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.slug} delay={i * 0.05}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="group glass-card flex h-full flex-col rounded-2xl p-7 transition-all duration-300 hover:border-accent-soft/30 hover:shadow-[0_0_40px_-15px_rgba(74,122,255,0.2)]"
                  >
                    <div className="flex items-start justify-between">
                      <span className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-accent-dim">
                        <Icon className="h-5 w-5 text-accent-soft" aria-hidden="true" />
                      </span>
                      <span className="font-mono text-[10.5px] tracking-[0.2em] text-fog-dim">{s.code}</span>
                    </div>
                    <h3 className="mt-5 text-xl font-semibold tracking-[-0.025em] text-snow">
                      {s.name}
                    </h3>
                    <p className="mt-2.5 flex-1 text-sm leading-relaxed text-fog">{s.hook}</p>
                    <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-fog transition-colors group-hover:text-accent-soft">
                      Explore practice
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>

          {/* Coming Soon divider */}
          <Reveal>
            <div className="mb-6 mt-16 flex items-center gap-3">
              <span className="h-px flex-1 bg-line" />
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-fog-dim">
                coming soon · saas products
              </span>
              <span className="h-px flex-1 bg-line" />
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {COMING_SOON.map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.product} delay={i * 0.08}>
                  <div className="glass-card flex h-full flex-col rounded-2xl p-7 opacity-80">
                    <div className="flex items-center justify-between">
                      <span className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-accent-dim/60">
                        <Icon className="h-5 w-5 text-accent-soft/70" aria-hidden="true" />
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-fog-dim">
                        <Zap className="h-3 w-3" aria-hidden="true" />
                        Coming Soon
                      </span>
                    </div>
                    <h3 className="mt-5 text-xl font-semibold tracking-[-0.025em] text-snow/80">
                      {s.name}{" "}
                      <span className="font-mono text-sm font-normal text-fog-dim">
                        {"//"} {s.codename}
                      </span>
                    </h3>
                    <p className="mt-2.5 flex-1 text-sm leading-relaxed text-fog/80">
                      {s.desc}
                    </p>
                    <div className="mt-5">
                      <p className="mb-2.5 text-xs font-medium text-fog">Get early access</p>
                      <WaitlistForm product={s.product} productName={s.name} />
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── VENDOR COMPARISON: WHY ONE PARTNER ───────────────── */}
      <section className="relative border-t border-line">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(74, 122, 255, 0.07) 0%, transparent 60%)",
          }}
          aria-hidden="true"
        />
        <div className="mx-auto max-w-6xl px-5 py-24 sm:py-32">
          <Reveal>
            <div className="mb-16 max-w-2xl">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent-soft">
                {"// vendor_sprawl_vs_one_partner"}
              </span>
              <h2
                style={{ fontFamily: "var(--font-eb-garamond)" }}
                className="mt-4 text-[40px] font-medium leading-[96%] tracking-[-1px] text-white sm:text-[56px]"
              >
                Six vendors vs.
                <br />
                one accountable partner.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-fog sm:text-lg">
                The cost of AI isn&apos;t just the software licenses — it&apos;s the glue, the context loss, and the coordination overhead.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Today: vendor stack */}
            <Reveal delay={0.05}>
              <div className="glass-card flex h-full flex-col rounded-2xl p-7 border-err/20">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-lg font-semibold tracking-[-0.02em] text-snow">
                    The vendor stack today
                  </h3>
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-err">
                    fragmented
                  </span>
                </div>
                <ul className="space-y-4 text-sm leading-relaxed text-fog">
                  {COMPARISON.today.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-err" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {/* With us: one partner */}
            <Reveal delay={0.12}>
              <div className="glass-card flex h-full flex-col rounded-2xl p-7 border-accent-soft/30 shadow-[0_0_40px_-15px_rgba(74,122,255,0.15)]">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-lg font-semibold tracking-[-0.02em] text-snow">
                    With LarpTech
                  </h3>
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ok">
                    unified
                  </span>
                </div>
                <ul className="space-y-4 text-sm leading-relaxed text-snow/90">
                  {COMPARISON.withUs.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── PROCESS (4 STAGES) ────────────────────────────────── */}
      <section className="relative border-t border-line">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(74, 122, 255, 0.06) 0%, transparent 60%)",
          }}
          aria-hidden="true"
        />
        <div className="mx-auto max-w-6xl px-5 py-24 sm:py-32">
          <Reveal>
            <div className="mb-16 max-w-2xl">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent-soft">
                {"// delivery_spine"}
              </span>
              <h2
                style={{ fontFamily: "var(--font-eb-garamond)" }}
                className="mt-4 text-[40px] font-medium leading-[96%] tracking-[-1px] text-white sm:text-[56px]"
              >
                Four stages.
                <br />
                Zero mystery.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-fog sm:text-lg">
                Every practice runs on the same proven delivery spine: find the leverage, build with guardrails, hand over the keys, and compound into the next vertical.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((p, i) => (
              <Reveal key={p.n} delay={i * 0.08}>
                <div className="glass-card relative flex h-full flex-col rounded-2xl p-7 transition-all duration-300 hover:border-accent-soft/20">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-3xl font-bold tracking-[-0.04em] text-accent-soft/25">
                      {p.n}
                    </span>
                    <span className="rounded-full border border-line bg-ink px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-fog-dim">
                      {p.timeline}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-[-0.02em] text-snow">
                    {p.stage}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-fog">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY LARPTECH: THREE PRINCIPLES ────────────────────── */}
      <section className="relative border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:py-32">
          <Reveal>
            <div className="mb-16 max-w-2xl">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent-soft">
                {"// why_larptech"}
              </span>
              <h2
                style={{ fontFamily: "var(--font-eb-garamond)" }}
                className="mt-4 text-[40px] font-medium leading-[96%] tracking-[-1px] text-white sm:text-[56px]"
              >
                Why one partner
                <br />
                beats six vendors.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-fog sm:text-lg">
                LarpTech started in 2023 as a single-vertical AI studio. Clients kept asking for the second system, then the third — because the context already existed.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-3">
            {WHY.map((w, i) => {
              const Icon = w.icon;
              return (
                <Reveal key={w.title} delay={i * 0.1}>
                  <div className="glass-card flex h-full flex-col rounded-2xl p-7">
                    <span className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-accent-dim">
                      <Icon className="h-5 w-5 text-accent-soft" aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-snow">
                      {w.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-fog">{w.body}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={0.2}>
            <div className="mt-12 text-center">
              <Button href="/about" variant="outline" size="lg">
                Read our full story & principles
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── FINAL CTA ─────────────────────────────────────────── */}
      <section className="relative border-t border-line">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 100%, rgba(74, 122, 255, 0.08) 0%, transparent 60%)",
          }}
          aria-hidden="true"
        />
        <div className="mx-auto max-w-6xl px-5 py-24 pb-28 sm:py-32">
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl border border-line bg-surface/60 px-6 py-14 backdrop-blur sm:px-12 sm:py-16">
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
                  Start with one vertical.
                  <br />
                  Keep the partner.
                </h2>
                <p className="mt-4 text-base leading-relaxed text-fog sm:text-lg">
                  Book a 30-minute consultation. We&apos;ll map your fastest-payback AI use case — and tell you honestly if you don&apos;t need us yet.
                </p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <Button href="/contact" size="lg">
                    Start a project
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button href="/pricing" size="lg" variant="outline">
                    See engagement models
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
                <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-fog-dim">
                  no rfp · reply &lt; 1 business day
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
