import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="neo-card flex flex-col items-start gap-3 p-6 sm:p-8">
      <p className="text-4xl" aria-hidden="true">
        ◇
      </p>
      <div className="space-y-2">
        <h2 className="text-2xl font-black">{title}</h2>
        <p className="text-sm text-[var(--ink-muted)]">{description}</p>
      </div>
      {action}
    </div>
  );
}
