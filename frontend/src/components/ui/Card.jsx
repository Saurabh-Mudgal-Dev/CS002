export default function Card({ children, className = "", ...rest }) {
  return (
    <div
      className={`rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elev)] p-5 sm:p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_4px_16px_-2px_rgba(15,23,42,0.04)] transition-all ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
