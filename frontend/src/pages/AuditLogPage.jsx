import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import { api } from "../lib/api";
import { formatTimeAgo, formatDate } from "../lib/format";
import { PERMISSIONS } from "../lib/permissions";
import {
  History,
  Search,
  RefreshCw,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  Edit,
  Trash2,
  ShieldCheck,
  Lock,
  Unlock,
  Key
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

export default function AuditLogPage({ contextMode = "ngo", userRole = "Guest", onExportCSV }) {
  const { isAuthenticated, can } = useAuth();
  const isNGO = contextMode === "ngo";

  const [logs, setLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All");

  const canViewForensics = can(PERMISSIONS.VIEW_AUDIT);

  useEffect(() => {
    let isMounted = true;

    api.activities.list({
      action_type: actionFilter,
      search: search.trim() || undefined,
      limit: 100,
    })
      .then((data) => {
        if (isMounted) {
          setLogs(data?.items || []);
          setTotalCount(data?.total || 0);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to load activity logs:", err);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [actionFilter, search]);

  const handleRefresh = () => {
    setLoading(true);
    api.activities.list({
      action_type: actionFilter,
      search: search.trim() || undefined,
      limit: 100,
    })
      .then((data) => {
        setLogs(data?.items || []);
        setTotalCount(data?.total || 0);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const actionCategories = [
    { key: "All", label: "All Movements" },
    { key: "RESTOCK", label: "Restocks & Inflow" },
    { key: isNGO ? "RELIEF_DISTRIBUTION" : "SALE", label: isNGO ? "Relief Dispatched" : "Customer Sales" },
    { key: "ITEM_CREATED", label: "SKU Created" },
    { key: "ITEM_UPDATED", label: "Modified" },
    { key: "ITEM_DELETED", label: "Decommissioned" }
  ];

  const getActionBadge = (actionType) => {
    switch (actionType?.toUpperCase()) {
      case "RESTOCK":
        return {
          label: "Restock",
          icon: ArrowUpRight,
          variant: "success",
        };
      case "RELIEF_DISTRIBUTION":
        return {
          label: "Relief Aid",
          icon: ArrowDownRight,
          variant: "warning",
        };
      case "SALE":
        return {
          label: "Counter Sale",
          icon: ArrowDownRight,
          variant: "info",
        };
      case "ITEM_CREATED":
        return {
          label: "SKU Created",
          icon: PlusCircle,
          variant: "info",
        };
      case "ITEM_UPDATED":
        return {
          label: "Modified",
          icon: Edit,
          variant: "neutral",
        };
      case "ITEM_DELETED":
        return {
          label: "Deleted",
          icon: Trash2,
          variant: "danger",
        };
      default:
        return {
          label: actionType || "Movement",
          icon: History,
          variant: "neutral",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
              <History className="w-6 h-6 text-[var(--accent)]" />
              <span>Immutable Audit Trail & Forensics</span>
            </h1>
            <Badge variant="accent" size="sm">Append-Only</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Showing <strong className="text-[var(--text-primary)]">{logs.length}</strong> of {totalCount || logs.length} tracked activity ledger vouchers
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? "animate-spin text-[var(--accent)]" : ""}`} />
            <span>Sync Ledger</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onExportCSV}
            title="Download CSV Audit Sheet"
          >
            <Download className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Guest Mode Banner vs Authenticated Forensic Unlocked Notice */}
      {!isAuthenticated ? (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 to-indigo-50/50 dark:from-[var(--bg-surface-elev)] dark:to-[var(--bg-surface-elev)]/60 border border-[var(--badge-border)]/80 border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-[var(--text-primary)]">
                Public Ledger Transparency Active
              </p>
              <p className="text-[var(--text-muted)] mt-0.5 leading-tight">
                All operational stock movements, items, quantities, and timestamps are publicly auditable. Sign in as <strong>Admin</strong> or <strong>Manager</strong> to unlock raw client IPv6 forensic signatures and cryptographically verified actor hashes.
              </p>
            </div>
          </div>
          <Link to="/login" className="shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-surface-elev)] border border-[var(--badge-border)] border-[var(--border-subtle)] text-[var(--accent)] font-bold hover:shadow-xs transition-all cursor-pointer">
              <Unlock className="w-3.5 h-3.5" />
              <span>Sign In as Admin</span>
            </span>
          </Link>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>
              <strong>Forensic Audit Unlocked:</strong> Raw network client IPs, actor identifiers, and verification signatures accessible to <strong>{userRole}</strong>.
            </span>
          </div>
          <Badge variant="success" size="sm">Forensics Active</Badge>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail by item, actor, or notes..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-surface-elev)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder-[var(--text-dim)] focus:outline-none focus:ring-2 focus:ring-[var(--border-hot)]/20 focus:border-[var(--border-hot)] transition-all shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {actionCategories.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setActionFilter(c.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border ${
                actionFilter === c.key
                  ? "bg-[var(--bg-surface-elev)] text-white dark:bg-[var(--accent)] border-[var(--border-subtle)] dark:border-[var(--border-hot)] shadow-xs"
                  : "bg-[var(--bg-surface-elev)] border-[var(--border-subtle)] text-[var(--text-secondary)] dark:text-[var(--text-dim)] hover:bg-[var(--row-hover)]"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <Card className="overflow-hidden border border-[var(--border-subtle)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/60 dark:bg-[var(--bg-surface-elev)]/40 uppercase font-semibold tracking-wider text-[10px] text-[var(--text-dim)]">
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Item & SKU Reference</th>
                <th className="py-3 px-3 text-right">Stock Impact</th>
                <th className="py-3 px-4">Context Note / Reason</th>
                <th className="py-3 px-4">Authorized Actor</th>
                <th className="py-3 px-4">Network Forensic IP</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-sm text-[var(--text-dim)] font-medium">
                    {loading ? "Loading audit records..." : "No activity logs match the selected filter."}
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const badge = getActionBadge(log.action_type);
                  const isPositive = log.quantity_delta > 0;

                  return (
                    <tr key={log.id} className="transition-colors hover:bg-[var(--row-hover)]">
                      {/* Action Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <Badge variant={badge.variant} size="sm">
                          {badge.label}
                        </Badge>
                      </td>

                      {/* Item & SKU */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-[var(--text-primary)]">
                          {log.item_name || "General Catalog"}
                        </div>
                        {log.sku && (
                          <div className="text-[10px] font-mono text-[var(--text-dim)]">
                            {log.sku}
                          </div>
                        )}
                      </td>

                      {/* Stock Impact */}
                      <td className="py-3 px-3 text-right font-bold tabular-nums">
                        {log.quantity_delta !== 0 ? (
                          <span className={isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
                            {isPositive ? `+${log.quantity_delta}` : log.quantity_delta}
                          </span>
                        ) : (
                          <span className="text-[var(--text-dim)]">â€”</span>
                        )}
                      </td>

                      {/* Note / Details */}
                      <td className="py-3 px-4 max-w-xs text-[var(--text-secondary)]">
                        <p className="truncate" title={log.details || log.note}>
                          {log.details || log.note || "Standard operational entry"}
                        </p>
                      </td>

                      {/* Actor */}
                      <td className="py-3 px-4 text-[var(--text-primary)] font-medium whitespace-nowrap">
                        {log.performed_by || "System Core"}
                      </td>

                      {/* Forensic IP (FEATURE: Auth reveals raw IP, Guest sees masked) */}
                      <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap">
                        {isAuthenticated && canViewForensics ? (
                          <span className="text-[var(--text-secondary)] font-semibold">
                            {log.ip_address || "127.0.0.1"}
                          </span>
                        ) : (
                          <span className="text-[var(--text-dim)] flex items-center gap-1" title="Sign in as Admin to reveal client forensic IP">
                            <Lock className="w-3 h-3 text-[var(--text-dim)]" />
                            <span>192.168.***.***</span>
                          </span>
                        )}
                      </td>

                      {/* Timestamp */}
                      <td className="py-3 px-4 text-right text-[var(--text-dim)] whitespace-nowrap">
                        <div className="text-[var(--text-secondary)] font-medium">
                          {formatTimeAgo(log.timestamp)}
                        </div>
                        <div className="text-[10px] text-[var(--text-dim)]">
                          {formatDate(log.timestamp)}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}



