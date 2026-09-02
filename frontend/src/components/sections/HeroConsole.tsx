"use client";

import { useEffect, useState } from "react";

type FeedLine = { tag: string; tone: "indigo" | "cyan"; text: string };

const FEED: FeedLine[] = [
  { tag: "marketing-ai", tone: "indigo", text: "campaign_draft_v14 approved → scheduled 09:00" },
  { tag: "sales-ai", tone: "indigo", text: "42 leads scored · 7 meetings booked · CRM synced" },
  { tag: "ai-agents", tone: "indigo", text: "invoice_batch processed · 312 docs · 0 exceptions" },
  { tag: "security-mssp", tone: "cyan", text: "alert triaged · severity low · auto-contained" },
  { tag: "ecommerce-ai", tone: "indigo", text: "personalization live · AOV +18% on cohort B" },
  { tag: "trading-ai", tone: "cyan", text: "backtest complete · leakage checks passed" },
];

export function HeroConsole() {
  const [phase, setPhase] = useState(0);
  const [typed, setTyped] = useState("");
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const target = FEED[phase].text;
    let t: ReturnType<typeof setTimeout>;
    if (typed.length < target.length) {
      t = setTimeout(() => setTyped(target.slice(0, typed.length + 1)), 22);
    } else if (phase < FEED.length - 1) {
      t = setTimeout(() => {
        setPhase(phase + 1);
        setTyped("");
      }, 650);
    } else {
      t = setTimeout(() => {
        setPhase(0);
        setTyped("");
      }, 4200);
    }
    return () => clearTimeout(t);
  }, [typed, phase, reduced]);

  const visibleCount = reduced ? FEED.length : phase;

  return (
    <div className="relative">
      <div
        className="glow-accent animate-drift pointer-events-none absolute -inset-10 -z-10 opacity-70"
        aria-hidden="true"
      />
      <div className="relative overflow-hidden rounded-[12px] border border-line bg-surface/90 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.9)] backdrop-blur">
        {/* title bar */}
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-[#3a3a44]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#3a3a44]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#3a3a44]" />
            </div>
            <span className="font-mono text-[11px] tracking-[0.12em] text-fog-dim">
              larptech://ops-console
            </span>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-ink px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-ok animate-pulse-dot" aria-hidden="true" />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ok">live</span>
          </span>
        </div>

        {/* feed */}
        <div className="relative min-h-[268px] px-4 py-4 sm:min-h-[288px] sm:px-5">
          <div
            className="animate-scanline pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-transparent via-white/[0.04] to-transparent"
            aria-hidden="true"
          />
          <div className="space-y-2 font-mono text-[12px] leading-relaxed sm:text-[12.5px]">
            {FEED.slice(0, visibleCount).map((line) => (
              <FeedRow key={line.tag} line={line} text={line.text} typing={false} />
            ))}
            {!reduced && <FeedRow line={FEED[phase]} text={typed} typing />}
          </div>
        </div>

        {/* status bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-3 sm:px-5">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-fog-dim">
            6 verticals · 1 partner · 0 vendor sprawl
          </span>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-fog-dim">
            uptime 99.98%
          </span>
        </div>
      </div>
    </div>
  );
}

function FeedRow({ line, text, typing }: { line: FeedLine; text: string; typing: boolean }) {
  const toneClass = line.tone === "cyan" ? "text-cyan" : "text-accent-soft";
  return (
    <div className="flex gap-2">
      <span className="shrink-0 text-fog-dim">[{line.tag}]</span>
      <span className={`${toneClass} shrink-0`} aria-hidden="true">
        ▸
      </span>
      <span className="text-snow/90">
        {text}
        {typing && <span className="animate-caret ml-0.5 text-accent-soft">▍</span>}
      </span>
    </div>
  );
}
