import React from "react";
import Badge from "./Badge";

export default function KpiCard({ title, value, subtitle, trend }) {
  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elev)] p-5 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        {title}
      </p>
      <div className="text-2xl font-semibold tabular-nums text-[var(--text-primary)]">{value}</div>
      {subtitle && <p className="text-xs text-[var(--text-muted)] mt-1">{subtitle}</p>}
      {trend && (
        <Badge variant="accent" className="mt-2 inline-flex">
          {trend}
        </Badge>
      )}
    </div>
  );
}

