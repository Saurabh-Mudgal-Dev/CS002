import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../features/auth/useAuth";
import { api } from "../lib/api";
import { formatCurrency, formatNumber, formatDate } from "../lib/format";
import { PERMISSIONS } from "../lib/permissions";
import {
  Coins,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
  Plus,
  Lock,
  Unlock,
  ShieldCheck,
  CreditCard,
  Building,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  X
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Input from "../components/ui/Input";

export default function FinancePage({ showToast = () => {} }) {
  const { organization, isAuthenticated, user, guestOrgType, can } = useAuth();
  const currentOrgType = isAuthenticated ? organization?.type || "ngo" : guestOrgType || "ngo";
  const currency = organization?.currency || "INR";

  const [activeTab, setActiveTab] = useState("donations"); // "donations" | "purchases" | "expenses"
  const [summary, setSummary] = useState(null);
  const [donations, setDonations] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Modal State
  const [modalType, setModalType] = useState(null); // "donation" | "expense" | null
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  // Donation Form
  const [donorName, setDonorName] = useState("");
  const [donationAmount, setDonationAmount] = useState("");
  const [donationType, setDonationType] = useState("cash");
  const [donorPan, setDonorPan] = useState("");

  // Expense Form
  const [expenseCategory, setExpenseCategory] = useState("Logistics");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDesc, setExpenseDesc] = useState("");

  const canManageFinance = can(PERMISSIONS.VIEW_FINANCE);

  const fetchFinanceRecords = useCallback(() => {
    return Promise.all([
      api.finance.getSummary(currentOrgType).catch(() => null),
      api.finance.listDonations({ org_type: currentOrgType, limit: 50 }).catch(() => []),
      api.finance.listPurchases({ org_type: currentOrgType, limit: 50 }).catch(() => []),
      api.finance.listExpenses({ org_type: currentOrgType, limit: 50 }).catch(() => []),
    ]);
  }, [currentOrgType]);

  useEffect(() => {
    let isMounted = true;

    fetchFinanceRecords()
      .then(([sumData, donData, purData, expData]) => {
        if (isMounted) {
          setSummary(sumData);
          setDonations(donData || []);
          setPurchases(purData || []);
          setExpenses(expData || []);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Finance loading error:", err);
          showToast("Unable to load complete financial ledger.", "error");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [fetchFinanceRecords, showToast]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sumData, donData, purData, expData] = await fetchFinanceRecords();
      setSummary(sumData);
      setDonations(donData || []);
      setPurchases(purData || []);
      setExpenses(expData || []);
    } catch (err) {
      console.error("Finance loading error:", err);
      showToast("Unable to load complete financial ledger.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      setDownloading(true);
      showToast("Exporting financial operations CSV...", "info");
      const filename = await api.reports.downloadFinanceCsv();
      showToast(`Downloaded: ${filename}`, "success");
    } catch (err) {
      showToast(err.message || "Failed to download financial audit sheet.", "error");
    } finally {
      setDownloading(false);
    }
  };

  const handleCreateDonation = async (e) => {
    e.preventDefault();
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      setModalError("Please enter a valid donation amount.");
      return;
    }

    try {
      setModalSubmitting(true);
      setModalError("");
      await api.finance.createDonation({
        donor_name: donorName.trim() || "Anonymous Contributor",
        donation_type: donationType,
        amount: parseFloat(donationAmount),
        donor_pan: donorPan.trim() || undefined,
        notes: `Recorded via Finance Console by ${user?.full_name || "Staff"}`,
      });
      showToast("Donation ledger entry created successfully!", "success");
      setModalType(null);
      setDonorName("");
      setDonationAmount("");
      setDonorPan("");
      await loadData();
    } catch (err) {
      setModalError(err.message || "Failed to create donation record.");
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    if (!expenseAmount || parseFloat(expenseAmount) <= 0) {
      setModalError("Please enter a valid expense amount.");
      return;
    }

    try {
      setModalSubmitting(true);
      setModalError("");
      await api.finance.createExpense({
        category: expenseCategory,
        amount: parseFloat(expenseAmount),
        description: expenseDesc.trim() || "Operational disbursement voucher",
        payment_method: "Bank Transfer",
      });
      showToast("Operating expense voucher posted to ledger!", "success");
      setModalType(null);
      setExpenseAmount("");
      setExpenseDesc("");
      await loadData();
    } catch (err) {
      setModalError(err.message || "Failed to record expense voucher.");
    } finally {
      setModalSubmitting(false);
    }
  };

  const isNGO = currentOrgType === "ngo";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
              <Coins className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <span>Financial Operations & Ledger</span>
            </h1>
            <Badge variant={isNGO ? "success" : "info"} size="sm">
              {isNGO ? "Charitable Grants" : "Commercial Accounting"}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Cash income, operating vouchers, donor tax compliance, and net reserve liquidity
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadData}
            disabled={loading}
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? "animate-spin text-[var(--accent)]" : ""}`} />
            <span>Sync</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownloadCSV}
            disabled={downloading}
            title="Download CSV Audit Sheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            <span>Export Finance CSV</span>
          </Button>

          {isAuthenticated && canManageFinance ? (
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => { setModalError(""); setModalType("donation"); }}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>Record Grant / Income</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { setModalError(""); setModalType("expense"); }}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>Log Expense Voucher</span>
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="primary" size="sm">
                <Lock className="w-3.5 h-3.5 mr-1" />
                <span>Sign in for Ledger Actions</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Guest Transparency Banner vs Authenticated Compliance Notice */}
      {!isAuthenticated ? (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 to-indigo-50/50 dark:from-[var(--bg-surface-elev)] dark:to-[var(--bg-surface-elev)]/60 border border-[var(--badge-border)]/80 border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-[var(--text-primary)]">
                Public Guest Transparency Mode Active
              </p>
              <p className="text-[var(--text-muted)] mt-0.5 leading-tight">
                All high-level financial flows are fully visible. Sign in as <strong>Accountant</strong> or <strong>Admin</strong> to reveal confidential Tax IDs (PAN/GSTIN), unmasked wire transaction hashes, and reconciliation controls.
              </p>
            </div>
          </div>
          <Link to="/login" className="shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-surface-elev)] border border-[var(--badge-border)] border-[var(--border-subtle)] text-[var(--accent)] font-bold hover:shadow-xs transition-all cursor-pointer">
              <Unlock className="w-3.5 h-3.5" />
              <span>Sign In as Accountant</span>
            </span>
          </Link>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>
              <strong>Authenticated Account:</strong> Unmasked Tax Records (PAN/GSTIN), donor reconciliation vouchers, and compliance ledgers unlocked for <strong>{user?.role}</strong>.
            </span>
          </div>
          <Badge variant="success" size="sm">Compliance Verified</Badge>
        </div>
      )}

      {/* KPI Cards Row (4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Cash Income / Donations */}
        <Card className="p-5 space-y-2 border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-bold uppercase tracking-wider">Cash Inflow & Grants</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[var(--text-primary)] tabular-nums">
            {loading ? "â€”" : formatCurrency(summary?.cash_income || 0, currency)}
          </div>
          <p className="text-[11px] text-[var(--text-dim)]">
            {donations.length} recorded donation grants
          </p>
        </Card>

        {/* KPI 2: Operating Expenses */}
        <Card className="p-5 space-y-2 border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-bold uppercase tracking-wider">Operating Expenses</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[var(--text-primary)] tabular-nums">
            {loading ? "â€”" : formatCurrency(summary?.expenses || 0, currency)}
          </div>
          <p className="text-[11px] text-[var(--text-dim)]">
            {expenses.length} disbursed vouchers
          </p>
        </Card>

        {/* KPI 3: Net Cash Position */}
        <Card className="p-5 space-y-2 border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-bold uppercase tracking-wider">Net Reserve Position</span>
            <div className="p-1.5 rounded-lg bg-[var(--badge-bg)] text-[var(--accent)] dark:bg-[var(--badge-bg)] dark:text-[var(--accent)]">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-extrabold tabular-nums ${
            (summary?.net_position || 0) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
          }`}>
            {loading ? "â€”" : formatCurrency(summary?.net_position || 0, currency)}
          </div>
          <p className="text-[11px] text-[var(--text-dim)]">
            Inflow minus operational disbursements
          </p>
        </Card>

        {/* KPI 4: Inventory Physical Value */}
        <Card className="p-5 space-y-2 border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-bold uppercase tracking-wider">Inventory Asset Valuation</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[var(--text-primary)] tabular-nums">
            {loading ? "â€”" : formatCurrency(summary?.inventory_value || 0, currency)}
          </div>
          <p className="text-[11px] text-[var(--text-dim)]">
            Physical stock capitalized on balance sheet
          </p>
        </Card>
      </div>

      {/* Tabs Selection Bar */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("donations")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "donations"
              ? "bg-[var(--bg-surface-elev)] text-white dark:bg-[var(--accent)] shadow-xs"
              : "text-[var(--text-secondary)] dark:text-[var(--text-dim)] hover:bg-[var(--row-hover)]"
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Donations & Grants ({donations.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("purchases")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "purchases"
              ? "bg-[var(--bg-surface-elev)] text-white dark:bg-[var(--accent)] shadow-xs"
              : "text-[var(--text-secondary)] dark:text-[var(--text-dim)] hover:bg-[var(--row-hover)]"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Procurement Purchases ({purchases.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("expenses")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "expenses"
              ? "bg-[var(--bg-surface-elev)] text-white dark:bg-[var(--accent)] shadow-xs"
              : "text-[var(--text-secondary)] dark:text-[var(--text-dim)] hover:bg-[var(--row-hover)]"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Operating Vouchers ({expenses.length})</span>
        </button>
      </div>

      {/* Active Tab Table Display */}
      <Card className="overflow-hidden border border-[var(--border-subtle)] shadow-sm">
        {activeTab === "donations" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/60 dark:bg-[var(--bg-surface-elev)]/40 text-[var(--text-dim)] font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Donor / Institution</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Contribution Value</th>
                  <th className="py-3 px-4">Tax Compliance ID</th>
                  <th className="py-3 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {donations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-[var(--text-dim)]">
                      No donation grants recorded in this ledger period.
                    </td>
                  </tr>
                ) : (
                  donations.map((d) => (
                    <tr key={d.id} className="hover:bg-[var(--row-hover)] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[var(--text-muted)]">
                        {d.receipt_number || `REC-${String(d.id).padStart(4, "0")}`}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-[var(--text-primary)]">
                          {d.donor_name}
                        </div>
                        {d.notes && <div className="text-[10px] text-[var(--text-dim)] truncate max-w-xs">{d.notes}</div>}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={d.donation_type === "cash" ? "success" : "info"} size="sm">
                          {d.donation_type === "cash" ? "Cash Transfer" : "In-Kind Goods"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        +{formatCurrency(d.amount || d.estimated_value || 0, currency)}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {/* FEATURE: Auth reveals unmasked Tax ID; Guest sees masked */}
                        {isAuthenticated && canManageFinance ? (
                          <span className="text-[var(--text-primary)] font-semibold">
                            {d.donor_pan || "EXEMPT-RELIEF-80G"}
                          </span>
                        ) : (
                          <span className="text-[var(--text-dim)] flex items-center gap-1" title="Log in as Accountant to unmask compliance PAN">
                            <Lock className="w-3 h-3 text-[var(--text-dim)]" />
                            <span>{d.donor_pan ? `*****${d.donor_pan.slice(-4)}` : "80G-****-REQ"}</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-[var(--text-dim)] whitespace-nowrap">
                        {formatDate(d.donation_date)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "purchases" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/60 dark:bg-[var(--bg-surface-elev)]/40 text-[var(--text-dim)] font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">PO / Voucher</th>
                  <th className="py-3 px-4">Item & SKU</th>
                  <th className="py-3 px-4">Supplier / Vendor</th>
                  <th className="py-3 px-4 text-right">Quantity</th>
                  <th className="py-3 px-4 text-right">Total Outlay</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-[var(--text-dim)]">
                      No procurement purchases recorded for this cycle.
                    </td>
                  </tr>
                ) : (
                  purchases.map((p) => (
                    <tr key={p.id} className="hover:bg-[var(--row-hover)] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[var(--text-muted)]">
                        {p.invoice_number || `PO-${String(p.id).padStart(4, "0")}`}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-[var(--text-primary)]">
                          {p.item_name || `Item #${p.item_id}`}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)] font-medium">
                        {p.vendor_name || "Direct Supplier"}
                      </td>
                      <td className="py-3 px-4 text-right font-bold tabular-nums">
                        {formatNumber(p.quantity)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[var(--text-primary)] tabular-nums">
                        {formatCurrency(p.total_amount, currency)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="neutral" size="sm">
                          {p.payment_status || "Paid"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right text-[var(--text-dim)] whitespace-nowrap">
                        {formatDate(p.purchase_date)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "expenses" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/60 dark:bg-[var(--bg-surface-elev)]/40 text-[var(--text-dim)] font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Voucher ID</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4">Bank Reference</th>
                  <th className="py-3 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-[var(--text-dim)]">
                      Zero operational expense vouchers posted.
                    </td>
                  </tr>
                ) : (
                  expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-[var(--row-hover)] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[var(--text-muted)]">
                        {`EXP-${String(e.id).padStart(4, "0")}`}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="neutral" size="sm">
                          {e.category}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-medium text-[var(--text-primary)]">
                        {e.description}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                        -{formatCurrency(e.amount, currency)}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {/* FEATURE: Auth reveals settlement keys; Guest sees masked */}
                        {isAuthenticated && canManageFinance ? (
                          <span className="text-[var(--text-primary)] font-semibold">
                            {e.reference_number || `NEFT-${100000 + e.id}`}
                          </span>
                        ) : (
                          <span className="text-[var(--text-dim)] flex items-center gap-1" title="Log in as Accountant to view settlement wires">
                            <Lock className="w-3 h-3 text-[var(--text-dim)]" />
                            <span>WIRE-****-SETTLE</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-[var(--text-dim)] whitespace-nowrap">
                        {formatDate(e.expense_date)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Record Donation Modal */}
      <AnimatePresence>
        {modalType === "donation" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalType(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative w-full max-w-md bg-[var(--bg-surface-elev)] rounded-3xl p-6 shadow-2xl border border-[var(--border-subtle)] z-10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                <h3 className="font-extrabold text-base text-[var(--text-primary)] flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  <span>Record Grant / Community Donation</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="p-1 rounded-lg text-[var(--text-dim)] hover:text-[var(--text-secondary)] dark:hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalError && (
                <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {modalError}
                </div>
              )}

              <form onSubmit={handleCreateDonation} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                    Donor / Philanthropic Partner
                  </label>
                  <Input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="e.g. Rotary Global Aid or Dr. M. Sen"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                      Amount ({currency})
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="1"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      placeholder="e.g. 50000"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                      Type
                    </label>
                    <select
                      value={donationType}
                      onChange={(e) => setDonationType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)]"
                    >
                      <option value="cash">Direct Cash Wire</option>
                      <option value="goods">In-Kind Relief Goods</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                    Tax Exemption PAN / GSTIN (80G)
                  </label>
                  <Input
                    type="text"
                    value={donorPan}
                    onChange={(e) => setDonorPan(e.target.value.toUpperCase())}
                    placeholder="e.g. ABCDE1234F"
                    className="font-mono uppercase text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setModalType(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={modalSubmitting}
                  >
                    {modalSubmitting ? "Recording..." : "Post to Ledger"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Record Expense Modal */}
      <AnimatePresence>
        {modalType === "expense" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalType(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative w-full max-w-md bg-[var(--bg-surface-elev)] rounded-3xl p-6 shadow-2xl border border-[var(--border-subtle)] z-10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                <h3 className="font-extrabold text-base text-[var(--text-primary)] flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-rose-600" />
                  <span>Log Operating Expense Voucher</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="p-1 rounded-lg text-[var(--text-dim)] hover:text-[var(--text-secondary)] dark:hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalError && (
                <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {modalError}
                </div>
              )}

              <form onSubmit={handleCreateExpense} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                    Expense Category
                  </label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)]"
                  >
                    <option value="Logistics">Relief Fleet & Logistics Dispatch</option>
                    <option value="Medical Cold-Chain">Medical Cold-Chain & Storage</option>
                    <option value="Warehouse Rent">Warehouse & Shelter Rent</option>
                    <option value="Utilities">Utilities & Telecom Hub</option>
                    <option value="Staffing">Field Volunteer Stipends</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                    Disbursement Amount ({currency})
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="1"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="e.g. 14500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                    Description & Vouching Purpose
                  </label>
                  <Input
                    type="text"
                    value={expenseDesc}
                    onChange={(e) => setExpenseDesc(e.target.value)}
                    placeholder="e.g. Emergency diesel fuel for cold storage generator"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setModalType(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="danger"
                    size="sm"
                    disabled={modalSubmitting}
                  >
                    {modalSubmitting ? "Posting..." : "Confirm Voucher"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}



