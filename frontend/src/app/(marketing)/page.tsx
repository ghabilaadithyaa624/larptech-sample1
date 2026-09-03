import { Fragment } from "react";
import type { Metadata } from "next";
import { ArrowRight, ArrowDown, Check, Mic2, Video, Zap, Bot, CandlestickChart, Megaphone, Globe } from "lucide-react";
import Link from "next/link";
import { WaitlistForm } from "@/components/WaitlistForm";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Larptech — AI Agents for Everything You Run On",
  description:
    "Larptech builds custom AI agents, algorithmic trading systems, marketing automation, and modern websites. Solo-built, fully handed over.",
  alternates: { canonical: "/" },
};

const HERO_WORDS = ["AI", "agents", "for", "everything", "you", "run", "on."];

const SERVICES_NOW = [
  {
    icon: Bot,
    name: "Custom AI Agents",
    desc: "Tailored AI automation built around your business's specific workflows and requirements.",
    slug: "custom-ai-agents",
  },
  {
    icon: CandlestickChart,
    name: "Trading Agents",
    desc: "AI-driven algorithmic trading systems and automation for financial markets.",
    slug: "trading-agents",
  },
  {
    icon: Megaphone,
    name: "Marketing Agents",
    desc: "AI-powered content, campaign, and marketing automation tools built for your brand.",
    slug: "marketing-agents",
  },
  {
    icon: Globe,
    name: "Website Development",
    desc: "Custom, modern websites designed and built end-to-end for your business.",
    slug: "website-development",
  },
];

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

const PROCESS = [
  {
    n: "01",
    title: "Tell us your requirement",
    body: "One conversation. No RFP, no slide deck. You describe the problem; we tell you honestly whether AI is the answer.",
  },
  {
    n: "02",
    title: "We scope & build",
    body: "Focused scope, fast delivery. Built with guardrails, approval gates and observability from commit one.",
  },
  {
    n: "03",
    title: "We deploy & support",
    body: "Repos, docs, credentials — all yours. We train you to run it without us. Dependency is a failure mode.",
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

        <div className="relative mx-auto flex max-w-[560px] flex-col items-center gap-6 px-5 pt-32 text-center lg:gap-5 lg:pt-40">
          {/* Hero headline — EB Garamond, Cluely-style word-rise */}
          <h1
            style={{ fontFamily: "var(--font-eb-garamond)" }}
            className="max-w-[560px] text-center text-[56px] font-medium leading-[96%] tracking-[-1px] text-white lg:text-[80px]"
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

          {/* Divider line — Cluely style */}
          <hr
            className="hero-fade-up hidden h-px w-96 border-none lg:block"
            style={{
              animation: "hero-fade-up 0.5s ease-out 1s both",
              background:
                "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(207,226,255,0.3) 50%, rgba(255,255,255,0) 100%)",
            }}
          />

          {/* Subtitle */}
          <h2
            className="hero-fade-up max-w-[520px] text-center text-base font-medium leading-[140%] tracking-[-0.02em] text-white/80 lg:text-[19px]"
            style={{ animation: "hero-fade-up 0.5s ease-out 1.2s both" }}
          >
            Larptech builds custom AI agents, trading automation, marketing systems and modern websites — scoped, built and handed off.
          </h2>

          {/* CTA buttons */}
          <div
            className="hero-fade-up flex flex-col items-center gap-3 pt-4 sm:flex-row"
            style={{ animation: "hero-fade-up 0.5s ease-out 1.5s both" }}
          >
            <Button href="/contact" size="lg" className="h-12 px-7 text-[15px]">
              Start a Project
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button href="#services" size="lg" variant="outline" className="h-12 px-7 text-[15px]">
              See Our Work
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>

      {/* ─── SERVICES ──────────────────────────────────────────── */}
      <section id="services" className="relative">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:py-32">
          <Reveal>
            <div className="mb-16 max-w-2xl">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent-soft">
                // what_we_build
              </span>
              <h2
                style={{ fontFamily: "var(--font-eb-garamond)" }}
                className="mt-4 text-[40px] font-medium leading-[96%] tracking-[-1px] text-white sm:text-[56px]"
              >
                Four things.
                <br />
                All of them working.
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

          <div className="grid gap-4 sm:grid-cols-2">
            {SERVICES_NOW.map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.slug} delay={i * 0.07}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="group glass-card flex h-full flex-col rounded-2xl p-7 transition-all duration-300 hover:border-accent-soft/30 hover:shadow-[0_0_40px_-15px_rgba(74,122,255,0.2)]"
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-accent-dim">
                      <Icon className="h-5 w-5 text-accent-soft" aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 text-xl font-semibold tracking-[-0.025em] text-snow">
                      {s.name}
                    </h3>
                    <p className="mt-2.5 flex-1 text-sm leading-relaxed text-fog">{s.desc}</p>
                    <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-fog transition-colors group-hover:text-accent-soft">
                      Learn more
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
                coming soon
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
                        // {s.codename}
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

      {/* ─── PROCESS ───────────────────────────────────────────── */}
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
                // how_it_works
              </span>
              <h2
                style={{ fontFamily: "var(--font-eb-garamond)" }}
                className="mt-4 text-[40px] font-medium leading-[96%] tracking-[-1px] text-white sm:text-[56px]"
              >
                Simple process.
                <br />
                No theatre.
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-4 md:grid-cols-3">
            {PROCESS.map((p, i) => (
              <Reveal key={p.n} delay={i * 0.1}>
                <div className="glass-card relative flex h-full flex-col rounded-2xl p-7 transition-all duration-300 hover:border-accent-soft/20">
                  <span className="font-mono text-4xl font-bold tracking-[-0.04em] text-accent-soft/20">
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

      {/* ─── ABOUT / WHY US ────────────────────────────────────── */}
      <section className="relative border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:py-32">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-20">
            <Reveal>
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent-soft">
                // why_larptech
              </span>
              <h2
                style={{ fontFamily: "var(--font-eb-garamond)" }}
                className="mt-4 text-[40px] font-medium leading-[96%] tracking-[-1px] text-white sm:text-[56px]"
              >
                Built by one person
                <br />
                who&apos;s done this.
              </h2>
              <div className="mt-6 space-y-4 text-base leading-relaxed text-fog">
                <p>
                  Not a big agency with a junior bench learning on your project. The person scoping
                  your project is the person building it. No sales hand-off. No surprise subcontractor.
                </p>
                <p>
                  Hands-on background across security operations, trading research, marketing automation
                  and custom software — in-house before building them for others.
                </p>
              </div>
              <div className="mt-8">
                <Button href="/about" variant="outline" size="lg">
                  More about how we work
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
                    body: "If we can't tie a deliverable to a financial or risk metric, we won't build it.",
                  },
                  {
                    title: "No RFP, no six-month discovery",
                    body: "One call, a scoped proposal within 48 hours, first delivery in weeks — not quarters.",
                  },
                ].map((item, i) => (
                  <div key={item.title} className="glass-card rounded-xl p-5">
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
                  // next_step
                </span>
                <h2
                  style={{ fontFamily: "var(--font-eb-garamond)" }}
                  className="mt-4 text-[32px] font-medium leading-[96%] tracking-[-1px] text-white sm:text-[44px]"
                >
                  Tell us what needs building.
                </h2>
                <p className="mt-4 text-base leading-relaxed text-fog sm:text-lg">
                  One conversation, no deck. We&apos;ll tell you whether AI is the right answer — and if it is, exactly what it would take.
                </p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <Button href="/contact" size="lg">
                    Start a Project
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button href="/services" size="lg" variant="outline">
                    See all services
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
