import { ArrowRight, Check, ChevronRight, Minus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { MonoLabel, SectionHeading } from "@/components/ui/bits";
import { Reveal } from "@/components/ui/Reveal";
import { CTASection } from "@/components/sections/CTASection";
import type { Service } from "@/lib/services";

export function ServiceTemplate({ service }: { service: Service }) {
  const Icon = service.icon;

  return (
    <div className="relative">
      {/* ambient background */}
      <div className="bg-grid bg-grid-fade pointer-events-none absolute inset-x-0 top-0 h-[720px]" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-40 right-[-10%] h-[420px] w-[420px] glow-accent"
        aria-hidden="true"
      />

      {/* hero */}
      <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-14 sm:pt-20">
        <nav aria-label="Breadcrumb" className="mb-10">
          <ol className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-fog-dim">
            <li>
              <Link href="/" className="transition-colors hover:text-snow">
                home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-3 w-3" />
            </li>
            <li>
              <Link href="/services" className="transition-colors hover:text-snow">
                services
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-3 w-3" />
            </li>
            <li className="text-accent-soft">{service.slug}</li>
          </ol>
        </nav>

        <div className="grid items-start gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-[10px] border border-line bg-accent-dim">
                <Icon className="h-5 w-5 text-accent-soft" aria-hidden="true" />
              </span>
              <MonoLabel tone="accent">
                {service.code} // {service.name}
              </MonoLabel>
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-[-0.035em] text-snow sm:text-5xl lg:text-[56px]">
              {service.heroTitle}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-fog sm:text-lg">{service.heroSub}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button href={`/contact?service=${service.slug}`} size="lg" variant="primary">
                Get started with {service.name}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button href="/pricing" size="lg" variant="outline">
                See engagement models
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="card-line rounded-[12px] p-6">
              <MonoLabel>{"// snapshot"}</MonoLabel>
              <ul className="mt-5 divide-y divide-line">
                {service.stats.map((st) => (
                  <li key={st.label} className="flex items-baseline justify-between gap-4 py-4 first:pt-0 last:pb-0">
                    <span className="text-2xl font-semibold tracking-[-0.02em] text-accent-soft">{st.value}</span>
                    <span className="text-right text-xs leading-relaxed text-fog">{st.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* problem */}
      <section className="border-t border-line bg-ink-2/60">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[1.1fr_0.9fr] sm:py-24">
          <Reveal>
            <SectionHeading
              label="the_problem"
              title={service.problemTitle}
            />
            <div className="mt-6 space-y-5 text-base leading-relaxed text-fog">
              {service.problem.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="card-line rounded-[12px] p-6">
              <MonoLabel>{"// symptoms_you_might_recognize"}</MonoLabel>
              <ul className="mt-5 space-y-4">
                {service.symptoms.map((sym) => (
                  <li key={sym} className="flex items-start gap-3 text-sm leading-relaxed text-fog">
                    <Minus className="mt-0.5 h-4 w-4 shrink-0 text-err" aria-hidden="true" />
                    {sym}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* approach */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:py-24">
        <Reveal>
          <SectionHeading
            label="the_larptech_approach"
            title="How I build it — three moves, no mystery."
            sub="Every engagement follows the same delivery spine: understand the problem, build it with guardrails, then hand it over fully documented."
          />
        </Reveal>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {service.approach.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.1}>
              <div className="card-line card-hover relative h-full rounded-[12px] p-6">
                <span className="font-mono text-[11px] tracking-[0.2em] text-accent-soft">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-lg font-semibold tracking-[-0.02em] text-snow">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-fog">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* deliverables */}
      <section className="border-t border-line bg-ink-2/60">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:py-24">
          <Reveal>
            <SectionHeading
              label="what_you_get"
              title="Handed over, documented, yours."
              sub="No black boxes, no hostage-taking. You own the systems, the docs and the keys when I'm done."
            />
          </Reveal>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {service.deliverables.map((d, i) => (
              <Reveal key={d} delay={(i % 3) * 0.07}>
                <div className="card-line flex items-center gap-3 rounded-[10px] px-4 py-3.5">
                  <Check className="h-4 w-4 shrink-0 text-ok" aria-hidden="true" />
                  <span className="text-sm text-snow/90">{d}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* cta */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:py-24">
        <CTASection
          title={`Ready to put ${service.name} to work?`}
          sub="Tell me where it hurts. I'll come back with a scoped plan, a timeline and a number — usually within two business days."
          primaryHref={`/contact?service=${service.slug}`}
          primaryLabel={`Get started with ${service.name}`}
          secondaryHref="/case-studies"
          secondaryLabel="See proof points"
        />
      </section>
    </div>
  );
}
