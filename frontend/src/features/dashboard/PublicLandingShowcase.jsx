import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import {
  Sparkles,
  ArrowRight,
  LogIn,
  FileSpreadsheet,
  FileText,
  Activity,
  Layers,
  HeartHandshake,
  Store,
  AlertTriangle,
  Clock,
  CheckCircle2,
  PlusCircle,
  Coins,
  TrendingUp,
  Boxes,
  ShieldCheck,
  Cpu
} from "lucide-react";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import { formatNumber, formatCurrency } from "../../lib/format";

// Realistic 30-Day Sample Data for NGO Mode
const NGO_THROUGHPUT_30D = Array.from({ length: 30 }, (_, i) => {
  const dayNum = i + 1;
  const intakeBase = [45, 0, 80, 20, 0, 110, 60, 0, 95, 30, 0, 140, 70, 0, 85, 40, 0, 120, 65, 0, 90, 50, 0, 130, 75, 0, 105, 45, 0, 160][i];
  const outflowBase = [30, 25, 40, 35, 20, 55, 45, 30, 60, 40, 25, 70, 50, 35, 65, 45, 30, 75, 55, 40, 70, 50, 35, 80, 60, 45, 75, 55, 40, 90][i];
  return {
    date: `2026-10-${dayNum < 10 ? "0" + dayNum : dayNum}`,
    day: `${dayNum} Oct`,
    intake: intakeBase,
    outflow: outflowBase,
  };
});

// Realistic 30-Day Sample Data for Retail Mode
const RETAIL_THROUGHPUT_30D = Array.from({ length: 30 }, (_, i) => {
  const dayNum = i + 1;
  const intakeBase = [80, 0, 120, 40, 0, 150, 90, 0, 130, 50, 0, 170, 100, 0, 140, 60, 0, 160, 110, 0, 135, 70, 0, 180, 115, 0, 150, 80, 0, 210][i];
  const outflowBase = [65, 55, 70, 60, 50, 95, 80, 65, 85, 70, 55, 110, 85, 65, 90, 75, 60, 105, 90, 70, 95, 80, 65, 115, 95, 75, 100, 85, 70, 130][i];
  return {
    date: `2026-10-${dayNum < 10 ? "0" + dayNum : dayNum}`,
    day: `${dayNum} Oct`,
    intake: intakeBase,
    outflow: outflowBase,
  };
});

function CustomChartTooltip({ active, payload, label }) {
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
          <span className="tabular-nums">+{formatNumber(intake)} units</span>
        </div>
        <div className="flex items-center justify-between text-amber-600 font-semibold">
          <span>Outflow:</span>
          <span className="tabular-nums">-{formatNumber(outflow)} units</span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-[var(--border-subtle)] font-bold">
          <span className="text-[var(--text-muted)]">Net Stock:</span>
          <span className={net >= 0 ? "text-emerald-600" : "text-rose-600"}>
            {net >= 0 ? `+${formatNumber(net)}` : formatNumber(net)}
          </span>
        </div>
      </div>
    );
  }
  return null;
}

export default function PublicLandingShowcase({ onDownloadReport, showToast = () => {} }) {
  const [activeMode, setActiveMode] = useState("ngo"); // "ngo" | "retail"
  const [timeRange, setTimeRange] = useState("30d"); // "7d" | "14d" | "30d"
  const [activeTab, setActiveTab] = useState("alerts"); // "alerts" | "ledger"
  const [simulatedStockDelta, setSimulatedStockDelta] = useState(0);

  const isNGO = activeMode === "ngo";

  const fullChartData = isNGO ? NGO_THROUGHPUT_30D : RETAIL_THROUGHPUT_30D;
  const chartData = useMemo(() => {
    if (timeRange === "7d") return fullChartData.slice(-7);
    if (timeRange === "14d") return fullChartData.slice(-14);
    return fullChartData;
  }, [fullChartData, timeRange]);

  const categoriesNGO = [
    { name: "Medical Relief", share: 38, valuation: 145000, color: "bg-blue-600", icon: PlusCircle },
    { name: "Emergency Rations", share: 32, valuation: 98000, color: "bg-emerald-600", icon: Boxes },
    { name: "Water & Sanitation", share: 18, valuation: 48000, color: "bg-sky-600", icon: Activity },
    { name: "Disaster Logistics", share: 12, valuation: 32000, color: "bg-amber-600", icon: Layers },
  ];

  const categoriesRetail = [
    { name: "Grocery & Staples", share: 42, valuation: 185000, color: "bg-blue-600", icon: Boxes },
    { name: "Daily Essentials", share: 26, valuation: 84000, color: "bg-indigo-600", icon: Store },
    { name: "Hardware & Electric", share: 18, valuation: 62000, color: "bg-emerald-600", icon: Cpu },
    { name: "Stationery & Misc", share: 14, valuation: 35000, color: "bg-amber-600", icon: Layers },
  ];

  const categories = isNGO ? categoriesNGO : categoriesRetail;

  const sampleAlertsNGO = [
    { id: 1, name: "Infant Nutritional Milk Formula 500g", sku: "FOD-INF-500", onHand: 0, reorder: 15, unit: "Cans", type: "out_of_stock", severity: "danger", note: "Critical: Zero stock remaining in relief triage depot." },
    { id: 2, name: "Paracetamol 500mg Tablets (Box of 100)", sku: "MED-PARA-500", onHand: 8, reorder: 20, unit: "Boxes", type: "low_stock", severity: "warning", note: "Safety threshold reached (8 left; minimum target 20)." },
    { id: 3, name: "Oral Rehydration Salts (ORS 50 Tabs)", sku: "MED-ORS-050", onHand: 12, reorder: 25, unit: "Boxes", type: "low_stock", severity: "warning", note: "High demand: community relief dispatch active." },
    { id: 4, name: "Chlorine Water Tablets (1000 Tabs)", sku: "SAN-WTR-1000", onHand: 42, reorder: 15, unit: "Bottles", type: "expiring", severity: "warning", note: "Expires in 18 days (2026-11-15)." },
  ];

  const sampleAlertsRetail = [
    { id: 1, name: "Heavy-Duty Alkaline Batteries (Pack of 10)", sku: "RTL-BATT-010", onHand: 4, reorder: 12, unit: "Packs", type: "low_stock", severity: "warning", note: "Low counter stock (4 remaining; restock target 12)." },
    { id: 2, name: "Premium Basmati Rice 5kg Bag", sku: "RTL-RCE-005", onHand: 6, reorder: 15, unit: "Bags", type: "low_stock", severity: "warning", note: "High weekend counter sales velocity." },
    { id: 3, name: "Refined Sunflower Cooking Oil 1L", sku: "RTL-OIL-001", onHand: 55, reorder: 20, unit: "Pouches", type: "expiring", severity: "warning", note: "Fresh lot batch expires in 28 days." },
  ];

  const sampleAlerts = isNGO ? sampleAlertsNGO : sampleAlertsRetail;

  const sampleMovementsNGO = [
    { id: 1, type: "RESTOCK", item: "Paracetamol 500mg (Box of 100)", delta: 50, actor: "Relief Manager", note: "Donation Grant from National Pharma Depot", time: "12m ago" },
    { id: 2, type: "RELIEF", item: "Thermal Foil Emergency Blankets", delta: -20, actor: "Field Volunteer", note: "Dispatched to Sector 4 Night Shelter", time: "1h ago" },
    { id: 3, type: "RELIEF", item: "Sterile Gauze Rolls (Pack of 20)", delta: -15, actor: "Field Volunteer", note: "Dispatched to Flood Emergency Unit", time: "3h ago" },
    { id: 4, type: "RESTOCK", item: "Chlorine Water Tablets (1000 Tabs)", delta: 30, actor: "Relief Manager", note: "Consignment from Water Aid Initiative", time: "5h ago" },
  ];

  const sampleMovementsRetail = [
    { id: 1, type: "SALE", item: "Basmati Rice 5kg Bag", delta: -3, actor: "Cashier Terminal", note: "Walk-in Retail Order #1042", time: "8m ago" },
    { id: 2, type: "RESTOCK", item: "Refined Sunflower Cooking Oil 1L", delta: 40, actor: "Store Owner", note: "Procured from Wholesale Mandi Hub", time: "45m ago" },
    { id: 3, type: "SALE", item: "Warm White LED Bulb 9W (Pack of 4)", delta: -2, actor: "Cashier Terminal", note: "Walk-in Retail Order #1041", time: "2h ago" },
  ];

  const sampleMovements = isNGO ? sampleMovementsNGO : sampleMovementsRetail;

  const handleSimulateRestock = () => {
    setSimulatedStockDelta((prev) => prev + 25);
    showToast("Interactive Restock Simulated: +25 units added to live catalog!", "success");
  };

  return (
    <div className="space-y-14 pb-16">
      {/* =========================================================================
          HERO SECTION (Alukaze SaaS Header with Framer Motion)
         ========================================================================= */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative pt-6 sm:pt-10 pb-6 text-center space-y-6 max-w-4xl mx-auto"
      >
        {/* Floating Glowing Pill */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-[var(--badge-bg)]/90 dark:bg-[var(--badge-bg)] border border-[var(--badge-border)]/80 dark:border-blue-900/50 text-[var(--accent)] dark:text-[var(--badge-text)] shadow-xs backdrop-blur-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-[var(--accent)] animate-pulse" />
          <span>Next-Gen Resource Logistics OS Â· Live Interactive Sandbox</span>
        </motion.div>

        {/* Hero Title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-3.5"
        >
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.12]">
            Smart Inventory & Resource Orchestration for{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 bg-clip-text text-transparent">
              NGO Relief
            </span>{" "}
            &{" "}
            <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent">
              Commercial Retail
            </span>
            .
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-[var(--text-muted)] dark:text-[var(--text-dim)] max-w-2xl mx-auto font-normal leading-relaxed">
            Gain complete real-time visibility over inventory turnover, relief disbursements, donor grants, and automated reorder safety thresholds â€” with zero setup required.
          </p>
        </motion.div>

        {/* Hero Action CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3 pt-2"
        >
          <Button
            variant="primary"
            size="lg"
            className="shadow-xs hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => document.getElementById("sandbox")?.scrollIntoView({ behavior: "smooth" })}
          >
            <span>Explore Interactive Sandbox</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
          <Link to="/login">
            <Button variant="secondary" size="lg">
              <LogIn className="w-4 h-4 mr-1.5 text-[var(--text-dim)]" />
              <span>Sign In to Workspace</span>
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => onDownloadReport("pdf")}
          >
            <FileText className="w-4 h-4 mr-1.5 text-rose-600" />
            <span>Download Sample PDF</span>
          </Button>
        </motion.div>

        {/* Trust & Metric Highlights Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto text-left"
        >
          <div className="p-4 rounded-2xl bg-[var(--bg-surface-elev)]/60 border border-[var(--border-subtle)] shadow-2xs hover:border-[var(--badge-border)] transition-colors">
            <div className="flex items-center justify-between text-[var(--accent)] mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] uppercase font-bold text-[var(--text-dim)]">Ledger</span>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tabular-nums">
              99.8%
            </div>
            <div className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5">
              Stock Audit Accuracy
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-surface-elev)]/60 border border-[var(--border-subtle)] shadow-2xs hover:border-[var(--badge-border)] transition-colors">
            <div className="flex items-center justify-between text-indigo-600 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-[10px] uppercase font-bold text-[var(--text-dim)]">Velocity</span>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tabular-nums">
              30-Day
            </div>
            <div className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5">
              Predictive Runway
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-surface-elev)]/60 border border-[var(--border-subtle)] shadow-2xs hover:border-[var(--badge-border)] transition-colors">
            <div className="flex items-center justify-between text-emerald-600 mb-1">
              <FileSpreadsheet className="w-4 h-4" />
              <span className="text-[10px] uppercase font-bold text-[var(--text-dim)]">Exports</span>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tabular-nums">
              1-Click
            </div>
            <div className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5">
              PDF & CSV Audits
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-surface-elev)]/60 border border-[var(--border-subtle)] shadow-2xs hover:border-[var(--badge-border)] transition-colors">
            <div className="flex items-center justify-between text-amber-600 mb-1">
              <Layers className="w-4 h-4" />
              <span className="text-[10px] uppercase font-bold text-[var(--text-dim)]">Tenancy</span>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tabular-nums">
              Dual-Core
            </div>
            <div className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5">
              NGO & Retail Scopes
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* =========================================================================
          INTERACTIVE SANDBOX & SAMPLE CHARTS (Alukaze Bento Showcase)
         ========================================================================= */}
      <section id="sandbox" className="space-y-6 pt-4 scroll-mt-24">
        {/* Sandbox Header with Smooth Animated Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-[var(--bg-surface-elev)] border border-[var(--border-subtle)] shadow-alukaze">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[var(--badge-bg)] dark:bg-[var(--badge-bg)] text-[var(--accent)]">
                <Activity className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                Live Interactive Sandbox
              </h2>
              <Badge variant="accent" size="sm">
                Interactive Preview
              </Badge>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Switch operational modes to observe real-time recalculation of velocity curves, safety runway, and category splits.
            </p>
          </div>

          {/* Animated Segmented Controller */}
          <div className="flex items-center p-1 rounded-xl bg-[var(--bg-surface)] dark:bg-[var(--bg-surface-elev)] border border-[var(--border-subtle)]/60 border-[var(--border-subtle)]/80 shrink-0 relative">
            <button
              type="button"
              onClick={() => setActiveMode("ngo")}
              className={`relative z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                isNGO ? "text-[var(--accent)]" : "text-[var(--text-secondary)] dark:text-[var(--text-dim)] hover:text-[var(--text-primary)]"
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Community Relief (NGO)</span>
              {isNGO && (
                <motion.div
                  layoutId="activeModePill"
                  className="absolute inset-0 bg-[var(--bg-surface-elev)] rounded-lg shadow-2xs -z-10"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveMode("retail")}
              className={`relative z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                !isNGO ? "text-amber-600 dark:text-amber-400" : "text-[var(--text-secondary)] dark:text-[var(--text-dim)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Commercial Retail (Store)</span>
              {!isNGO && (
                <motion.div
                  layoutId="activeModePill"
                  className="absolute inset-0 bg-[var(--bg-surface-elev)] rounded-lg shadow-2xs -z-10"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
            </button>
          </div>
        </div>

        {/* 4 Sandbox Metric Highlights with Motion */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <Card className="p-5 alukaze-card-hover">
              <div className="flex items-center justify-between text-[var(--text-dim)]">
                <p className="text-[11px] font-semibold uppercase tracking-wider">
                  In-Stock Valuation
                </p>
                <Coins className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tabular-nums pt-1">
                {isNGO ? "â‚¹3,23,000.00" : "â‚¹3,66,000.00"}
              </div>
              <div className="mt-2.5 text-xs text-[var(--text-muted)] flex items-center justify-between border-t border-[var(--border-subtle)] pt-2">
                <span>{isNGO ? "24 Medical & Aid SKUs" : "28 Retail Grocery SKUs"}</span>
                <span className="text-emerald-600 font-semibold">+14.2% MoM</span>
              </div>
            </Card>

            <Card className="p-5 alukaze-card-hover">
              <div className="flex items-center justify-between text-[var(--text-dim)]">
                <p className="text-[11px] font-semibold uppercase tracking-wider">
                  Safety Reorder Thresholds
                </p>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 tabular-nums pt-1">
                {sampleAlerts.length} Active Alerts
              </div>
              <div className="mt-2.5 text-xs text-[var(--text-muted)] flex items-center justify-between border-t border-[var(--border-subtle)] pt-2">
                <span>Automated buffer check</span>
                <Badge variant="warning" size="sm">Action Req</Badge>
              </div>
            </Card>

            <Card className="p-5 alukaze-card-hover">
              <div className="flex items-center justify-between text-[var(--text-dim)]">
                <p className="text-[11px] font-semibold uppercase tracking-wider">
                  30-Day Turnover Volume
                </p>
                <TrendingUp className="w-4 h-4 text-[var(--accent)]" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[var(--accent)] tabular-nums pt-1">
                {formatNumber((isNGO ? 1840 : 2650) + simulatedStockDelta)} Units
              </div>
              <div className="mt-2.5 text-xs text-[var(--text-muted)] flex items-center justify-between border-t border-[var(--border-subtle)] pt-2">
                <span>Intake vs Outflow volume</span>
                <span className="text-[var(--accent)] font-semibold">Live Velocity</span>
              </div>
            </Card>

            <Card className="p-5 flex flex-col justify-between alukaze-card-hover">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[var(--text-dim)]">
                  <p className="text-[11px] font-semibold uppercase tracking-wider">
                    Interactive Simulator
                  </p>
                  <Cpu className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-xs text-[var(--text-secondary)] dark:text-[var(--text-dim)] leading-tight">
                  Simulate an immediate restock movement to witness real-time updates.
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleSimulateRestock}
                className="mt-3 w-full py-2 px-3 rounded-xl bg-[var(--badge-bg)] dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-[var(--accent)] dark:text-[var(--badge-text)] font-bold text-xs border border-[var(--badge-border)]/80 dark:border-blue-900/60 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Simulate Restock (+25 Units)</span>
              </motion.button>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Main Sandbox Grid (8 cols Chart / 4 cols Category & Health) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8 cols): 30-Day Velocity Chart */}
          <Card className="lg:col-span-8 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[var(--accent)]" />
                  <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                    Stock Turnover & Throughput Velocity
                  </h3>
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  {isNGO
                    ? "Aid Intake (Restocks & Grants) vs. Humanitarian Relief Disbursements"
                    : "Vendor Procurement vs. Daily Counter Sales Volume"}
                </p>
              </div>

              {/* Time Range Selector */}
              <div className="flex items-center gap-1 bg-[var(--bg-surface)] dark:bg-[var(--bg-surface-elev)] p-0.5 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setTimeRange("7d")}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    timeRange === "7d"
                      ? "bg-[var(--bg-surface-elev)] text-[var(--text-primary)] shadow-2xs"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  7 Days
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange("14d")}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    timeRange === "14d"
                      ? "bg-[var(--bg-surface-elev)] text-[var(--text-primary)] shadow-2xs"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  14 Days
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange("30d")}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    timeRange === "30d"
                      ? "bg-[var(--bg-surface-elev)] text-[var(--text-primary)] shadow-2xs"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  30 Days
                </button>
              </div>
            </div>

            {/* Recharts Area Chart with AnimatePresence */}
            <div className="h-[280px] w-full pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sampleIntakeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="sampleOutflowGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D97706" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#D97706" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                    tickLine={false}
                    axisLine={{ stroke: "var(--border-subtle)" }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="intake"
                    name={isNGO ? "Aid Intake" : "Procurement"}
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#sampleIntakeGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="outflow"
                    name={isNGO ? "Relief Disbursements" : "Retail Sales"}
                    stroke="#D97706"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#sampleOutflowGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-[var(--accent)] font-semibold">
                  <span className="w-2.5 h-2.5 rounded-xs bg-blue-600" />
                  <span>{isNGO ? "Intake (Restocks/Grants)" : "Procurement Inflow"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-600 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-xs bg-amber-600" />
                  <span>{isNGO ? "Relief Dispatched" : "Customer Sales"}</span>
                </div>
              </div>
              <span className="text-[11px] text-[var(--text-dim)]">Live sample series</span>
            </div>
          </Card>

          {/* Right Column (4 cols): Category Breakdown & Health Runway */}
          <div className="lg:col-span-4 space-y-6">
            {/* Category Allocation Bento Card */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[var(--accent)]" />
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Category Composition
                  </h3>
                </div>
                <span className="text-[11px] text-[var(--text-dim)]">Share %</span>
              </div>

              {/* Progress stack */}
              <div className="h-2.5 w-full rounded-full bg-[var(--bg-surface)] dark:bg-[var(--bg-surface-elev)] flex overflow-hidden">
                {categories.map((c) => (
                  <div
                    key={c.name}
                    className={`h-full ${c.color} transition-all duration-300`}
                    style={{ width: `${c.share}%` }}
                    title={`${c.name}: ${c.share}%`}
                  />
                ))}
              </div>

              {/* Category details list */}
              <div className="space-y-2 pt-1 text-xs">
                {categories.map((c) => {
                  const CatIcon = c.icon;
                  return (
                    <div key={c.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <CatIcon className="w-3.5 h-3.5 text-[var(--text-dim)] shrink-0" />
                        <span className="text-[var(--text-secondary)] font-medium truncate">
                          {c.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 tabular-nums">
                        <span className="text-[var(--text-dim)]">{c.share}%</span>
                        <span className="font-semibold text-[var(--text-primary)]">
                          {formatCurrency(c.valuation)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Stock Health & Safety Runway */}
            <Card className="p-6 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Stock Health Runway
                  </h3>
                </div>
                <Badge variant="success" size="sm">Optimal</Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-[var(--text-secondary)]">Buffer Safety:</span>
                  <span className="text-emerald-600">24 Days Runway</span>
                </div>
                <div className="w-full bg-[var(--bg-surface)] dark:bg-[var(--bg-surface-elev)] h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: "74%" }} />
                </div>
                <p className="text-[11px] text-[var(--text-dim)] leading-relaxed pt-1">
                  74% of catalog items have sufficient stock to meet next month's predicted velocity.
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Tabbed Interactive Feed: Sample Alerts vs. Ledger Movements */}
        <Card className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("alerts")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "alerts"
                    ? "bg-[var(--bg-surface-elev)] text-white dark:bg-[var(--accent)] shadow-2xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Urgent Safety Alerts ({sampleAlerts.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("ledger")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "ledger"
                    ? "bg-[var(--bg-surface-elev)] text-white dark:bg-[var(--accent)] shadow-2xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Live Movements Ledger ({sampleMovements.length})</span>
              </button>
            </div>

            <div className="text-[11px] text-[var(--text-dim)]">
              Interactive sample data reflecting {isNGO ? "Community Relief" : "Retail Store"}
            </div>
          </div>

          {/* Active Tab Content with AnimatePresence */}
          <AnimatePresence mode="wait">
            {activeTab === "alerts" ? (
              <motion.div
                key="alerts-tab"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1"
              >
                {sampleAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3.5 rounded-xl border text-xs flex items-start justify-between gap-3 transition-colors ${
                      alert.severity === "danger"
                        ? "bg-rose-50/70 border-rose-200/80 dark:bg-rose-950/30 dark:border-rose-900/40"
                        : "bg-amber-50/70 border-amber-200/80 dark:bg-amber-950/30 dark:border-amber-900/40"
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[var(--text-primary)] truncate">
                          {alert.name}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase">
                          {alert.sku}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] dark:text-[var(--text-dim)]">
                        {alert.note}
                      </p>
                    </div>
                    <Badge variant={alert.severity === "danger" ? "danger" : "warning"} size="sm">
                      {alert.onHand} {alert.unit} Left
                    </Badge>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="ledger-tab"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="divide-y divide-[var(--border-subtle)] pt-1 text-xs"
              >
                {sampleMovements.map((m) => (
                  <div key={m.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Badge variant={m.delta > 0 ? "success" : "warning"} size="sm">
                        {m.type}
                      </Badge>
                      <div className="truncate">
                        <span className="font-semibold text-[var(--text-primary)] mr-2">
                          {m.item}
                        </span>
                        <span className="text-[11px] text-[var(--text-dim)] hidden sm:inline">
                          â€” {m.note}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 tabular-nums">
                      <span className={`font-bold ${m.delta > 0 ? "text-emerald-600" : "text-amber-600"}`}>
                        {m.delta > 0 ? `+${m.delta}` : m.delta} units
                      </span>
                      <span className="text-[var(--text-dim)] text-[11px]">{m.time}</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </section>

      {/* =========================================================================
          ALUKAZE BENTO FEATURE HIGHLIGHTS (Product Pillars with Hover Animations)
         ========================================================================= */}
      <section className="space-y-6 pt-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <Badge variant="primary" size="md">Core Architecture</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Built for Zero Friction & Complete Governance
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Engineered to fulfill university evaluation standards and real-world operational challenges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <Card className="p-6 space-y-3 h-full">
              <div className="w-10 h-10 rounded-xl bg-[var(--badge-bg)] text-[var(--accent)] dark:bg-[var(--badge-bg)] dark:text-[var(--accent)] flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[var(--text-primary)] text-sm">
                Dual-Purpose Tenancy
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Strict isolation separating non-profit donor grants from commercial retail sales without code bloat.
              </p>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <Card className="p-6 space-y-3 h-full">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[var(--text-primary)] text-sm">
                1-Click Boardroom Audits
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Export comprehensive UTF-8 BOM CSVs and formal ReportLab PDF documents with rupee (â‚¹) currency support.
              </p>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <Card className="p-6 space-y-3 h-full">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 flex items-center justify-center font-bold">
                <Coins className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[var(--text-primary)] text-sm">
                Role-Based Access Control
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Granular permission matrix guarding Admin, Inventory Manager, Accountant, and Field Volunteer accounts.
              </p>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <Card className="p-6 space-y-3 h-full">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[var(--text-primary)] text-sm">
                Predictive Alert Engine
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Real-time warnings for items reaching critical reorder levels or expiring within 30 days to avoid wastage.
              </p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          QUICK PERSONA LOGIN JUMP STRIP
         ========================================================================= */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white space-y-5 shadow-xl"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Ready to test with full administrative permissions?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Select any pre-seeded demo role to unlock financial ledgering, inventory adjustments, and user controls.
            </p>
          </div>
          <Link to="/login">
            <Button variant="gradient" size="lg" className="whitespace-nowrap">
              <span>Sign In to Your Workspace</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-xs">
          <Link to="/login" className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-colors block">
            <div className="font-bold text-white">Relief Admin</div>
            <div className="text-[10px] text-slate-300">Full system access</div>
          </Link>
          <Link to="/login" className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-colors block">
            <div className="font-bold text-white">Inventory Manager</div>
            <div className="text-[10px] text-slate-300">Stock & restock ops</div>
          </Link>
          <Link to="/login" className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-colors block">
            <div className="font-bold text-white">Accountant</div>
            <div className="text-[10px] text-slate-300">Donations & expenses</div>
          </Link>
          <Link to="/login" className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-colors block">
            <div className="font-bold text-white">Volunteer</div>
            <div className="text-[10px] text-slate-300">Relief field distribution</div>
          </Link>
          <Link to="/login" className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-colors block">
            <div className="font-bold text-white">Retail Owner</div>
            <div className="text-[10px] text-slate-300">Commercial shop view</div>
          </Link>
        </div>
      </motion.section>
    </div>
  );
}



