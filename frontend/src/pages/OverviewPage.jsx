import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import { api } from "../lib/api";
import { formatCurrency, formatNumber } from "../lib/format";
import { PERMISSIONS } from "../lib/permissions";
import {
  Package,
  AlertTriangle,
  Clock,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Lock,
  Coins,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
  Store,
  LogIn
} from "lucide-react";
import Card from "../components/ui/Card";
import KpiCard from "../components/ui/KpiCard";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import ThroughputChart from "../features/dashboard/ThroughputChart";
import AlertsList from "../features/dashboard/AlertsList";
import RecentMovements from "../features/dashboard/RecentMovements";

export default function OverviewPage({ showToast = () => {} }) {
  const { organization, isAuthenticated, can } = useAuth();

  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [downloadingReport, setDownloadingReport] = useState(null);

  useEffect(() => {
    let isMounted = true;

    api.dashboard.getSummary()
      .then((data) => {
        if (isMounted) {
          setSummaryData(data);
          setLastUpdated(new Date());
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to load overview data:", err);
          showToast(err.message || "Unable to refresh operational summary.", "error");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [showToast, isAuthenticated]);

  const handleManualRefresh = async () => {
    try {
      setRefreshing(true);
      const data = await api.dashboard.getSummary();
      setSummaryData(data);
      setLastUpdated(new Date());
      showToast("Operations overview refreshed", "success");
    } catch (err) {
      showToast(err.message || "Failed to refresh metrics.", "error");
    } finally {
      setRefreshing(false);
    }
  };

  const handleDownload = async (reportType) => {
    try {
      setDownloadingReport(reportType);
      showToast(`Generating ${reportType.toUpperCase()} export...`, "info");

      let filename = "";
      if (reportType === "inventory_csv") {
        filename = await api.reports.downloadInventoryCsv();
      } else if (reportType === "finance_csv") {
        filename = await api.reports.downloadFinanceCsv();
      } else if (reportType === "pdf") {
        filename = await api.reports.downloadPdf();
      }

      showToast(`Downloaded: ${filename}`, "success");
    } catch (err) {
      showToast(err.message || `Failed to download ${reportType} report.`, "error");
    } finally {
      setDownloadingReport(null);
    }
  };

  const isNGO = organization?.type === "ngo";
  const currency = organization?.currency || "INR";
  const kpis = summaryData?.kpis || {};
  const alerts = summaryData?.alerts || [];
  const throughputCurve = summaryData?.throughput_curve || [];
  const recentMovements = summaryData?.recent_movements || [];
  const finance = summaryData?.finance;

  const canViewFinance = can(PERMISSIONS.VIEW_FINANCE);

  const formattedUpdateTime = lastUpdated
    ? new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit" }).format(lastUpdated)
    : "—";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Operations Overview
            </h1>
            <Badge variant={isNGO ? "success" : "info"} size="sm">
              {isNGO ? "Humanitarian Aid" : "Retail Commercial"}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Live stock balance, 30-day velocity, and operational supply health
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elev)] text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-mid)] transition-colors cursor-pointer"
            title="Refresh overview metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[var(--accent)]" : ""}`} />
            <span>Updated {formattedUpdateTime}</span>
          </button>

          {/* Report Download Buttons */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDownload("inventory_csv")}
              disabled={Boolean(downloadingReport)}
              title="Download full inventory CSV audit sheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
              <span>CSV</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDownload("pdf")}
              disabled={Boolean(downloadingReport)}
              title="Download formal operations and valuation PDF report"
            >
              <FileText className="w-3.5 h-3.5 mr-1 text-red-600 dark:text-red-400" />
              <span>PDF Report</span>
            </Button>

            {canViewFinance && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDownload("finance_csv")}
                disabled={Boolean(downloadingReport)}
                title="Download combined purchases, donations, and expenses CSV"
              >
                <Coins className="w-3.5 h-3.5 mr-1 text-amber-600 dark:text-amber-400" />
                <span>Finance CSV</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Guest Notice Banner if unauthenticated */}
      {!isAuthenticated && (
        <div className="p-3.5 sm:p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-blue-900 dark:text-blue-200">
            <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <span className="font-semibold">Public Overview Active: </span>
              <span className="text-blue-800 dark:text-blue-300">
                You can freely browse inventory items, view stock throughput, and download catalog reports without an account.
              </span>
            </div>
          </div>
          <Link to="/login" className="shrink-0">
            <Button variant="primary" size="sm" className="w-full sm:w-auto">
              <LogIn className="w-3.5 h-3.5 mr-1" />
              Sign in for Financials & Management
            </Button>
          </Link>
        </div>
      )}

      {/* KPI Cards Row (4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Inventory Valuation */}
        <KpiCard
          title="Inventory Valuation"
          value={loading ? "—" : formatCurrency(kpis.total_valuation, currency)}
          subtitle={`${formatNumber(kpis.total_items)} active SKUs in catalog`}
          icon={Package}
        />

        {/* KPI 2: Low Stock Alerts */}
        <KpiCard
          title="Low Stock Items"
          value={loading ? "—" : formatNumber(kpis.low_stock_count)}
          subtitle={
            kpis.critical_count > 0
              ? `${kpis.critical_count} critical out of stock`
              : "Items at or below reorder limit"
          }
          icon={AlertTriangle}
          variant={kpis.low_stock_count > 0 ? "warning" : "default"}
        />

        {/* KPI 3: Expiring Soon */}
        <KpiCard
          title="Expiring Within 30 Days"
          value={loading ? "—" : formatNumber(kpis.expiring_soon_count || 0)}
          subtitle={
            kpis.expired_count > 0
              ? `${kpis.expired_count} items already expired`
              : "Quality & shelf-life safety check"
          }
          icon={Clock}
          variant={(kpis.expiring_soon_count || 0) > 0 ? "warning" : "default"}
        />

        {/* KPI 4: Net Position / Finance (Role-Aware) */}
        {canViewFinance && finance ? (
          <KpiCard
            title="Net Financial Position"
            value={formatCurrency(finance.net_position, currency)}
            subtitle={`Income ${formatCurrency(finance.cash_income, currency)} · Exp ${formatCurrency(finance.expenses, currency)}`}
            icon={Coins}
            variant={finance.net_position >= 0 ? "success" : "danger"}
          />
        ) : !isAuthenticated ? (
          <Card className="p-4 border border-[var(--border-subtle)] flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium">
                <span>Net Cash Position</span>
                <Lock className="w-3.5 h-3.5 text-[var(--text-dim)]" />
              </div>
              <p className="text-base font-bold text-[var(--text-primary)]">
                Locked (Sign in)
              </p>
              <p className="text-[11px] text-[var(--text-dim)] leading-tight">
                Cash flow & purchase accounts require authorized login.
              </p>
            </div>
            <Link to="/login" className="mt-3 pt-2 border-t border-[var(--border-subtle)] text-[11px] text-[var(--accent)] font-medium hover:underline flex items-center justify-between">
              <span>Sign in to unlock</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </Card>
        ) : (
          <KpiCard
            title="Aid Field Disbursements"
            value={formatNumber(recentMovements.filter((m) => m.movement_type === "RELIEF").length)}
            subtitle="Recorded community dispatches"
            icon={HeartHandshake}
            variant="default"
          />
        )}
      </div>

      {/* Main Grid: Charts & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Throughput Chart & Recent Movements */}
        <div className="lg:col-span-8 space-y-6">
          <ThroughputChart data={throughputCurve} isNGO={isNGO} />
          <RecentMovements movements={recentMovements} currency={currency} />
        </div>

        {/* Right Column (4 cols): Alerts List & Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          <AlertsList alerts={alerts} />

          {/* Quick Operations Guide Card */}
          <Card className="p-5 border border-[var(--border-subtle)] space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              {isNGO ? <HeartHandshake className="w-4 h-4 text-[var(--accent)]" /> : <Store className="w-4 h-4 text-[var(--accent)]" />}
              <span>{isNGO ? "Humanitarian Guidelines" : "Store Management"}</span>
            </div>
            <div className="text-xs text-[var(--text-secondary)] space-y-2 leading-relaxed">
              <p>
                <strong>Stock Reorder Rule:</strong> Any item reaching or falling below safety threshold triggers an operational alert.
              </p>
              <p>
                <strong>Audit Compliance:</strong> All restocks, distributions, and counter sales post immutable ledger entries to prevent inventory shrinkage.
              </p>
            </div>
            <div className="pt-2 border-t border-[var(--border-subtle)]">
              <Link
                to="/inventory"
                className="text-xs font-medium text-[var(--accent)] hover:underline flex items-center justify-between"
              >
                <span>Browse Complete Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
