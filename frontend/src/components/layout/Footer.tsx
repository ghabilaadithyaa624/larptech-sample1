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

const SOCIAL_LINKS = [
  {
    href: "https://linkedin.com/company/larptech",
    label: "LinkedIn",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    href: "https://instagram.com/larptech",
    label: "Instagram",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
  {
    href: "https://x.com/larptech",
    label: "X (Twitter)",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
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
            {/* Social links */}
            <div className="mt-6 flex items-center gap-2.5">
              {SOCIAL_LINKS.map(({ href, label, svg }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-8 w-8 place-items-center rounded-[8px] border border-line bg-surface text-fog transition-colors hover:border-accent-soft/50 hover:text-snow"
                >
                  {svg}
                </a>
              ))}
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
