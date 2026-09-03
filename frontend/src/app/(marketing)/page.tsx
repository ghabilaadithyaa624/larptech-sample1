import type { Metadata } from "next";
import { ArrowRight, ArrowDown, Check, Mic2, Video, Zap } from "lucide-react";
import Link from "next/link";
import { CTASection } from "@/components/sections/CTASection";
import { WaitlistForm } from "@/components/WaitlistForm";
import { Button } from "@/components/ui/Button";
import { MonoLabel } from "@/components/ui/bits";
import { Reveal } from "@/components/ui/Reveal";
import { SERVICES } from "@/lib/services";

export const metadata: Metadata = {
  title: "Larptech — AI Agents for Everything Your Business Runs On",
  description:
    "Larptech builds custom AI agents, algorithmic trading systems, marketing automation, and modern websites. Solo-built, fully handed over.",
  alternates: { canonical: "/" },
};

const PROCESS = [
  {
    n: "01",
    title: "Tell me what needs fixing",
    body: "One conversation. No RFP, no slide deck. You describe the problem; I tell you honestly whether AI is the answer and what it would take.",
  },
  {
    n: "02",
    title: "I scope and build it",
    body: "Focused scope, fast delivery. I build with guardrails, approval gates and observability from commit one — not bolted on at the end.",
  },
  {
    n: "03",
    title: "You own it",
    body: "Repos, docs, credentials — all yours. I train you to run it without me. Dependency is a failure mode, not a business model.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ─── HERO ──────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] overflow-hidden flex flex-col items-center justify-center">
        {/* ambient layers */}
        <div className="bg-grid bg-grid-fade pointer-events-none absolute inset-0" aria-hidden="true" />
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 opacity-40"
          style={{
            background:
              "radial-gradient(circle at center, rgba(91,95,239,0.55) 0%, rgba(34,211,238,0.18) 45%, transparent 70%)",
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 h-[400px] w-[400px] opacity-20"
          style={{
            background: "radial-gradient(circle at center, rgba(91,95,239,0.6), transparent 70%)",
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 h-[350px] w-[350px] opacity-15"
          style={{
            background: "radial-gradient(circle at center, rgba(34,211,238,0.5), transparent 70%)",
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-5xl px-5 pb-20 pt-32 text-center sm:pt-40">
          <Reveal>
            {/* eyebrow tag */}
            <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-line bg-surface/70 px-4 py-2 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-soft animate-pulse-dot" aria-hidden="true" />
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-fog-dim">
                available for new projects
              </span>
            </div>

            {/* main headline — Cluely-style: huge, bold, minimal */}
            <h1 className="text-[52px] font-bold leading-[0.97] tracking-[-0.04em] text-snow sm:text-[72px] lg:text-[88px]">
              AI agents for
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #8488f5 0%, #22d3ee 60%, #8488f5 100%)",
                }}
              >
                everything
              </span>
              <br />
              you run on.
            </h1>

            <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-fog sm:text-xl">
              Custom AI agents, trading automation, marketing systems and modern websites —
              scoped, built and handed off by one person who's done it before.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href="/contact" size="lg" className="h-14 px-8 text-base">
                Start a project
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button href="#services" size="lg" variant="outline" className="h-14 px-8 text-base">
                See what I build
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </Reveal>

          {/* service pills */}
          <Reveal delay={0.2}>
            <div className="mt-14 flex flex-wrap items-center justify-center gap-2">
              {SERVICES.map((s) => {
                const Icon = s.icon;
                return (
                  <Link
                    key={s.slug}
                    href={`/services/${s.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-4 py-2 text-[13px] text-fog backdrop-blur transition-all hover:border-accent-soft/50 hover:text-snow"
                  >
                    <Icon
                      className={`h-3.5 w-3.5 ${s.accent === "cyan" ? "text-cyan" : "text-accent-soft"}`}
                      aria-hidden="true"
                    />
                    {s.name}
                  </Link>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── SERVICES ──────────────────────────────────────────── */}
      <section id="services" className="border-t border-line">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:py-28">
          <Reveal>
            <div className="mb-14 max-w-2xl">
              <MonoLabel tone="accent">// what_i_build</MonoLabel>
              <h2 className="mt-4 text-4xl font-bold tracking-[-0.035em] text-snow sm:text-5xl">
                Four things.
                <br />
                All of them working.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-fog sm:text-lg">
                I don&apos;t do retainers for decks. Every engagement ends with something deployed,
                documented and yours.
              </p>
            </div>
          </Reveal>

          {/* Available Now label */}
          <Reveal>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-line" />
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ok">
                available now
              </span>
              <span className="h-px flex-1 bg-line" />
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {SERVICES.map((s, i) => {
              const Icon = s.icon;
              const isCyan = s.accent === "cyan";
              return (
                <Reveal key={s.slug} delay={i * 0.07}>
                  <Link
                    href={`/services/${s.slug}`}
                    className={`group card-line ${isCyan ? "card-hover-cyan" : "card-hover"} flex h-full flex-col rounded-[12px] p-7`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`grid h-11 w-11 place-items-center rounded-[10px] border border-line ${
                          isCyan ? "bg-cyan-dim" : "bg-accent-dim"
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${isCyan ? "text-cyan" : "text-accent-soft"}`}
                          aria-hidden="true"
                        />
                      </span>
                      <MonoLabel>{s.code}</MonoLabel>
                    </div>

                    <h3 className="mt-5 text-xl font-semibold tracking-[-0.025em] text-snow">
                      {s.name}
                    </h3>
                    <p className="mt-2.5 flex-1 text-sm leading-relaxed text-fog">{s.hook}</p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {s.deliverables.slice(0, 3).map((d) => (
                        <span
                          key={d}
                          className="flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-[11px] text-fog-dim"
                        >
                          <Check className="h-2.5 w-2.5 text-ok shrink-0" aria-hidden="true" />
                          {d}
                        </span>
                      ))}
                    </div>

                    <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-fog transition-colors group-hover:text-snow">
                      Learn more
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>

          {/* Coming Soon label */}
          <Reveal>
            <div className="mb-5 mt-14 flex items-center gap-3">
              <span className="h-px flex-1 bg-line" />
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-fog-dim">
                coming soon
              </span>
              <span className="h-px flex-1 bg-line" />
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Crack It */}
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
                  <span className="font-mono text-sm font-normal text-fog-dim">// Crack It</span>
                </h3>
                <p className="mt-2.5 flex-1 text-sm leading-relaxed text-fog/80">
                  Real-time AI assistance during interviews — question prediction, live answer
                  structuring, and post-session coaching reports.
                </p>
                <div className="mt-5">
                  <p className="mb-2.5 text-xs font-medium text-fog">Get early access</p>
                  <WaitlistForm product="crack-it" productName="Crack It" />
                </div>
              </div>
            </Reveal>

            {/* Meeting Assistant */}
            <Reveal delay={0.08}>
              <div className="card-line flex h-full flex-col rounded-[12px] p-7 opacity-80">
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-[10px] border border-line bg-cyan-dim/60">
                    <Video className="h-5 w-5 text-cyan/70" aria-hidden="true" />
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-fog-dim">
                    <Zap className="h-3 w-3" aria-hidden="true" />
                    Coming Soon
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-semibold tracking-[-0.025em] text-snow/80">
                  Meeting Assistant{" "}
                  <span className="font-mono text-sm font-normal text-fog-dim">// auto-pilot for calls</span>
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
        </div>
      </section>

      {/* ─── PROCESS ───────────────────────────────────────────── */}
      <section className="border-t border-line bg-ink-2/60">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:py-28">
          <Reveal>
            <div className="mb-14 max-w-2xl">
              <MonoLabel tone="accent">// how_it_works</MonoLabel>
              <h2 className="mt-4 text-4xl font-bold tracking-[-0.035em] text-snow sm:text-5xl">
                Simple process.
                <br />
                No theatre.
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-4 md:grid-cols-3">
            {PROCESS.map((p, i) => (
              <Reveal key={p.n} delay={i * 0.1}>
                <div className="card-line card-hover relative flex h-full flex-col rounded-[12px] p-7">
                  <span className="font-mono text-4xl font-bold tracking-[-0.04em] text-accent-soft/30">
                    {p.n}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold tracking-[-0.02em] text-snow">
                    {p.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-fog">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY / ABOUT ───────────────────────────────────────── */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:py-28">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20 lg:items-center">
            <Reveal>
              <MonoLabel tone="accent">// why_larptech</MonoLabel>
              <h2 className="mt-4 text-4xl font-bold tracking-[-0.035em] text-snow sm:text-5xl">
                Built by one person
                <br />
                who&apos;s done this.
              </h2>
              <div className="mt-6 space-y-4 text-base leading-relaxed text-fog">
                <p>
                  I&apos;m not a big agency with a junior bench learning on your project. I&apos;ve
                  run these functions — security operations, trading research, marketing automation,
                  custom software — in-house before building them for others.
                </p>
                <p>
                  That means the person scoping your project is the person building it. No sales
                  hand-off. No surprise subcontractor. One number to call when something needs
                  attention.
                </p>
              </div>
              <div className="mt-8">
                <Button href="/about" variant="outline" size="lg">
                  More about how I work
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="space-y-3">
                {[
                  {
                    title: "Guardrails before autonomy",
                    body: "Every agent ships with permissions, approval gates and kill switches — before anything touches production.",
                  },
                  {
                    title: "You own the keys",
                    body: "Repos, docs, credentials — all yours on handoff. Dependency is a failure mode, not a business model.",
                  },
                  {
                    title: "Revenue or risk — nothing else",
                    body: "If I can't tie a deliverable to a financial or risk metric, I won't build it. Activity without a number is theatre.",
                  },
                  {
                    title: "No RFP, no six-month discovery",
                    body: "One call, a scoped proposal within 48 hours, first delivery in weeks — not quarters.",
                  },
                ].map((item, i) => (
                  <div key={item.title} className="card-line rounded-[10px] p-5">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 font-mono text-[11px] tracking-[0.14em] text-accent-soft">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-snow">{item.title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-fog">{item.body}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────────────── */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-7xl px-5 py-20 pb-28 sm:py-28">
          <CTASection
            title="Tell me what needs building."
            sub="One conversation, no deck. I'll tell you whether AI is the right answer — and if it is, exactly what it would take."
            primaryHref="/contact"
            primaryLabel="Start a project"
            secondaryHref="/services"
            secondaryLabel="See all services"
          />
        </div>
      </section>
    </>
  );
}
