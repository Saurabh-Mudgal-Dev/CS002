import Badge from "./Badge";

/*
 * KpiCard — Aurora KPI tile.
 * Icon tile top-left, uppercase display label, hero value, hairline footer.
 */
const tileStyles = {
  default: "bg-[var(--accent-soft)] text-[var(--accent)]",
  primary: "bg-[var(--accent-soft)] text-[var(--accent)]",
  violet: "bg-[var(--accent-soft)] text-[var(--accent)]",
  success: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
  info: "bg-sky-500/12 text-sky-600 dark:text-sky-400",
  danger: "bg-rose-500/12 text-rose-600 dark:text-rose-400",
};

const valueAccent = {
  danger: "text-rose-600 dark:text-rose-400",
  success: "text-emerald-600 dark:text-emerald-400",
};

export default function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  progress,           // optional 0..100 — renders a hairline meter in the footer
  footer,             // optional node rendered left of meter
  variant = "default",
  className = ""
}) {
  const tileClass = tileStyles[variant] || tileStyles.default;
  const valueClass = valueAccent[variant] || "text-[var(--text-primary)]";

  return (
    <div
      className={`group relative card-topline rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card-base)] p-5 shadow-[var(--shadow-card)] flex flex-col justify-between transition-all duration-300 hover:border-[var(--border-hot)] hover:shadow-[0_14px_40px_-14px_rgba(124,58,237,0.35)] hover:-translate-y-0.5 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <div className={`p-2.5 rounded-xl shrink-0 ${tileClass} shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]`}>
              <Icon className="w-5 h-5" />
            </div>
          )}
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)] whitespace-pre-line leading-snug">
            {title}
          </p>
        </div>
        {trend && (
          <Badge variant={variant === "danger" ? "danger" : "primary"} size="sm" className="shrink-0">
            {trend}
          </Badge>
        )}
      </div>

      <div className={`mt-4 text-[28px] leading-none font-extrabold tracking-tight tabular-nums ${valueClass}`}>
        {value}
      </div>

      <div className="mt-3.5 pt-3 border-t border-[var(--border-subtle)] space-y-2">
        {progress !== undefined && progress !== null && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-[var(--row-hover)] overflow-hidden">
              <div
                className="h-full rounded-full bg-accent-gradient transition-all duration-500"
                style={{ width: `${Math.max(Math.min(progress, 100), 0)}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-[var(--text-muted)] tabular-nums">
              {Math.round(progress)}%
            </span>
          </div>
        )}
        {footer && <div className="text-[10px] text-[var(--text-dim)]">{footer}</div>}
        <span className="block text-[11px] text-[var(--text-muted)] leading-snug text-left">
          {subtitle || "Current live indicator"}
        </span>
      </div>
    </div>
  );
}
