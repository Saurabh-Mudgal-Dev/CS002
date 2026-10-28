import React from "react";

export default function Pagination({ page, totalPages, onChange, className = "" }) {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="rounded-md border border-[var(--border-mid)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface)] disabled:opacity-50 disabled:pointer-events-none transition-colors"
      >
        Prev
      </button>
      <span className="text-xs text-[var(--text-muted)]">Page {page} of {totalPages}</span>
      <button
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="rounded-md border border-[var(--border-mid)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface)] disabled:opacity-50 disabled:pointer-events-none transition-colors"
      >
        Next
      </button>
    </div>
  );
}

