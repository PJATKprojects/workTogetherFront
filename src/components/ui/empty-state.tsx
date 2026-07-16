export function EmptyState({
  title,
  body,
  action,
}: Readonly<{ title: string; body: string; action?: React.ReactNode }>) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-surface/50 px-6 py-14 text-center backdrop-blur-sm">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary-text shadow-[var(--shadow-sm)]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-7"
          aria-hidden
        >
          <path d="M9.94 14.06 3 21m0 0 6.94-6.94M3 21h4.5M12 3l1.9 3.85 4.25.62-3.08 3 .73 4.23L12 13.7l-3.8 2 .73-4.23-3.08-3 4.25-.62L12 3Z" />
        </svg>
      </div>
      <h2 className="mt-4 text-xl font-semibold text-foreground">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">{body}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
