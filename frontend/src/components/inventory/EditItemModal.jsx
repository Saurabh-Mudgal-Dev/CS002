import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Edit3 } from "lucide-react";
import Button from "../ui/Button";

export default function EditItemModal({ isOpen, item, onClose, onSave, contextMode }) {
  const [prevItemId, setPrevItemId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    context_tag: "general",
    quantity: 0,
    reorder_level: 10,
    unit_price: 0
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (item && item.id !== prevItemId) {
    setPrevItemId(item.id);
    setFormData({
      name: item.name || "",
      sku: item.sku || "",
      category: item.category || (contextMode === "ngo" ? "Medical Relief" : "Grocery & Staples"),
      context_tag: item.context_tag || contextMode,
      quantity: item.quantity ?? 0,
      reorder_level: item.reorder_level ?? 10,
      unit_price: item.unit_price ?? 0
    });
    setError("");
  }

  const categories = contextMode === "ngo"
    ? ["Medical Relief", "Emergency Rations", "Sanitation & Water", "Disaster Logistics", "General Supplies"]
    : ["Grocery & Staples", "Daily Essentials", "Hardware & Electric", "Stationery", "General Goods"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Item name is required.");
      return;
    }
    if (!formData.sku.trim()) {
      setError("SKU code is required.");
      return;
    }

    try {
      setLoading(true);
      await onSave({
        name: formData.name.trim(),
        sku: formData.sku.trim().toUpperCase(),
        category: formData.category,
        context_tag: formData.context_tag,
        quantity: parseInt(formData.quantity, 10),
        reorder_level: parseInt(formData.reorder_level, 10),
        unit_price: parseFloat(formData.unit_price)
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-lg bg-[var(--bg-surface-elev)] rounded-3xl p-6 sm:p-7 shadow-2xl border border-[var(--border-subtle)] overflow-hidden z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[var(--badge-bg)] text-[var(--accent)] dark:bg-[var(--badge-bg)] dark:text-[var(--accent)] border border-[var(--badge-border)]/60 dark:border-blue-900/50">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[var(--text-primary)]">Edit Inventory Item</h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Update properties for SKU: <span className="font-mono font-bold text-[var(--accent)]">{item.sku}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-[var(--text-dim)] hover:text-[var(--text-secondary)] dark:hover:text-[var(--text-primary)] hover:bg-[var(--row-hover)] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-300 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                  Item Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--border-hot)]/20 focus:border-[var(--border-hot)] transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                    SKU Identifier <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-sm font-mono uppercase text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--border-hot)]/20 focus:border-[var(--border-hot)] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--border-hot)]/20 focus:border-[var(--border-hot)] transition-all cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] tabular-nums font-mono focus:outline-none focus:ring-2 focus:ring-[var(--border-hot)]/20 focus:border-[var(--border-hot)] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                    Safety Threshold
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.reorder_level}
                    onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] tabular-nums font-mono focus:outline-none focus:ring-2 focus:ring-[var(--border-hot)]/20 focus:border-[var(--border-hot)] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                    Unit Cost (â‚¹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] tabular-nums font-mono focus:outline-none focus:ring-2 focus:ring-[var(--border-hot)]/20 focus:border-[var(--border-hot)] transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--border-subtle)]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={loading}
                >
                  <Save className="w-4 h-4 mr-1" />
                  <span>{loading ? "Saving Changes..." : "Save Changes"}</span>
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}



