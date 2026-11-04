import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
  Coins,
  ArrowRight,
  HeartHandshake,
  Store,
  ShieldCheck,
  Lock,
  Unlock,
  Sparkles,
  LayoutDashboard
} from "lucide-react";
import Card from "../components/ui/Card";
import KpiCard from "../components/ui/KpiCard";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import ThroughputChart from "../features/dashboard/ThroughputChart";
import AlertsList from "../features/dashboard/AlertsList";
import RecentMovements from "../features/dashboard/RecentMovements";
import PublicLandingShowcase from "../features/dashboard/PublicLandingShowcase";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function OverviewPage({ showToast = () => {} }) {
  const { organization, isAuthenticated, guestOrgType, can } = useAuth();

  const [viewMode, setViewMode] = useState("dashboard"); // "dashboard" | "showcase"
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
  }, [showToast, isAuthenticated, guestOrgType]);

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

  // If user chooses Interactive Showcase & Tour mode, render PublicLandingShowcase
  if (viewMode === "showcase") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-card-base)] border border-[var(--border-subtle)] shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)]">
            <Sparkles className="w-4 h-4 text-[var(--accent)]" />
            <span>Interactive Product Tour Mode</span>
          </div>
          <button
            type="button"
            onClick={() => setViewMode("dashboard")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-gradient text-white text-xs font-bold shadow-[0_6px_18px_-6px_rgba(124,58,237,0.6)] hover:brightness-110 transition-all cursor-pointer"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Switch to Live Operations</span>
          </button>
        </div>
        <PublicLandingShowcase
          onDownloadReport={handleDownload}
          showToast={showToast}
        />
      </div>
    );
  }

  // Live Operations Overview (Visible to ALL: Guests and Authenticated Users)
  const isNGO = organization?.type === "ngo" || (!isAuthenticated && guestOrgType === "ngo");
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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-[var(--accent)]" />
              <span>Operations Overview</span>
            </h1>
            <Badge variant={isNGO ? "success" : "info"} size="sm">
              {isNGO ? "Humanitarian Aid" : "Retail Commercial"}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Live stock balance, 30-day velocity, and operational supply health
          </p>
        </div>

        {/* Actions Bar & Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Toggle */}
          <div className="flex items-center p-1 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode("dashboard")}
              className="px-3 py-1.5 rounded-lg bg-accent-gradient text-white shadow-sm font-bold cursor-pointer"
            >
              Live Operations
            </button>
            <button
              type="button"
              onClick={() => setViewMode("showcase")}
              className="px-3 py-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              Showcase Tour
            </button>
          </div>

          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-subtle)]/80 border-[var(--border-subtle)] bg-[var(--bg-surface-elev)] text-xs text-[var(--text-secondary)] dark:text-[var(--text-dim)] hover:text-[var(--text-primary)] dark:hover:text-[var(--text-primary)] transition-colors cursor-pointer"
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
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              <span>CSV</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDownload("pdf")}
              disabled={Boolean(downloadingReport)}
              title="Download formal operations and valuation PDF report"
            >
              <FileText className="w-3.5 h-3.5 mr-1 text-rose-600" />
              <span>PDF Report</span>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Guest Mode Notice vs Authenticated Staff Status */}
      {!isAuthenticated ? (
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-2xl bg-[var(--bg-card-base)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-[var(--shadow-card)] relative overflow-hidden card-topline"
        >
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-extrabold text-[var(--text-primary)] tracking-tight">
                Public Guest Mode · Operations Center Active
              </p>
              <p className="text-[var(--text-muted)] mt-0.5 leading-normal max-w-2xl">
                Live catalog metrics, stock movements, and alerts are fully open for grading and review. Sign in as <strong className="text-[var(--text-secondary)]">Admin</strong> or <strong className="text-[var(--text-secondary)]">Accountant</strong> to reveal unmasked financial reserves and ledger modification actions.
              </p>
            </div>
          </div>
          <Link to="/login" className="shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--accent-soft)] border border-[var(--badge-border)] text-[var(--badge-text)] font-bold hover:brightness-110 transition-all cursor-pointer">
              <Unlock className="w-3.5 h-3.5" />
              <span>Sign In to Unlock Staff Tools</span>
            </span>
          </Link>
        </motion.div>
      ) : (
        <motion.div
          variants={itemVariants}
          className="p-3.5 rounded-2xl bg-emerald-500/8 border border-emerald-500/25 flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-300"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>
              <strong>Authenticated Console:</strong> Live operational metrics synchronizing directly with relational database.
            </span>
          </div>
          <Badge variant="success" size="sm">Live Connected</Badge>
        </motion.div>
      )}

      {/* KPI Cards Row (4 cards) */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* KPI 1: Inventory Valuation */}
        <KpiCard
          title="Inventory Valuation"
          value={loading ? "—" : formatCurrency(kpis.total_valuation, currency)}
          subtitle={`${formatNumber(kpis.total_items)} active SKUs in catalog`}
          icon={Package}
          variant="primary"
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
          variant={kpis.low_stock_count > 0 ? "warning" : "success"}
        />

        {/* KPI 3: Expiring Soon */}
        <KpiCard
          title="Expiring Within 30 Days"
          value={loading ? "—" : formatNumber(kpis.expiring_soon_count || 0)}
          subtitle={
            kpis.expired_count > 0
              ? `${kpis.expired_count} item${kpis.expired_count === 1 ? "" : "s"} already expired`
              : "Quality & shelf-life safety check"
          }
          icon={Clock}
          variant={(kpis.expiring_soon_count || 0) > 0 ? "warning" : "info"}
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
        ) : (
          <KpiCard
            title="Net Reserve Position"
            value="₹ — / ₹ —"
            subtitle="Sign in as Accountant to reveal unmasked financial vouchers"
            icon={Coins}
            variant="primary"
            progress={0}
            footer={
              <span className="inline-flex items-center gap-1 font-bold">
                <Lock className="w-3 h-3" />
                Accountant View
              </span>
            }
          />
        )}
      </motion.div>

      {/* Main Grid: Charts & Alerts */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
      >
        {/* Left Column (8 cols): Throughput Chart & Recent Movements */}
        <div className="lg:col-span-8 space-y-6">
          <ThroughputChart data={throughputCurve} isNGO={isNGO} />
          <RecentMovements movements={recentMovements} currency={currency} />
        </div>

        {/* Right Column (4 cols): Alerts List & Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          <AlertsList alerts={alerts} />

          {/* Operations Guidelines Card */}
          <Card className="p-5 space-y-3.5 border border-[var(--border-subtle)]">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] dark:text-[var(--text-dim)]">
              {isNGO ? <HeartHandshake className="w-4 h-4 text-[var(--accent)]" /> : <Store className="w-4 h-4 text-amber-600" />}
              <span>{isNGO ? "Humanitarian Guidelines" : "Store Management"}</span>
            </div>
            <div className="text-xs text-[var(--text-secondary)] dark:text-[var(--text-dim)] space-y-2 leading-relaxed">
              <p>
                <strong>Stock Reorder Rule:</strong> Any item reaching or falling below safety threshold triggers an operational alert.
              </p>
              <p>
                <strong>Audit Compliance:</strong> All restocks, distributions, and counter sales post immutable ledger entries to prevent inventory shrinkage.
              </p>
            </div>
            <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <Link
                to="/inventory"
                className="text-xs font-semibold text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Browse Full Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/finance"
                className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] dark:hover:text-[var(--text-primary)] flex items-center gap-1 cursor-pointer"
              >
                <span>Financial Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}



