import type { Metadata } from "next";
import { ArrowRight, CalendarCheck, Inbox, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MonoLabel } from "@/components/ui/bits";
import { Reveal } from "@/components/ui/Reveal";
import { getService } from "@/lib/services";

export const metadata: Metadata = {
  title: "Request received — thank you",
  description: "Your consultation request is in. A LarpTech practice lead will reply within one business day.",
  robots: { index: false, follow: false },
};

const TIMELINE = [
  {
    icon: Inbox,
    title: "Request logged",
    body: "Your submission is queued to the practice lead for the vertical you selected.",
    state: "done",
  },
  {
    icon: CalendarCheck,
    title: "Reply within 1 business day",
    body: "Clarifying questions or a direct booking link for a 30-minute consultation.",
    state: "next",
  },
  {
    icon: ShieldCheck,
    title: "Scoped plan",
    body: "After the call: a written summary, a recommended starting vertical and a fixed diagnostic quote.",
    state: "later",
  },
];

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; ref?: string }>;
}) {
  const params = await searchParams;
  const service = params.service ? getService(params.service) : undefined;
  const ref = params.ref ?? "pending";

  return (
    <section className="relative overflow-hidden">
      <div className="bg-grid bg-grid-fade pointer-events-none absolute inset-x-0 top-0 h-[560px]" aria-hidden="true" />
      <div className="glow-accent pointer-events-none absolute -top-32 left-1/2 h-[380px] w-[560px] -translate-x-1/2" aria-hidden="true" />

      <div className="relative mx-auto max-w-3xl px-5 py-20 sm:py-28">
        <Reveal>
          <div className="card-line relative overflow-hidden rounded-[12px] p-8 sm:p-12">
            <div className="flex items-center justify-between gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-full border border-ok/40 bg-ok/10">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <MonoLabel tone="ok">ref // lead-{ref}</MonoLabel>
            </div>

            <h1 className="mt-8 text-4xl font-semibold tracking-[-0.035em] text-snow sm:text-5xl">
              Request received.
            </h1>
            <p className="mt-5 text-base leading-relaxed text-fog sm:text-lg">
              Thanks — your consultation request is in.
              {service ? (
                <>
                  {" "}
                  We&apos;ve routed it to our <span className="font-medium text-snow">{service.name}</span>{" "}
                  practice lead.
                </>
              ) : (
                <> We&apos;ve routed it to the right practice lead.</>
              )}{" "}
              Expect a human reply in under one business day.
            </p>

            <ol className="mt-10 space-y-6 border-t border-line pt-8">
              {TIMELINE.map((t, i) => {
                const Icon = t.icon;
                return (
                  <li key={t.title} className="flex gap-4">
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-[10px] border ${
                        t.state === "done"
                          ? "border-ok/40 bg-ok/10"
                          : t.state === "next"
                            ? "border-accent/40 bg-accent-dim"
                            : "border-line bg-ink"
                      }`}
                    >
                      <Icon
                        className={`h-4.5 w-4.5 ${
                          t.state === "done" ? "text-ok" : t.state === "next" ? "text-accent-soft" : "text-fog-dim"
                        }`}
                        aria-hidden="true"
                      />
                    </span>
                    <div>
                      <p className="flex items-center gap-3 text-base font-semibold tracking-[-0.01em] text-snow">
                        {t.title}
                        {t.state === "done" && (
                          <span className="rounded-full border border-ok/40 bg-ok/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ok">
                            complete
                          </span>
                        )}
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-fog">{t.body}</p>
                    </div>
                    <span className="sr-only">step {i + 1}</span>
                  </li>
                );
              })}
            </ol>

            <div className="mt-10 flex flex-col gap-3 border-t border-line pt-8 sm:flex-row">
              <Button href="/" variant="outline">
                Back to homepage
              </Button>
              <Button href="/services" variant="ghost">
                Keep exploring services
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>

            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-fog-dim">
              urgent? email team@larptech.io — same inbox, same humans
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
