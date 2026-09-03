import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[8px] font-medium tracking-[-0.01em] transition-all duration-200 select-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-[linear-gradient(180deg,#5B8AFF_0%,#3A6AEF_100%)] text-white shadow-[0_0_0_1px_rgba(207,226,255,0.24),0_-0.5px_0_0_rgba(255,255,255,0.3)_inset,0_0.5px_0_0_rgba(255,255,255,0.1)_inset] hover:scale-[1.02] hover:shadow-[0_10px_24px_-8px_rgba(91,138,255,0.6),0_0_0_1px_rgba(207,226,255,0.24),0_-0.5px_0_0_rgba(255,255,255,0.3)_inset,0_0.5px_0_0_rgba(255,255,255,0.1)_inset] active:translate-y-px active:scale-100",
  outline:
    "border border-line-strong text-snow hover:border-[#5B8AFF]/50 hover:bg-[#5B8AFF]/10 hover:shadow-[0_0_15px_-5px_rgba(91,138,255,0.3)] active:translate-y-px",
  ghost: "text-fog hover:text-snow hover:bg-white/5",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type ButtonAsLink = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", size = "md", className = "", children } = props;
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  if ("href" in props && typeof props.href === "string") {
    const { href, variant: _v, size: _s, className: _c, children: _ch, ...anchorRest } = props;
    void _v;
    void _s;
    void _c;
    void _ch;
    return (
      <Link href={href} className={classes} {...anchorRest}>
        {children}
      </Link>
    );
  }
  const { variant: _v, size: _s, className: _c, children: _ch, href: _h, ...buttonRest } =
    props as ButtonAsButton;
  void _v;
  void _s;
  void _c;
  void _ch;
  void _h;
  return (
    <button className={classes} {...buttonRest}>
      {children}
    </button>
  );
}
