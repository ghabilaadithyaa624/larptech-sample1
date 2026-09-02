import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost" | "cyan";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[8px] font-medium tracking-[-0.01em] transition-all duration-200 select-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-soft hover:shadow-[0_10px_34px_-12px_rgba(91,95,239,0.8)] active:translate-y-px",
  cyan: "bg-cyan text-ink hover:brightness-110 hover:shadow-[0_10px_34px_-12px_rgba(34,211,238,0.6)] active:translate-y-px",
  outline:
    "border border-line-strong text-snow hover:border-accent-soft hover:bg-accent-dim active:translate-y-px",
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
