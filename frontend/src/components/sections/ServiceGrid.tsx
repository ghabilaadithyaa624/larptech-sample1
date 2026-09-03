import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SERVICES } from "@/lib/services";

export function ServiceGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {SERVICES.map((s, i) => {
        const Icon = s.icon;
        return (
          <Reveal key={s.slug} delay={(i % 3) * 0.08}>
            <Link
              href={`/services/${s.slug}`}
              className="card-line card-hover group relative flex h-full flex-col overflow-hidden rounded-[12px] p-6"
            >
              <span
                className="absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-r from-transparent via-accent to-transparent"
                aria-hidden="true"
              />
              <div className="flex items-start justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-[10px] border border-line bg-accent-dim">
                  <Icon className="h-5 w-5 text-accent-soft" aria-hidden="true" />
                </span>
                <span className="font-mono text-[10.5px] tracking-[0.2em] text-fog-dim">{s.code}</span>
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-[-0.02em] text-snow">{s.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-fog">{s.hook}</p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-fog transition-colors group-hover:text-snow">
                Explore service
                <ArrowUpRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-soft"
                  aria-hidden="true"
                />
              </span>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}
