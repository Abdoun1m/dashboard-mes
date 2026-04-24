interface StatusBadgeProps {
  label: string;
  active: boolean;
}

export const StatusBadge = ({ label, active }: StatusBadgeProps) => (
  <span
    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
      active
        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200'
        : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200'
    }`}
  >
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${
        active ? 'bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.18)]' : 'bg-zinc-500'
      }`}
    />
    {label}
  </span>
);
