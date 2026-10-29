export default function Pagination({ page, totalPages, onChange, className = "" }) {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--row-hover)] disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer"
      >
        Prev
      </button>
      <span className="text-xs text-[var(--text-muted)] font-medium px-2">Page {page} of {totalPages}</span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--row-hover)] disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer"
      >
        Next
      </button>
    </div>
  );
}
