export default function Card({ children, className = "", ...rest }) {
  return (
    <div
      className={`relative card-topline rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card-base)] text-[var(--text-secondary)] p-5 sm:p-6 shadow-[var(--shadow-card)] transition-all duration-300 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
