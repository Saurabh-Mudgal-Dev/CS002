import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Package } from "lucide-react";

export default function AddItemModal({ isOpen, onClose, onSave, contextMode }) {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: contextMode === "ngo" ? "Medical Relief" : "Grocery & Staples",
    context_tag: contextMode,
    quantity: 10,
    reorder_level: 15,
    unit_price: 5.00
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const categories = contextMode === "ngo" 
    ? ["Medical Relief", "Emergency Rations", "Sanitation & Water", "Disaster Logistics"]
    : ["Grocery & Staples", "Daily Essentials", "Hardware & Electric", "Stationery"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Item name is required.");
      return;
    }
    if (!formData.sku.trim()) {
      setError("SKU is required.");
      return;
    }

    try {
      setLoading(true);
      await onSave({
        ...formData,
        name: formData.name.trim(),
        sku: formData.sku.trim().toUpperCase(),
        quantity: parseInt(formData.quantity, 10),
        reorder_level: parseInt(formData.reorder_level, 10),
        unit_price: parseFloat(formData.unit_price)
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-lg rounded-3xl coffee-glass p-6 sm:p-7 shadow-2xl border border-[#3c2a1e]/80 shadow-black/60 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#2a1e16]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[#f5c842]/10 text-[#f5c842] border border-[#f5c842]/20">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-[#fdf6e9]">Add Inventory Item</h3>
                <p className="text-xs text-[#7a6352]">
                  Register new SKU in {contextMode === "ngo" ? "NGO Relief" : "Store Catalog"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-[#5a4030] hover:text-[#fdf6e9] p-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#b5997e] mb-1.5">
                Item Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={contextMode === "ngo" ? "e.g., Amoxicillin 250mg Capsules" : "e.g., Premium Cooking Oil 1L"}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0d0a08] border border-[#3c2a1e] text-sm text-[#fdf6e9] placeholder-[#3c2a1e] focus:outline-none focus:border-[#f5c842]/40 transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#bdaaa0] mb-1.5">
                  SKU Code <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="e.g., MED-AMOX-250"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0d0a08] border border-[#3c2a1e] text-sm text-[#fdf6e9] placeholder-[#3c2a1e] focus:outline-none focus:border-[#f5c842]/40 transition-all uppercase font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#bdaaa0] mb-1.5">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0d0a08] border border-[#3c2a1e] text-sm text-[#fdf6e9] focus:outline-none focus:border-[#f5c842]/40 transition-all cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c} value={c} className="bg-[#0d0a08] text-[#fdf6e9]">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#bdaaa0] mb-1.5">
                  Initial Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d0a08] border border-[#3c2a1e] text-sm text-[#fdf6e9] focus:outline-none focus:border-[#f5c842]/40 transition-all tabular-nums font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#bdaaa0] mb-1.5">
                  Safety Threshold
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.reorder_level}
                  onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d0a08] border border-[#3c2a1e] text-sm text-[#fdf6e9] focus:outline-none focus:border-[#f5c842]/40 transition-all tabular-nums font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#bdaaa0] mb-1.5">
                  Unit Cost ($/₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unit_price}
                  onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d0a08] border border-[#3c2a1e] text-sm text-[#fdf6e9] focus:outline-none focus:border-[#f5c842]/40 transition-all tabular-nums font-bold"
                  required
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2a1e16]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-[#5a4030] hover:text-[#fdf6e9] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#f5c842] to-[#e8a722] hover:from-[#fdd96b] hover:to-[#f5c842] text-[#0d0900] text-xs font-black shadow-lg shadow-[#f5c842]/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{loading ? "Registering..." : "Create Item"}</span>
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
