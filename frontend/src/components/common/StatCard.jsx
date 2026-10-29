import React from "react";
import Badge from "../ui/Badge.jsx";

export default function StatCard({ title, value, subtitle, icon: Icon, trend }) {
  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elev)] p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {title}
          </span>
          <div className="text-2xl font-semibold tabular-nums text-[var(--text-primary)]">{value}</div>
        </div>
        {Icon && (
          <div className="p-2 rounded-md border border-[var(--border-mid)] bg-[var(--bg-input)]">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {subtitle && <p className="mt-3 text-xs text-[var(--text-muted)]">{subtitle}</p>}
      {trend && <Badge variant="accent" className="mt-3 inline-flex">{trend}</Badge>}
    </div>
  );
}
