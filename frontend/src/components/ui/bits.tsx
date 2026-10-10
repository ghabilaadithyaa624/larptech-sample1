import type { ReactNode } from "react";

export function MonoLabel({
  children,
  tone = "fog",
  className = "",
}: {
  children: ReactNode;
  tone?: "fog" | "accent" | "ice" | "ok";
  className?: string;
}) {
  const tones = {
    fog: "text-fog-dim",
    accent: "text-accent-soft",
    ice: "text-ice",
    ok: "text-ok",
  } as const;
  return (
    <span
      className={`font-mono text-[11px] uppercase tracking-[0.22em] ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/**
 * Page or section heading.
 *
 * `level` exists because several pages use this for their *only* heading, which meant they
 * shipped with no `<h1>` at all — the document's top-level heading was an `<h2>`. Screen
 * reader users navigate by heading level, and a page whose first heading is level 2 reads as
 * though it is a subsection of something that is not there.
 *
 * Use `level="h1"` where this is the page's primary heading; leave the default for headings
 * that sit below one. Exactly one `<h1>` per page.
 */
export function SectionHeading({
  label,
  title,
  sub,
  tone = "accent",
  className = "",
  level = "h2",
}: {
  label: string;
  title: ReactNode;
  sub?: ReactNode;
  tone?: "accent";
  className?: string;
  level?: "h1" | "h2";
}) {
  const Heading = level;
  return (
    <div className={`max-w-3xl ${className}`}>
      <MonoLabel tone={tone}>
        {"// "}
        {label}
      </MonoLabel>
      <Heading className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-snow sm:text-5xl">
        {title}
      </Heading>
      {sub ? <p className="mt-4 text-base leading-relaxed text-fog sm:text-lg">{sub}</p> : null}
    </div>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="relative grid h-8 w-8 place-items-center rounded-[9px] border border-line-strong bg-surface">
        <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" aria-hidden="true">
          <circle cx="12" cy="12" r="9.5" fill="none" stroke="#4A7AFF" strokeWidth="2" />
          <path d="M10 8.2 L16 12 L10 15.8 Z" fill="#F5F5F7" />
        </svg>
      </span>
      <span className="text-[17px] font-semibold tracking-[-0.02em] text-snow">
        Larp<span className="text-accent-soft">tech</span>
      </span>
    </span>
  );
}
