import { Button } from "./button";

export function ErrorState({
  message,
  retryLabel,
  onRetry,
}: Readonly<{ message: string; retryLabel: string; onRetry?: () => void }>) {
  return (
    <div className="rounded-3xl border border-destructive/25 bg-destructive-soft/60 p-8 text-center backdrop-blur-sm">
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-destructive-soft text-destructive-soft-foreground">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-6"
          aria-hidden
        >
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          <path d="M12 9v4M12 17h.01" />
        </svg>
      </div>
      <p className="mt-4 text-sm font-medium text-destructive-soft-foreground">{message}</p>
      {onRetry ? (
        <Button type="button" variant="secondary" className="mt-5" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
