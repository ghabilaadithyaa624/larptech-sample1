"use client";

import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Logo, MonoLabel } from "@/components/ui/bits";
import { SERVICES } from "@/lib/services";

const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/pricing", label: "Pricing" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setServicesOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setServicesOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || mobileOpen || servicesOpen
          ? "border-b border-line bg-ink/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <Link href="/" aria-label="LarpTech home" className="shrink-0">
          <Logo />
        </Link>

        {/* desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          <div className="relative">
            <button
              type="button"
              onClick={() => setServicesOpen((v) => !v)}
              aria-expanded={servicesOpen}
              aria-haspopup="true"
              className={`flex items-center gap-1.5 rounded-[8px] px-3 py-2 text-sm transition-colors ${
                pathname.startsWith("/services") ? "text-snow" : "text-fog hover:text-snow"
              }`}
            >
              Services
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${servicesOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>

            {servicesOpen && (
              <>
                <div
                  className="fixed inset-0 z-[-1]"
                  onClick={() => setServicesOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute left-1/2 top-[calc(100%+12px)] z-50 w-[600px] -translate-x-1/2 rounded-[12px] border border-line bg-surface p-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
                  <div className="grid grid-cols-2 gap-1">
                    {SERVICES.map((s) => {
                      const Icon = s.icon;
                      return (
                        <Link
                          key={s.slug}
                          href={`/services/${s.slug}`}
                          className="group flex items-start gap-3 rounded-[8px] p-3 transition-colors hover:bg-surface-2"
                        >
                          <span
                            className={`grid h-9 w-9 shrink-0 place-items-center rounded-[8px] border border-line ${
                              s.accent === "cyan" ? "bg-cyan-dim" : "bg-accent-dim"
                            }`}
                          >
                            <Icon
                              className={`h-4 w-4 ${s.accent === "cyan" ? "text-cyan" : "text-accent-soft"}`}
                              aria-hidden="true"
                            />
                          </span>
                          <span className="min-w-0">
                            <span className="flex items-center gap-2 text-sm font-medium text-snow">
                              {s.name}
                              <span className="font-mono text-[10px] tracking-[0.15em] text-fog-dim">
                                {s.code}
                              </span>
                            </span>
                            <span className="mt-0.5 block truncate text-xs text-fog">{s.hook}</span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                  <div className="mt-1 border-t border-line pt-1">
                    <Link
                      href="/services"
                      className="flex items-center justify-between rounded-[8px] px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-fog transition-colors hover:bg-surface-2 hover:text-snow"
                    >
                      View all services
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-[8px] px-3 py-2 text-sm transition-colors ${
                pathname === l.href ? "text-snow" : "text-fog hover:text-snow"
              }`}
            >
              {l.label}
            </Link>
          ))}

          <Button href="/contact" size="sm" className="ml-3">
            Start a project
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </nav>

        {/* mobile toggle */}
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-[8px] border border-line text-snow lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* mobile panel */}
      {mobileOpen && (
        <div className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto border-t border-line bg-ink/97 backdrop-blur-xl lg:hidden">
          <div className="px-5 py-6">
            <MonoLabel className="block pb-3">// services</MonoLabel>
            <div className="divide-y divide-line rounded-[12px] border border-line bg-surface">
              {SERVICES.map((s) => {
                const Icon = s.icon;
                return (
                  <Link
                    key={s.slug}
                    href={`/services/${s.slug}`}
                    className="flex items-center gap-3 p-4 first:rounded-t-[12px] last:rounded-b-[12px] hover:bg-surface-2"
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${s.accent === "cyan" ? "text-cyan" : "text-accent-soft"}`}
                      aria-hidden="true"
                    />
                    <span className="flex-1 text-sm font-medium text-snow">{s.name}</span>
                    <span className="font-mono text-[10px] tracking-[0.15em] text-fog-dim">
                      {s.code}
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-[8px] px-3 py-3 text-base text-fog transition-colors hover:bg-surface hover:text-snow"
                >
                  {l.label}
                </Link>
              ))}
            </div>

            <Button href="/contact" className="mt-6 w-full" size="lg">
              Start a project
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <p className="mt-4 text-center font-mono text-[11px] tracking-[0.15em] text-fog-dim">
              REPLY &lt; 1 BUSINESS DAY
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
