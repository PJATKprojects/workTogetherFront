export function LookingForTeamToggle({
  checked,
  onChange,
  label,
}: Readonly<{ checked: boolean; onChange: (checked: boolean) => void; label: string }>) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-border p-4 text-sm font-medium">
      <input
        type="checkbox"
        className="size-4 accent-[var(--primary)]"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  );
}
