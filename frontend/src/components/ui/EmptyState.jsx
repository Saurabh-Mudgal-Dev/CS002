export default function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 border-2 border-dashed border-[var(--border-subtle)] rounded-2xl bg-[var(--bg-surface)]/60">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elev)] mb-3 text-[var(--text-muted)]">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m0 0v-2a2 2 0 012-2h2m0 0h2a2 2 0 012 2v2m0 0v2a2 2 0 01-2 2h-2m-2 2v-2m0 0v-2a2 2 0 00-2-2H9a2 2 0 00-2 2v2m0 0v2a2 2 0 002 2h2m0 0h2a2 2 0 002-2v-2m0 0V9m0 0H9l-3 3m0 0l3 3" />
        </svg>
      </div>
      <h3 className="font-semibold text-[var(--text-primary)] text-sm">{title}</h3>
      {description && <p className="text-xs text-[var(--text-muted)] mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
