"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

export type FaqItem = { q: string; a: string };

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-line rounded-[12px] border border-line bg-surface">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${i}`}
              id={`faq-trigger-${i}`}
              className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-surface-2 sm:px-6"
            >
              <span className="text-sm font-medium text-snow sm:text-base">{item.q}</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-fog transition-transform duration-300 ${isOpen ? "rotate-180 text-accent-soft" : ""}`}
                aria-hidden="true"
              />
            </button>
            <div
              id={`faq-panel-${i}`}
              role="region"
              aria-labelledby={`faq-trigger-${i}`}
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              {/*
                Collapsing to `grid-rows-[0fr]` gives the height animation, but zero height is not
                the same as hidden: without `invisible` the collapsed answer stays in the
                accessibility tree and any link inside it stays focusable, so a screen reader
                announces every answer while the trigger says `aria-expanded="false"`.
                `visibility: hidden` is used rather than `display: none` or the `hidden` attribute
                because it is animatable and keeps the collapse transition working.
              */}
              <div className={`overflow-hidden ${isOpen ? "" : "invisible"}`}>
                <p className="px-5 pb-5 text-sm leading-relaxed text-fog sm:px-6">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
