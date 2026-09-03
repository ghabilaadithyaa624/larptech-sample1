import type { Metadata } from "next";
import { Clock3, Mail, UserCheck } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { MonoLabel, SectionHeading } from "@/components/ui/bits";
import { Reveal } from "@/components/ui/Reveal";
import { getService } from "@/lib/services";

export const metadata: Metadata = {
  title: "Contact — book a consultation",
  description:
    "Request a LarpTech consultation. Tell us which vertical you're interested in — marketing, sales, agents, security, e-commerce or trading — and a human replies within one business day.",
  alternates: { canonical: "/contact" },
  robots: { index: false, follow: true },
};

const NEXT_STEPS = [
  {
    icon: UserCheck,
    title: "A human reads it",
    body: "Not a routing bot. The practice lead for your selected vertical reviews every submission personally.",
  },
  {
    icon: Clock3,
    title: "Reply in < 1 business day",
    body: "Either a short list of clarifying questions or a direct link to book a 30-minute consultation.",
  },
  {
    icon: Mail,
    title: "The consultation",
    body: "30 minutes, no deck. We map your fastest-payback AI use case live and tell you honestly if you need us.",
  },
];

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const params = await searchParams;
  const preselected = params.service && getService(params.service) ? params.service : undefined;
  const preselectedName = preselected ? getService(preselected)?.name : undefined;

  return (
    <section className="relative overflow-hidden">
      <div className="bg-grid bg-grid-fade pointer-events-none absolute inset-x-0 top-0 h-[560px]" aria-hidden="true" />
      <div className="glow-accent pointer-events-none absolute -top-40 right-[10%] h-[400px] w-[400px]" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-5 py-16 sm:py-24">
        <Reveal>
          <SectionHeading
            label="contact // consultation_request"
            title={
              preselectedName ? (
                <>Let&apos;s talk {preselectedName}.</>
              ) : (
                <>Book a consultation.</>
              )
            }
            sub="Five fields, one human reply. Tell us which function hurts and we'll bring the relevant practice lead to the first call."
          />
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <div className="space-y-4">
              <MonoLabel>{"// what_happens_next"}</MonoLabel>
              {NEXT_STEPS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={s.title} className="card-line flex gap-4 rounded-[12px] p-5">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] border border-line bg-accent-dim">
                      <Icon className="h-4.5 w-4.5 text-accent-soft" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="flex items-baseline gap-2 text-base font-semibold tracking-[-0.01em] text-snow">
                        <span className="font-mono text-[11px] tracking-[0.16em] text-fog-dim">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {s.title}
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-fog">{s.body}</p>
                    </div>
                  </div>
                );
              })}

              <div className="rounded-[12px] border border-line bg-surface p-5">
                <MonoLabel>{"// prefer_email"}</MonoLabel>
                <a
                  href="mailto:team@larptech.io"
                  className="link-underline mt-2 inline-block text-sm font-medium text-accent-soft"
                >
                  team@larptech.io
                </a>
                <p className="mt-3 text-xs leading-relaxed text-fog-dim">
                  Submissions are stored so we can reply and follow up. We never sell contact data or
                  add you to sequences you didn&apos;t ask for.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <ContactForm initialService={preselected} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
