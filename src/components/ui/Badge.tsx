interface BadgeProps {
  children: React.ReactNode;
  live?: boolean;
}

export function Badge({ children, live = false }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 border-2 border-[var(--border)] px-2 py-1 text-xs font-bold uppercase tracking-wide ${
        live ? "bg-[var(--accent)] text-white live-pulse" : "bg-[var(--surface)]"
      }`}
    >
      {live && <span className="inline-block h-2 w-2 rounded-full bg-white" />}
      {children}
    </span>
  );
}
