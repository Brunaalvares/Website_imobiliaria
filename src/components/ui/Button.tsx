import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-navy !text-white hover:bg-navy-dark hover:!text-white shadow-[0_8px_20px_rgba(16,42,67,0.18)]",
  secondary:
    "bg-white !text-navy border border-navy hover:bg-ice hover:!text-navy",
  ghost: "bg-transparent !text-navy hover:bg-ice hover:!text-navy",
  danger: "bg-[#9B1C1C] !text-white hover:bg-[#7f1515] hover:!text-white",
};

const sizes: Record<Size, string> = {
  sm: "px-3.5 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base",
};

type Common = {
  children: ReactNode;
  className?: string;
  variant?: Variant;
  size?: Size;
};

type ButtonAsButton = Common &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsLink = Common & {
  href: string;
  target?: string;
  rel?: string;
};

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { children, className, variant = "primary", size = "md" } = props;
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
    variants[variant],
    sizes[size],
    className,
  );

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes} target={props.target} rel={props.rel}>
        {children}
      </Link>
    );
  }

  const {
    children: _children,
    className: _className,
    variant: _variant,
    size: _size,
    ...rest
  } = props as ButtonAsButton;

  void _children;
  void _className;
  void _variant;
  void _size;

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
