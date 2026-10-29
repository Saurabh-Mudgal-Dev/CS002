export default function Field({ label, error, children, className = "" }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <label className="block text-xs font-semibold text-[var(--text-secondary)]">{label}</label>}
      <div>{children}</div>
      {error && <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
}
