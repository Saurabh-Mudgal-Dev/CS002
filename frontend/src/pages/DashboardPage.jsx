import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import StatCard from "../components/common/StatCard";
import {
  Package,
  AlertTriangle,
  TrendingUp,
  Coins,
  HeartHandshake,
  Store,
  Plus,
  RefreshCw,
  Download,
  ArrowRight,
  History
} from "lucide-react";

export default function DashboardPage({
  stats,
  inventory,
  contextMode,
  userRole,
  onOpenAddModal,
  onOpenAdjustModal,
  onExportCSV
}) {
  const isNGO = contextMode === "ngo";
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const lowStockItems = inventory.filter((i) => i.quantity <= i.reorder_level);
  const urgentItem = lowStockItems.length > 0 ? lowStockItems[0] : null;

  const curvePoints = stats?.throughput_curve || [];
  const maxVal = Math.max(...curvePoints.map((p) => Math.max(p.intake, p.outflow)), 30);

  const getSvgY = (val) => {
    const height = 120;
    return height - (val / maxVal) * (height - 20) - 10;
  };

  const makePath = (key) =>
    curvePoints.length > 0
      ? curvePoints
          .map((p, idx) => {
            const x = (idx / (curvePoints.length - 1)) * 480 + 20;
            const y = getSvgY(p[key]);
            return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
          })
          .join(" ")
      : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-5"
    >
      {/* Context Hero Banner */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 sm:p-7 border shadow-2xl transition-colors"
        style={{
          background: isNGO
            ? "linear-gradient(135deg, var(--bg-card) 0%, rgba(245, 200, 66, 0.08) 100%)"
            : "linear-gradient(135deg, var(--bg-card) 0%, rgba(198, 139, 58, 0.08) 100%)",
          borderColor: "var(--border-subtle)"
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span
                className="p-2.5 rounded-2xl border"
                style={{
                  background: "var(--badge-bg)",
                  color: "var(--gold-vivid)",
                  borderColor: "var(--badge-border)"
                }}
              >
                {isNGO ? <HeartHandshake className="w-5 h-5" /> : <Store className="w-5 h-5" />}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
                {isNGO ? "Community Aid & Relief Command Center" : "Retail & Store Inventory Command"}
              </h2>
            </div>
            <p className="text-xs sm:text-sm font-medium max-w-xl leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {isNGO
                ? "Unified operational oversight of humanitarian aid supplies, donor grants, and field relief disbursements."
                : "Real-time stock balance, vendor procurement tracking, and counter sales velocity from a single pane."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {userRole !== "Volunteer" && onOpenAddModal && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onOpenAddModal}
                className="btn-gold flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black shadow-lg transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </motion.button>
            )}

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer"
              style={{
                background: "var(--bg-input)",
                borderColor: "var(--border-subtle)",
                color: "var(--text-secondary)"
              }}
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* 4 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Catalog SKUs"
          value={stats?.total_items || inventory.length}
          subtitle="Active items tracked"
          icon={Package}
          color="caramel"
          trend="Live Synced"
        />
        <StatCard
          title="Threshold Warnings"
          value={stats?.low_stock_count ?? lowStockItems.length}
          subtitle={lowStockItems.length > 0 ? "Requires restock" : "All stocks safe"}
          icon={AlertTriangle}
          color="amber"
          trend={lowStockItems.length > 0 ? "Action Needed" : "Optimal"}
        />
        <StatCard
          title={isNGO ? "Aid Dispatched Today" : "Units Sold Today"}
          value={`${stats?.total_outflow_today ?? 0} units`}
          subtitle={isNGO ? "Relief outreach volume" : "Counter sales volume"}
          icon={TrendingUp}
          color="latte"
          trend="Operational"
        />
        <StatCard
          title="Total Stock Valuation"
          value={`$${(stats?.total_valuation || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtitle="Combined inventory value"
          icon={Coins}
          color="caramel"
          trend="Real-Time"
        />
      </div>

      {/* Urgent Low-Stock Banner */}
      {urgentItem && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 rounded-3xl border border-amber-500/30 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl"
          style={{ background: "var(--bg-card)" }}
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/25 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-500">
                  Critical Low Stock
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/15 text-amber-400 border border-amber-500/25">
                  {urgentItem.sku}
                </span>
              </div>
              <p className="text-sm font-bold mt-0.5" style={{ color: "var(--text-primary)" }}>
                {urgentItem.name} — Only{" "}
                <span className="text-amber-500 font-extrabold">{urgentItem.quantity} units</span>{" "}
                remaining (safety threshold: {urgentItem.reorder_level})
              </p>
            </div>
          </div>

          {onOpenAdjustModal && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onOpenAdjustModal(urgentItem)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#0d0900] font-black text-xs shadow-lg shadow-amber-500/20 transition-all whitespace-nowrap cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Restock This SKU</span>
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Chart + Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Throughput Curve */}
        <div
          className="lg:col-span-2 rounded-3xl coffee-glass p-6 space-y-4 border shadow-2xl"
          style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)" }}
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-extrabold text-sm flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <TrendingUp className="w-4 h-4" style={{ color: "var(--gold-vivid)" }} />
                Operational Velocity — Last 7 Days
              </h3>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                Intake (Restocks) vs. Outflow ({isNGO ? "Aid Dispatches" : "Customer Sales"})
              </p>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--gold-vivid)" }} />
                <span style={{ color: "var(--text-muted)" }}>Intake</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span style={{ color: "var(--text-muted)" }}>Outflow</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <svg viewBox="0 0 520 130" className="w-full h-40 overflow-visible">
              {/* Grid lines */}
              <line x1="20" y1="110" x2="500" y2="110" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
              <line x1="20" y1="60" x2="500" y2="60" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="20" y1="10" x2="500" y2="10" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" strokeDasharray="3 3" />

              {/* Intake line */}
              {makePath("intake") && (
                <path d={makePath("intake")} fill="none" stroke="#f5c842" strokeWidth="2.5" strokeLinecap="round" />
              )}

              {/* Outflow dashed line */}
              {makePath("outflow") && (
                <path d={makePath("outflow")} fill="none" stroke="#fb7185" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 3" />
              )}

              {/* Interactive dots */}
              {curvePoints.map((p, idx) => {
                const x = (idx / Math.max(curvePoints.length - 1, 1)) * 480 + 20;
                return (
                  <g key={p.day}>
                    <circle
                      cx={x} cy={getSvgY(p.intake)} r="4"
                      className="fill-[#f5c842] stroke-white stroke-2 cursor-pointer"
                      onMouseEnter={() => setHoveredPoint({ ...p, type: "Intake", val: p.intake })}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                    <circle
                      cx={x} cy={getSvgY(p.outflow)} r="3.5"
                      className="fill-rose-400 stroke-white stroke-2 cursor-pointer"
                      onMouseEnter={() => setHoveredPoint({ ...p, type: "Outflow", val: p.outflow })}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                    <text x={x} y="125" textAnchor="middle" fill="currentColor" opacity="0.6" fontSize="10" fontWeight="600">
                      {p.day}
                    </text>
                  </g>
                );
              })}
            </svg>

            {hoveredPoint && (
              <div className="mt-2 text-center text-xs font-mono font-bold" style={{ color: "var(--gold-vivid)" }}>
                {hoveredPoint.day}: {hoveredPoint.type} = {hoveredPoint.val} units
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Stream with direct link to Audit Ledger */}
        <div
          className="rounded-3xl coffee-glass p-6 space-y-3 border shadow-2xl flex flex-col justify-between"
          style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)" }}
        >
          <div>
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: "var(--border-subtle)" }}>
              <h3 className="font-extrabold text-sm" style={{ color: "var(--text-primary)" }}>Recent Movements</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--text-muted)" }}>
                Live Stream
              </span>
            </div>

            <div className="space-y-2 mt-3 max-h-56 overflow-y-auto pr-1">
              {(stats?.recent_activities || []).length === 0 ? (
                <p className="text-xs text-center py-6 font-medium" style={{ color: "var(--text-dim)" }}>
                  No movements logged yet.
                </p>
              ) : (
                (stats?.recent_activities || []).slice(0, 5).map((log) => {
                  const isOutflow = log.quantity_change < 0;
                  return (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl border text-xs space-y-1 transition-colors"
                      style={{ background: "var(--bg-input)", borderColor: "var(--border-subtle)" }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold truncate" style={{ color: "var(--text-primary)" }}>{log.item_name}</span>
                        <span className={`font-mono font-extrabold shrink-0 ${isOutflow ? "text-rose-400" : "text-emerald-400"}`}>
                          {log.quantity_change > 0 ? `+${log.quantity_change}` : log.quantity_change}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] gap-2">
                        <span className="truncate" style={{ color: "var(--text-muted)" }}>{log.note || log.action_type}</span>
                        <span className="text-[10px] font-mono shrink-0" style={{ color: "var(--text-dim)" }}>
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <Link
            to="/audit-log"
            className="mt-3 flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-bold transition-all hover:border-[#f5c842]/40"
            style={{
              background: "var(--bg-input)",
              borderColor: "var(--border-subtle)",
              color: "var(--text-secondary)"
            }}
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4" style={{ color: "var(--gold-vivid)" }} />
              <span>Open Complete Audit Ledger</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
