export function LoadingSkeleton({ count = 3 }: Readonly<{ count?: number }>) {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" aria-busy="true">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="h-56 overflow-hidden rounded-3xl border border-border bg-card/70 p-5 shadow-[var(--shadow-sm)]"
        >
          <div className="flex items-center justify-between">
            <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-14 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="mt-5 h-6 w-3/4 animate-pulse rounded-lg bg-muted" />
          <div className="mt-3 h-4 w-full animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-muted" />
          <div className="mt-6 flex gap-2">
            <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
            <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
