import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  History,
  Search,
  Filter,
  RefreshCw,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  Edit,
  Trash2,
  ShieldCheck,
  Calendar
} from "lucide-react";
import { getActivityLogs, downloadCSVUrl } from "../api/client";

export default function AuditLogPage({ contextMode, userRole, onExportCSV }) {
  const isNGO = contextMode === "ngo";
  const [logs, setLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All");

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getActivityLogs({
        action_type: actionFilter,
        search: search.trim() || undefined,
        limit: 100
      });
      setLogs(data.items || []);
      setTotalCount(data.total || 0);
    } catch (err) {
      console.error("Failed to fetch activity logs:", err);
    } finally {
      setLoading(false);
    }
  }, [actionFilter, search]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const actionCategories = [
    { key: "All", label: "All Movements" },
    { key: "RESTOCK", label: "Restocks & Intake" },
    { key: isNGO ? "RELIEF_DISTRIBUTION" : "SALE", label: isNGO ? "Relief Dispatched" : "Customer Sales" },
    { key: "ITEM_CREATED", label: "Catalog Additions" },
    { key: "ITEM_UPDATED", label: "Modifications" },
    { key: "ITEM_DELETED", label: "Decommissioned" }
  ];

  const getActionBadge = (actionType) => {
    switch (actionType) {
      case "RESTOCK":
        return {
          label: "Restock",
          icon: ArrowUpRight,
          classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
        };
      case "RELIEF_DISTRIBUTION":
        return {
          label: "Relief Aid",
          icon: ArrowDownRight,
          classes: "bg-amber-500/15 text-amber-400 border-amber-500/25"
        };
      case "SALE":
        return {
          label: "Counter Sale",
          icon: ArrowDownRight,
          classes: "bg-amber-500/15 text-amber-300 border-amber-500/25"
        };
      case "ITEM_CREATED":
        return {
          label: "SKU Created",
          icon: PlusCircle,
          classes: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25"
        };
      case "ITEM_UPDATED":
        return {
          label: "SKU Updated",
          icon: Edit,
          classes: "bg-blue-500/15 text-blue-400 border-blue-500/25"
        };
      case "ITEM_DELETED":
        return {
          label: "SKU Deleted",
          icon: Trash2,
          classes: "bg-rose-500/15 text-rose-400 border-rose-500/25"
        };
      default:
        return {
          label: actionType,
          icon: History,
          classes: "bg-stone-500/15 text-stone-300 border-stone-500/25"
        };
    }
  };

  return (
    <div
      
      
      
      className="space-y-4"
    >
      {/* Page Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6   border shadow-2xl"
        style={{ borderColor: "var(--border-subtle)", background: "var(--bg-card)" }}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span
              className="p-2.5 rounded-2xl border"
              style={{
                background: "var(--badge-bg)",
                color: "var(--accent)",
                borderColor: "var(--badge-border)"
              }}
            >
              <History className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Audit Ledger & Movement History
            </h2>
          </div>
          <p className="text-xs font-medium max-w-xl" style={{ color: "var(--text-muted)" }}>
            Tamper-evident activity trail recording all stock intakes, disbursements, counter sales, and catalog governance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer"
            style={{
              background: "var(--bg-input)",
              borderColor: "var(--border-subtle)",
              color: "var(--text-secondary)"
            }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            
            onClick={onExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer"
            style={{
              background: "var(--bg-input)",
              borderColor: "var(--border-subtle)",
              color: "var(--text-secondary)"
            }}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-dim)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by item name, note, or operator..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border text-xs transition-colors focus:outline-none focus:border-[#f5c842]/40"
            style={{
              background: "var(--bg-input)",
              borderColor: "var(--border-subtle)",
              color: "var(--text-primary)"
            }}
          />
        </div>

        {/* Action Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {actionCategories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActionFilter(cat.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                actionFilter === cat.key
                  ? "bg-gradient-to-r from-[#f5c842] to-[#e8a722] text-[#0d0900] border-transparent shadow-md shadow-[#f5c842]/20 font-black"
                  : "border text-xs"
              }`}
              style={
                actionFilter !== cat.key
                  ? {
                      background: "var(--bg-input)",
                      borderColor: "var(--border-subtle)",
                      color: "var(--text-muted)"
                    }
                  : {}
              }
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div
        className="  overflow-hidden border shadow-2xl"
        style={{ borderColor: "var(--border-subtle)", background: "var(--bg-card)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr
                className="border-b uppercase font-bold tracking-wider text-[10px]"
                style={{
                  background: "var(--table-header-bg)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-muted)"
                }}
              >
                <th className="py-3.5 px-5">Timestamp</th>
                <th className="py-3.5 px-3">Action Type</th>
                <th className="py-3.5 px-4">Item & Context</th>
                <th className="py-3.5 px-3 text-right">Quantity Delta</th>
                <th className="py-3.5 px-4">Reference Note</th>
                <th className="py-3.5 px-5 text-right">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm font-semibold" style={{ color: "var(--text-dim)" }}>
                    {loading ? "Loading audit records..." : "No matching activity movements found."}
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const badge = getActionBadge(log.action_type);
                  const Icon = badge.icon;
                  const dateObj = new Date(log.timestamp);
                  const formattedDate = dateObj.toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  });
                  const formattedTime = dateObj.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  });

                  return (
                    <tr
                      key={log.id}
                      className="transition-colors hover:bg-black/5"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {/* Timestamp */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="font-semibold" style={{ color: "var(--text-primary)" }}>{formattedDate}</div>
                        <div className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>{formattedTime}</div>
                      </td>

                      {/* Action Badge */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${badge.classes}`}>
                          <Icon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* Item */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold" style={{ color: "var(--text-primary)" }}>{log.item_name}</div>
                      </td>

                      {/* Quantity Delta */}
                      <td className="py-3.5 px-3 text-right font-mono font-black tabular-nums">
                        {log.quantity_change > 0 ? (
                          <span className="text-emerald-400">+{log.quantity_change}</span>
                        ) : log.quantity_change < 0 ? (
                          <span className="text-rose-400">{log.quantity_change}</span>
                        ) : (
                          <span style={{ color: "var(--text-dim)" }}>â€”</span>
                        )}
                      </td>

                      {/* Note */}
                      <td className="py-3.5 px-4 max-w-xs truncate text-xs" style={{ color: "var(--text-secondary)" }}>
                        {log.note || "Standard operational adjustment"}
                      </td>

                      {/* Performed By */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-[11px] font-semibold"
                          style={{
                            background: "var(--bg-input)",
                            borderColor: "var(--border-subtle)",
                            color: "var(--text-secondary)"
                          }}
                        >
                          <ShieldCheck className="w-3 h-3" style={{ color: "var(--accent)" }} />
                          <span>{log.performed_by || "System"}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

