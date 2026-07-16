import { cn } from "@/lib/cn";

export function Badge({
  children,
  tone = "neutral",
}: Readonly<{
  children: React.ReactNode;
  tone?: "green" | "blue" | "yellow" | "red" | "neutral";
}>) {
  const tones = {
    green: "bg-success-soft text-success-soft-foreground",
    blue: "bg-info-soft text-info-soft-foreground",
    yellow: "bg-warning-soft text-warning-soft-foreground",
    red: "bg-destructive-soft text-destructive-soft-foreground",
    neutral: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-tight",
        tones[tone]
      )}
    >
      <span
        aria-hidden
        className="size-1.5 rounded-full bg-current opacity-70"
        style={{ marginInlineStart: "-0.125rem" }}
      />
      {children}
    </span>
  );
}

export function statusTone(name: string): "green" | "blue" | "yellow" | "red" | "neutral" {
  const status = name.toLowerCase();
  if (status === "open") return "green";
  if (status === "pending") return "yellow";
  if (status === "accepted" || status.includes("progress")) return "blue";
  if (status === "rejected") return "red";
  return "neutral";
}
