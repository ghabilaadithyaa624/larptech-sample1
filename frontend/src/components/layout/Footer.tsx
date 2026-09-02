import { Mail, MapPin, Timer } from "lucide-react";
import Link from "next/link";
import { Logo, MonoLabel } from "@/components/ui/bits";
import { SERVICES } from "@/lib/services";

const COMPANY_LINKS = [
  { href: "/about", label: "About" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-line bg-ink-2 pb-28 pt-16 lg:pb-12">
      <div className="mx-auto max-w-7xl px-5">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-fog">
              AI solutions for everything that pays. One partner across marketing, sales, agents,
              security, commerce and trading.
            </p>
            <div className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-line bg-surface px-3.5 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-ok animate-pulse-dot" aria-hidden="true" />
              <MonoLabel tone="ok">all systems operational</MonoLabel>
            </div>
          </div>

          <nav aria-label="Services">
            <MonoLabel className="block">// services</MonoLabel>
            <ul className="mt-5 space-y-3">
              {SERVICES.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="link-underline text-sm text-fog transition-colors hover:text-snow"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company">
            <MonoLabel className="block">// company</MonoLabel>
            <ul className="mt-5 space-y-3">
              {COMPANY_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="link-underline text-sm text-fog transition-colors hover:text-snow"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <MonoLabel className="block">// get in touch</MonoLabel>
            <ul className="mt-5 space-y-4 text-sm text-fog">
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-accent-soft" aria-hidden="true" />
                <a href="mailto:team@larptech.io" className="link-underline hover:text-snow">
                  team@larptech.io
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Timer className="h-4 w-4 shrink-0 text-accent-soft" aria-hidden="true" />
                Replies in under 1 business day
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-accent-soft" aria-hidden="true" />
                Remote-first · working across EU &amp; US time zones
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-fog-dim">
            © {new Date().getFullYear()} LarpTech. All rights reserved.
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-fog-dim">
            ai_solutions // everything_that_pays
          </p>
        </div>
      </div>
    </footer>
  );
}
