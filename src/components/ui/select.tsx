import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full cursor-pointer appearance-none rounded-xl border border-input bg-surface bg-[length:1.1rem] bg-[right_0.75rem_center] bg-no-repeat px-3.5 pr-10 text-sm text-foreground shadow-[var(--shadow-sm)] outline-none transition duration-150 hover:border-primary/40 focus:border-primary focus:ring-4 focus:ring-[var(--ring)]/15 disabled:cursor-not-allowed disabled:opacity-60",
        "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%23808495%22 stroke-width=%222%22><path stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M6 9l6 6 6-6%22/></svg>')]",
        className
      )}
      {...props}
    />
  );
}
