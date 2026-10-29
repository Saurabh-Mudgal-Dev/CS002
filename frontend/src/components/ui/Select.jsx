export default function Select({ id, className = "", ...rest }) {
  return (
    <select
      id={id}
      className={`w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] px-3.5 py-2.5 text-xs sm:text-sm text-[var(--text-primary)] dark:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:border-[var(--border-hot)] ring-premium transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${className}`}
      {...rest}
    />
  );
}
