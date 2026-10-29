import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import Card from "../../components/ui/Card";
import { formatNumber } from "../../lib/format";
import { Activity } from "lucide-react";

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const intake = payload.find((p) => p.dataKey === "intake")?.value || 0;
    const outflow = payload.find((p) => p.dataKey === "outflow")?.value || 0;
    const net = intake - outflow;

    return (
      <div className="p-3 bg-[var(--bg-surface-elev)] border border-[var(--border-subtle)] rounded-xl shadow-lg text-xs space-y-1.5 min-w-[150px]">
        <p className="font-bold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-1">
          {label}
        </p>
        <div className="flex items-center justify-between text-[var(--accent)] font-semibold">
          <span>Intake:</span>
          <span className="tabular-nums">+{formatNumber(intake)}</span>
        </div>
        <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 font-semibold">
          <span>Outflow:</span>
          <span className="tabular-nums">-{formatNumber(outflow)}</span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-[var(--border-subtle)] font-bold">
          <span className="text-[var(--text-muted)]">Net Delta:</span>
          <span className={`tabular-nums ${net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
            {net >= 0 ? `+${formatNumber(net)}` : formatNumber(net)}
          </span>
        </div>
      </div>
    );
  }
  return null;
}

export default function ThroughputChart({ data = [], isNGO = true }) {
  const chartData = data && data.length > 0 ? data : [];

  const intakeLabel = isNGO ? "Aid Intake (Restock/Grants)" : "Inventory Intake (Procurement)";
  const outflowLabel = isNGO ? "Relief Disbursements" : "Customer Sales";

  return (
    <Card className="p-5 sm:p-6 border border-[var(--border-subtle)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[var(--accent)]" />
            <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
              Stock Velocity & Throughput
            </h2>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Daily intake vs. distribution volume over the past 30 days
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-[var(--accent)]">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span>Intake</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
            <span>Outflow</span>
          </div>
        </div>
      </div>

      <div className="h-[260px] w-full pt-2">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-[var(--text-dim)] border border-dashed border-[var(--border-subtle)] rounded-xl">
            No stock movement history recorded for this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="intakeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D97706" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#D97706" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="intake"
                name={intakeLabel}
                stroke="#2563EB"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#intakeGrad)"
              />
              <Area
                type="monotone"
                dataKey="outflow"
                name={outflowLabel}
                stroke="#D97706"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#outflowGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

