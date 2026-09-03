import { ArrowLeft, ArrowRight, Compass } from "lucide-react";
import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Logo, MonoLabel } from "@/components/ui/bits";

export const metadata: Metadata = {
  title: "404 — route not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-ink px-5">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="glow-accent pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2" aria-hidden="true" />
      <div className="relative w-full max-w-lg text-center">
        <div className="flex justify-center">
          <Logo />
        </div>
        <p className="mt-10 font-mono text-[64px] font-semibold leading-none tracking-[-0.04em] text-accent-soft sm:text-[84px]">
          404
        </p>
        <MonoLabel className="mt-4 block">{"// route_not_found"}</MonoLabel>
        <h1 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-snow sm:text-3xl">
          This route doesn&apos;t exist — yet.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-fog sm:text-base">
          The page you&apos;re after moved, never shipped, or was never real. The fastest way back to
          something useful:
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button href="/">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to homepage
          </Button>
          <Button href="/services" variant="outline">
            <Compass className="h-4 w-4" aria-hidden="true" />
            Browse services
          </Button>
        </div>
        <p className="mt-8">
          <Button href="/contact" variant="ghost" size="sm">
            Report a broken link
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </p>
      </div>
    </main>
  );
}
