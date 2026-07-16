export function OwnerGuard({
  isOwner,
  children,
  deniedLabel,
}: Readonly<{ isOwner: boolean; children: React.ReactNode; deniedLabel: string }>) {
  if (!isOwner) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-800 dark:border-red-950 dark:bg-red-950/30 dark:text-red-200">
          {deniedLabel}
        </div>
      </div>
    );
  }

  return children;
}
