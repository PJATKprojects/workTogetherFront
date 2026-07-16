import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "accent" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
};

const variants = {
  primary:
    "bg-linear-to-r from-primary to-secondary text-primary-foreground shadow-[0_10px_30px_-12px_var(--primary)] hover:brightness-110 hover:-translate-y-px active:translate-y-0",
  secondary:
    "border border-border bg-surface text-foreground shadow-[var(--shadow-sm)] hover:bg-muted hover:border-input",
  accent:
    "bg-accent text-accent-foreground shadow-[0_10px_30px_-12px_var(--accent)] hover:bg-accent-hover hover:-translate-y-px active:translate-y-0",
  danger:
    "border border-transparent bg-destructive-soft text-destructive-soft-foreground hover:brightness-95 dark:hover:brightness-110",
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
};

const sizes = {
  sm: "min-h-9 gap-1.5 px-3 text-[0.8125rem]",
  md: "min-h-11 gap-2 px-4 text-sm",
  lg: "min-h-12 gap-2 px-6 text-[0.9375rem]",
};

export function Button({ className, variant = "primary", size = "md", ...props }: Props) {
  return (
    <button
      className={cn(
        "focus-ring inline-flex cursor-pointer items-center justify-center rounded-xl font-semibold transition duration-200 ease-out disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-55",
        sizes[size],
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
