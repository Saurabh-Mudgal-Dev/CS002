import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../features/auth/useAuth";
import {
  Search,
  Plus,
  Filter,
  Download,
  Package,
  Edit2,
  Trash2,
  RefreshCw,
  Lock,
  Unlock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  X
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { formatCurrency, formatNumber } from "../lib/format";
import { PERMISSIONS } from "../lib/permissions";

export default function InventoryPage({
  inventory = [],
  contextMode = "ngo",
  userRole = "Guest",
  onOpenAddModal,
  onOpenAdjustModal,
  onOpenEditModal,
  onOpenDeleteModal,
  onExportCSV
}) {
  const { isAuthenticated, organization, login, can } = useAuth();
  const isNGO = contextMode === "ngo";
  const currency = organization?.currency || "INR";

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [personaModalOpen, setPersonaModalOpen] = useState(false);
  const [personaModalAction, setPersonaModalAction] = useState("");

  const canManageStock = can(PERMISSIONS.RESTOCK_INVENTORY);
  const canEditItem = can(PERMISSIONS.CREATE_INVENTORY);
  const canDeleteItem = can(PERMISSIONS.MANAGE_TEAM);

  const categories = useMemo(() => {
    const cats = new Set(inventory.map((i) => i.category));
    return ["All", ...Array.from(cats)];
  }, [inventory]);

  const filteredItems = useMemo(() => {
    return inventory.filter((item) => {
      if (contextMode !== "all" && item.context_tag !== "general" && item.context_tag !== contextMode) {
        return false;
      }
      if (selectedCategory !== "All" && item.category !== selectedCategory) return false;
      if (selectedStatus !== "All" && item.status !== selectedStatus) return false;
      if (search.trim()) {
        const s = search.toLowerCase();
        return item.name.toLowerCase().includes(s) || item.sku.toLowerCase().includes(s);
      }
      return true;
    });
  }, [inventory, contextMode, selectedCategory, selectedStatus, search]);

  const handleGuestAction = (actionName) => {
    setPersonaModalAction(actionName);
    setPersonaModalOpen(true);
  };

  const handleQuickPersonaLogin = async (email) => {
    try {
      await login(email, "Demo@12345");
      setPersonaModalOpen(false);
    } catch (err) {
      console.error("Quick login error:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
              <Package className="w-6 h-6 text-[var(--accent)]" />
              <span>{isNGO ? "Relief Supplies & Catalog" : "Retail Inventory & SKU Catalog"}</span>
            </h1>
            <Badge variant={isNGO ? "success" : "info"} size="sm">
              {isNGO ? "Emergency Aid" : "Store Counter"}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Showing <strong className="text-[var(--text-primary)]">{filteredItems.length}</strong> of {inventory.length} active catalog items
          </p>
        </div>

        {/* Header Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={onExportCSV}
            title="Download CSV Audit Sheet"
          >
            <Download className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            <span>Export CSV</span>
          </Button>

          {canManageStock ? (
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenAddModal}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add Item</span>
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleGuestAction("Register New SKU Item")}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add Item</span>
            </Button>
          )}
        </div>
      </div>

      {/* Guest Transparency Banner vs Staff Notice */}
      {!isAuthenticated ? (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 to-indigo-50/50 dark:from-[var(--bg-surface-elev)] dark:to-[var(--bg-surface-elev)]/60 border border-[var(--badge-border)]/80 border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-[var(--text-primary)]">
                Public Catalog Transparency Mode
              </p>
              <p className="text-[var(--text-muted)] mt-0.5 leading-tight">
                All physical stock balances, categories, and unit valuations are fully visible to public guests. Sign in as <strong>Inventory Manager</strong> or <strong>Admin</strong> to unlock live stock adjustments, procurement wholesale margins, and catalog updates.
              </p>
            </div>
          </div>
          <Link to="/login" className="shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-surface-elev)] border border-[var(--badge-border)] border-[var(--border-subtle)] text-[var(--accent)] font-bold hover:shadow-xs transition-all cursor-pointer">
              <Unlock className="w-3.5 h-3.5" />
              <span>Sign In as Manager</span>
            </span>
          </Link>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>
              <strong>Authenticated Staff Console:</strong> Operational restocks, aid dispatches, and procurement cost margins unlocked for <strong>{userRole}</strong>.
            </span>
          </div>
          <Badge variant="success" size="sm">Staff Access</Badge>
        </div>
      )}

      {/* Search & Status Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SKU identifier..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-surface-elev)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder-[var(--text-dim)] focus:outline-none focus:ring-2 focus:ring-[var(--border-hot)]/20 focus:border-[var(--border-hot)] transition-all shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {["All", "In Stock", "Low Stock", "Critical"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border ${
                selectedStatus === st
                  ? "bg-[var(--bg-surface-elev)] text-white dark:bg-[var(--accent)] border-[var(--border-subtle)] dark:border-[var(--border-hot)] shadow-xs"
                  : "bg-[var(--bg-surface-elev)] border-[var(--border-subtle)] text-[var(--text-secondary)] dark:text-[var(--text-dim)] hover:bg-[var(--row-hover)]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[11px] font-bold text-[var(--text-dim)] flex items-center gap-1 shrink-0">
          <Filter className="w-3 h-3 text-[var(--accent)]" />
          Category:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border ${
              selectedCategory === cat
                ? "bg-[var(--badge-bg)] text-[var(--accent)] dark:bg-[var(--badge-bg)] dark:text-[var(--badge-text)] border-[var(--badge-border)] dark:border-[var(--badge-border)]"
                : "bg-[var(--bg-surface-elev)] border-[var(--border-subtle)] text-[var(--text-secondary)] dark:text-[var(--text-dim)] hover:bg-[var(--bg-surface)]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Inventory Catalog Table */}
      <Card className="overflow-hidden border border-[var(--border-subtle)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/60 dark:bg-[var(--bg-surface-elev)]/40 uppercase font-semibold tracking-wider text-[10px] text-[var(--text-dim)]">
                <th className="py-3 px-4">Item & Category</th>
                <th className="py-3 px-3">SKU</th>
                <th className="py-3 px-4 min-w-[160px]">Stock Runway (Units / Limit)</th>
                <th className="py-3 px-3 text-right">Unit Price</th>
                <th className="py-3 px-3 text-right">Total Valuation</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-sm text-[var(--text-dim)] font-medium">
                    No matching inventory items found for this filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const pct = Math.min(Math.round((item.quantity / Math.max(item.reorder_level * 2, 1)) * 100), 100);
                  const isLow = item.quantity <= item.reorder_level;
                  const isCritical = item.quantity <= 0;

                  return (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-[var(--row-hover)]"
                    >
                      {/* Name & Category */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[var(--text-primary)]">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-[var(--text-dim)] mt-0.5">
                          {item.category}
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] font-mono text-[11px] text-[var(--text-secondary)]">
                          {item.sku}
                        </span>
                      </td>

                      {/* Stock Runway Progress */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-bold text-[var(--text-primary)] tabular-nums">
                            {formatNumber(item.quantity)} units
                          </span>
                          <span className="text-[var(--text-dim)] tabular-nums">
                            Safety: {formatNumber(item.reorder_level)}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full overflow-hidden bg-[var(--bg-surface)] dark:bg-[var(--bg-surface-elev)]">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isCritical ? "bg-rose-500" : isLow ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            style={{ width: isCritical ? "100%" : `${Math.max(pct, 6)}%` }}
                          />
                        </div>
                      </td>

                      {/* Unit Price & Margin (FEATURE: Auth unlocks wholesale margin) */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="font-bold text-[var(--text-primary)] tabular-nums">
                          {formatCurrency(item.unit_price, currency)}
                        </div>
                        {isAuthenticated && canManageStock ? (
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                            Cost: {formatCurrency(item.unit_price * 0.72, currency)}
                          </div>
                        ) : (
                          <div className="text-[10px] text-[var(--text-dim)] flex items-center justify-end gap-0.5" title="Sign in as Manager to view wholesale procurement cost">
                            <Lock className="w-2.5 h-2.5" />
                            <span>Margin</span>
                          </div>
                        )}
                      </td>

                      {/* Total Valuation */}
                      <td className="py-3.5 px-3 text-right font-bold text-[var(--text-primary)] tabular-nums">
                        {formatCurrency(item.quantity * item.unit_price, currency)}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-3 text-center">
                        <Badge
                          variant={isCritical ? "danger" : isLow ? "warning" : "success"}
                          size="sm"
                        >
                          {item.status}
                        </Badge>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Restock / Issue */}
                          {canManageStock ? (
                            <button
                              type="button"
                              onClick={() => onOpenAdjustModal(item)}
                              className="px-2.5 py-1 rounded-xl border border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-surface-elev)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] dark:hover:bg-[var(--row-hover)] transition-colors cursor-pointer"
                              title={isNGO ? "Issue Relief Aid or Restock" : "Record Sale or Restock"}
                            >
                              <span className="hidden sm:inline">{isNGO ? "Issue / Restock" : "Sell / Restock"}</span>
                              <RefreshCw className="w-3.5 h-3.5 sm:hidden" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleGuestAction(`Stock Adjustment for ${item.name}`)}
                              className="px-2.5 py-1 rounded-xl border border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-surface-elev)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] dark:hover:bg-[var(--row-hover)] transition-colors cursor-pointer"
                            >
                              <span className="hidden sm:inline">{isNGO ? "Issue / Restock" : "Sell / Restock"}</span>
                              <RefreshCw className="w-3.5 h-3.5 sm:hidden" />
                            </button>
                          )}

                          {/* Edit SKU */}
                          {canEditItem ? (
                            <button
                              type="button"
                              onClick={() => onOpenEditModal(item)}
                              className="p-1 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] dark:hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                              title="Edit Item Details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleGuestAction(`Edit SKU: ${item.name}`)}
                              className="p-1 rounded-lg border border-[var(--border-subtle)] text-[var(--text-dim)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
                              title="Sign in as Manager to edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete SKU */}
                          {canDeleteItem && (
                            <button
                              type="button"
                              onClick={() => onOpenDeleteModal(item)}
                              className="p-1 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Delete Item SKU"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
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

      {/* Guest Action Persona Login Helper Dialog */}
      <AnimatePresence>
        {personaModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPersonaModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative w-full max-w-md bg-[var(--bg-surface-elev)] rounded-3xl p-6 shadow-2xl border border-[var(--border-subtle)] z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                  <h3 className="font-extrabold text-sm text-[var(--text-primary)]">
                    Manager Authorization Required
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPersonaModalOpen(false)}
                  className="p-1 rounded-lg text-[var(--text-dim)] hover:text-[var(--text-secondary)] dark:hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1 text-xs">
                <p className="font-bold text-[var(--text-primary)]">
                  Action: {personaModalAction}
                </p>
                <p className="text-[var(--text-muted)] leading-relaxed">
                  Modifying stock allocations, posting disbursements, and registering new SKUs require verified staff credentials. Select a demo persona below to unlock this operation in 1-click:
                </p>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleQuickPersonaLogin("manager@resourceone.org")}
                  className="w-full text-left p-3 rounded-2xl border border-[var(--badge-border)] dark:border-[var(--badge-border)] bg-[var(--badge-bg)]/50 dark:bg-[var(--badge-bg)]/30 hover:border-[var(--border-hot)] transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div>
                    <div className="font-bold text-xs text-[var(--text-primary)] group-hover:text-[var(--accent)]">
                      Sign in as Relief Inventory Manager
                    </div>
                    <div className="text-[11px] text-[var(--text-dim)] font-mono">manager@resourceone.org</div>
                  </div>
                  <Badge variant="info" size="sm">NGO Relief</Badge>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickPersonaLogin("admin@resourceone.org")}
                  className="w-full text-left p-3 rounded-2xl border border-[var(--border-subtle)] hover:border-[var(--border-subtle)] transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div>
                    <div className="font-bold text-xs text-[var(--text-primary)] group-hover:text-[var(--accent)]">
                      Sign in as Relief Administrator
                    </div>
                    <div className="text-[11px] text-[var(--text-dim)] font-mono">admin@resourceone.org</div>
                  </div>
                  <Badge variant="primary" size="sm">Admin</Badge>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickPersonaLogin("owner@sunrise.store")}
                  className="w-full text-left p-3 rounded-2xl border border-[var(--border-subtle)] hover:border-[var(--border-subtle)] transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div>
                    <div className="font-bold text-xs text-[var(--text-primary)] group-hover:text-[var(--accent)]">
                      Sign in as Retail Store Owner
                    </div>
                    <div className="text-[11px] text-[var(--text-dim)] font-mono">owner@sunrise.store</div>
                  </div>
                  <Badge variant="neutral" size="sm">Retail Store</Badge>
                </button>
              </div>

              <div className="pt-2 border-t border-[var(--border-subtle)] text-center">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
                >
                  <span>Go to Standard Login Page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}



