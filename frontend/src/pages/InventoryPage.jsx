import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  Search,
  Plus,
  Filter,
  Download,
  Package,
  Edit2,
  Trash2,
  RefreshCw
} from "lucide-react";

export default function InventoryPage({
  inventory,
  contextMode,
  userRole,
  onOpenAddModal,
  onOpenAdjustModal,
  onOpenEditModal,
  onOpenDeleteModal,
  onExportCSV
}) {
  const isNGO = contextMode === "ngo";
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-4"
    >
      {/* Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl coffee-glass border shadow-2xl"
        style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)" }}
      >
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2.5" style={{ color: "var(--text-primary)" }}>
            <Package className="w-5 h-5 shrink-0" style={{ color: "var(--gold-vivid)" }} />
            <span>{isNGO ? "Relief Supplies & Resource Catalog" : "Store Inventory & SKU Catalog"}</span>
          </h2>
          <p className="text-xs mt-1 font-medium" style={{ color: "var(--text-muted)" }}>
            Showing <span className="font-bold" style={{ color: "var(--text-primary)" }}>{filteredItems.length}</span> of{" "}
            <span className="font-bold" style={{ color: "var(--text-primary)" }}>{inventory.length}</span> tracked items
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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

      {/* Search + Status Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-dim)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search by name or SKU…`}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border text-xs transition-colors focus:outline-none focus:border-[#f5c842]/40"
            style={{
              background: "var(--bg-input)",
              borderColor: "var(--border-subtle)",
              color: "var(--text-primary)"
            }}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {["All", "In Stock", "Low Stock", "Critical"].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                selectedStatus === st
                  ? "bg-gradient-to-r from-[#f5c842] to-[#e8a722] text-[#0d0900] border-transparent shadow-md shadow-[#f5c842]/20 font-black"
                  : "border text-xs"
              }`}
              style={
                selectedStatus !== st
                  ? {
                      background: "var(--bg-input)",
                      borderColor: "var(--border-subtle)",
                      color: "var(--text-muted)"
                    }
                  : {}
              }
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[11px] font-bold flex items-center gap-1 shrink-0" style={{ color: "var(--text-muted)" }}>
          <Filter className="w-3 h-3" style={{ color: "var(--gold-vivid)" }} />
          Category:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
              selectedCategory === cat
                ? "bg-[#f5c842]/15 text-[#f5c842] border-[#f5c842]/30"
                : "border"
            }`}
            style={
              selectedCategory !== cat
                ? {
                    background: "var(--bg-input)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--text-muted)"
                  }
                : {}
            }
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Inventory Table */}
      <div
        className="rounded-3xl coffee-glass overflow-hidden border shadow-2xl"
        style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)" }}
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
                <th className="py-4 px-5">Item & Category</th>
                <th className="py-4 px-3">SKU</th>
                <th className="py-4 px-4 min-w-[160px]">Stock (Qty / Threshold)</th>
                <th className="py-4 px-3 text-right">Unit Price</th>
                <th className="py-4 px-3 text-right">Total Value</th>
                <th className="py-4 px-3 text-center">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-14 text-sm font-semibold" style={{ color: "var(--text-dim)" }}>
                    No matching inventory items found.
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
                      className="transition-colors hover:bg-black/5 group"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {/* Name & Category */}
                      <td className="py-4 px-5">
                        <div className="font-extrabold transition-colors" style={{ color: "var(--text-primary)" }}>
                          {item.name}
                        </div>
                        <div className="text-[11px] font-medium mt-0.5" style={{ color: "var(--text-muted)" }}>
                          {item.category}
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-4 px-3">
                        <span
                          className="px-2 py-0.5 rounded-lg border font-mono text-[11px]"
                          style={{
                            background: "var(--bg-input)",
                            borderColor: "var(--border-subtle)",
                            color: "var(--text-muted)"
                          }}
                        >
                          {item.sku}
                        </span>
                      </td>

                      {/* Stock Progress Bar */}
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-between text-[11px] mb-1.5">
                          <span className="font-extrabold tabular-nums" style={{ color: "var(--text-primary)" }}>
                            {item.quantity} units
                          </span>
                          <span className="tabular-nums" style={{ color: "var(--text-muted)" }}>
                            /{item.reorder_level}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border-subtle)" }}>
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isCritical ? "bg-rose-500" : isLow ? "bg-amber-400" : "bg-emerald-400"
                            }`}
                            style={{ width: isCritical ? "100%" : `${Math.max(pct, 8)}%` }}
                          />
                        </div>
                      </td>

                      {/* Unit Price */}
                      <td className="py-4 px-3 text-right font-mono tabular-nums" style={{ color: "var(--text-muted)" }}>
                        ${item.unit_price.toFixed(2)}
                      </td>

                      {/* Total Value */}
                      <td className="py-4 px-3 text-right font-mono font-extrabold tabular-nums" style={{ color: "var(--text-primary)" }}>
                        ${(item.quantity * item.unit_price).toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-3 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            isCritical
                              ? "bg-rose-500/15 text-rose-400 border border-rose-500/25"
                              : isLow
                              ? "bg-amber-500/15 text-amber-400 border border-amber-500/25 animate-pulse"
                              : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Actions: Adjust, Edit, Delete */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Stock Adjustment */}
                          {onOpenAdjustModal && (
                            <motion.button
                              whileTap={{ scale: 0.94 }}
                              onClick={() => onOpenAdjustModal(item)}
                              className="px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer"
                              style={{
                                background: "var(--bg-input)",
                                borderColor: "var(--border-subtle)",
                                color: "var(--text-primary)"
                              }}
                              title={isNGO ? "Issue Relief Aid or Restock" : "Record Sale or Restock"}
                            >
                              <span className="hidden sm:inline">{isNGO ? "Issue / Restock" : "Sell / Restock"}</span>
                              <RefreshCw className="w-3.5 h-3.5 sm:hidden" />
                            </motion.button>
                          )}

                          {/* Edit Item (Admin & Manager) */}
                          {userRole !== "Volunteer" && onOpenEditModal && (
                            <motion.button
                              whileTap={{ scale: 0.92 }}
                              onClick={() => onOpenEditModal(item)}
                              className="p-1.5 rounded-xl border transition-colors cursor-pointer"
                              style={{
                                background: "var(--bg-input)",
                                borderColor: "var(--border-subtle)",
                                color: "var(--text-muted)"
                              }}
                              title="Edit Item Details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </motion.button>
                          )}

                          {/* Delete Item (Admin only) */}
                          {userRole === "Admin" && onOpenDeleteModal && (
                            <motion.button
                              whileTap={{ scale: 0.92 }}
                              onClick={() => onOpenDeleteModal(item)}
                              className="p-1.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              style={{ background: "var(--bg-input)" }}
                              title="Delete Item SKU"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </motion.button>
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
      </div>
    </motion.div>
  );
}
