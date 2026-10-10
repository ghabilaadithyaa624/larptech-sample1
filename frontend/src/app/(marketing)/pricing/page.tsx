import type { Metadata } from "next";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { FaqAccordion, type FaqItem } from "@/components/FaqAccordion";
import { CTASection } from "@/components/sections/CTASection";
import { Button } from "@/components/ui/Button";
import { MonoLabel, SectionHeading } from "@/components/ui/bits";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Pricing — engagement models & request a quote",
  description:
    "Three engagement models: Diagnostic Sprint, Build & Handoff, and Retained Partner. No fixed SKU pricing — every build is quoted after a scoped diagnostic.",
  alternates: { canonical: "/pricing" },
};

const MODELS = [
  {
    code: "ENG_01",
    name: "Diagnostic Sprint",
    price: "from $4,000",
    cadence: "fixed fee · 2–3 weeks",
    blurb: "Find out exactly where AI pays back first — before committing to a build.",
    features: [
      "Workflow & funnel audit with your team",
      "AI opportunity map with ROI model per use case",
      "Build-vs-buy and vendor recommendations",
      "Prioritized 90-day roadmap",
      "Two working sessions + written readout",
    ],
    cta: "Request a quote",
    featured: false,
  },
  {
    code: "ENG_02",
    name: "Build & Handoff",
    price: "from $18,000",
    cadence: "per vertical · 3–6 weeks",
    blurb: "A production AI system in your stack, documented and handed over. The core of what we do.",
    features: [
      "Production system built in your stack",
      "Integrations, guardrails & observability included",
      "Runbooks, training sessions and credential handover",
      "30 days of post-handoff support",
      "Diagnostic fee credited against the build",
    ],
    cta: "Request a quote",
    featured: true,
  },
  {
    code: "ENG_03",
    name: "Retained Partner",
    price: "from $6,000/mo",
    cadence: "ongoing · month to month",
    blurb: "We keep running, improving and extending your AI systems after handoff.",
    features: [
      "Monitoring & continuous improvement",
      "New use cases shipped every quarter",
      "Priority response SLA",
      "Cross-vertical roadmap planning",
      "Monthly exec digest in plain language",
    ],
    cta: "Request a quote",
    featured: false,
  },
];

const QUOTE_STEPS = [
  {
    step: "01",
    title: "30-minute call",
    body: "We hear the problem, sanity-check fit, and agree what a successful engagement would change.",
  },
  {
    step: "02",
    title: "Diagnostic quote",
    body: "Fixed fee, fixed window. You approve it in writing; we start within one to two weeks.",
  },
  {
    step: "03",
    title: "Fixed build quote",
    body: "After the diagnostic you get a scoped build price. No time-and-materials drift, no surprise change orders.",
  },
];

const FAQ: FaqItem[] = [
  {
    q: "Why no fixed price list?",
    a: "Because scope genuinely varies: automating one invoice workflow and rebuilding a trading research stack are both 'AI builds' but nothing alike. The diagnostic converts your situation into a fixed, comparable quote — and the diagnostic fee is credited if you proceed.",
  },
  {
    q: "Who owns what you build?",
    a: "You do. Code repositories, infrastructure, documentation, credentials and model prompts are transferred at handoff. We keep nothing hostage — a retained partner relationship has to be earned monthly, not enforced contractually.",
  },
  {
    q: "What if AI isn't the right answer for us?",
    a: "Then the diagnostic says so, in writing, with the cheaper alternative. Roughly one in five diagnostics ends with 'fix this process first, automate later.' We'd rather lose a build than deliver a system that doesn't pay.",
  },
  {
    q: "How fast can we start?",
    a: "Diagnostics typically kick off within one to two weeks of the first call. Builds are scheduled at diagnostic completion; retained partners slot in immediately after handoff.",
  },
  {
    q: "Do you work inside our existing stack?",
    a: "Yes — we build where you already live: your cloud, your CRM, your storefront platform, your data warehouse. Introducing new infrastructure is a last resort and always a priced, explicit decision.",
  },
  {
    q: "Is our data safe during an engagement?",
    a: "We work under an NDA from the first call, use least-privilege access scoped per task, log every agent action, and delete working copies at handoff. Our security practice runs its own engagements on the same standard.",
  },
];

export default function PricingPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="bg-grid bg-grid-fade pointer-events-none absolute inset-x-0 top-0 h-[520px]" aria-hidden="true" />
        <div className="glow-accent pointer-events-none absolute -top-40 left-1/2 h-[400px] w-[560px] -translate-x-1/2" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-16 sm:pt-24">
          <Reveal>
            <SectionHeading
              label="pricing // engagement_models"
              level="h1"
              title={
                <>
                  Three ways to engage.
                  <br />
                  Zero surprise invoices.
                </>
              }
              sub="We don't sell SKUs, we sell scoped outcomes. Starting points below are real; final quotes come from a diagnostic, so you're comparing fixed numbers — not estimates."
            />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20">
        <div className="grid gap-4 lg:grid-cols-3">
          {MODELS.map((m, i) => (
            <Reveal key={m.code} delay={i * 0.08}>
              <div
                className={`card-line relative flex h-full flex-col rounded-[12px] p-7 ${
                  m.featured ? "border-accent/40 bg-accent-dim/30" : ""
                }`}
              >
                {m.featured && (
                  <span className="absolute -top-3 left-7 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1">
                    <Sparkles className="h-3 w-3 text-white" aria-hidden="true" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white">
                      most_common
                    </span>
                  </span>
                )}
                <MonoLabel>{m.code}</MonoLabel>
                <h2 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-snow">{m.name}</h2>
                <p className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-snow">{m.price}</p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-fog-dim">
                  {m.cadence}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-fog">{m.blurb}</p>
                <ul className="mt-6 flex-1 space-y-3 border-t border-line pt-6">
                  {m.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm leading-relaxed text-fog">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button href="/contact" variant={m.featured ? "primary" : "outline"} className="mt-7 w-full">
                  {m.cta}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <p className="mt-8 rounded-[10px] border border-line bg-surface px-5 py-4 text-sm leading-relaxed text-fog">
            <span className="font-medium text-snow">No fixed SKU pricing — on purpose.</span> Every
            build is quoted after a scoped diagnostic because scope is what actually drives cost.
            What never changes: fixed fees agreed in writing, the diagnostic credited against the
            build, and handoff included in every model.
          </p>
        </Reveal>
      </section>

      <section className="border-t border-line bg-ink-2/60">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:py-24">
          <Reveal>
            <SectionHeading
              label="how_quoting_works"
              title="From first call to fixed number in three steps."
            />
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {QUOTE_STEPS.map((s, i) => (
              <Reveal key={s.step} delay={i * 0.08}>
                <div className="card-line h-full rounded-[12px] p-6">
                  <span className="font-mono text-2xl font-semibold tracking-[-0.02em] text-accent-soft">
                    {s.step}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold tracking-[-0.02em] text-snow">{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-fog">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <SectionHeading
              label="faq"
              title="Questions buyers actually ask."
              sub="If yours isn't here, put it in the contact form — a human answers, usually the same day."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <FaqAccordion items={FAQ} />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24">
        <CTASection
          title="Get a number you can take to your board."
          sub="Request a quote and we'll come back with a scoped plan, a timeline and a fixed fee — usually within two business days."
          primaryLabel="Request a quote"
          secondaryHref="/services"
          secondaryLabel="Browse services first"
        />
      </section>
    </>
  );
}
