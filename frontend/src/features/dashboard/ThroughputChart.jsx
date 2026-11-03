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
    <Card className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <Activity className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)] tracking-tight">
              Stock Velocity & Throughput
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Daily intake vs. distribution volume over the past 30 days
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
            <span className="w-2.5 h-2.5 rounded-[4px] bg-sky-500 shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
            <span>Intake</span>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
            <span className="w-2.5 h-2.5 rounded-[4px] bg-violet-500 shadow-[0_0_8px_rgba(167,139,250,0.6)]" />
            <span>Outflow</span>
          </div>
        </div>
      </div>

      <div className="h-[260px] w-full pt-2">
        {chartData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-xs text-[var(--text-dim)] gap-3 border border-dashed border-[var(--border-mid)] rounded-xl">
            <div className="p-3 rounded-xl bg-[var(--row-hover)] text-[var(--text-dim)]">
              <Activity className="w-6 h-6" />
            </div>
            No stock movement history recorded for this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="intakeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.30} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.30} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" className="dark:stroke-slate-800" vertical={false} />
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
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
                fillOpacity={1}
                fill="url(#intakeGrad)"
              />
              <Area
                type="monotone"
                dataKey="outflow"
                name={outflowLabel}
                stroke="#a855f7"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
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

