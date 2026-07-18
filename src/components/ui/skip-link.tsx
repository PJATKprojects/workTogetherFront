export function SkipLink({ label }: Readonly<{ label: string }>) {
  return (
    <a
      href="#main-content"
      tabIndex={0}
      className="focus-ring fixed left-4 top-3 z-[100] -translate-y-20 rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background shadow-lg transition-transform focus:translate-y-0 motion-reduce:transition-none"
    >
      {label}
    </a>
  );
}
