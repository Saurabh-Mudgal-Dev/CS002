import React, { useState, useEffect } from "react";
import { X, Save, Edit3 } from "lucide-react";

export default function EditItemModal({ isOpen, item, onClose, onSave, contextMode }) {
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

  useEffect(() => {
    if (item) {
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
  }, [item, contextMode]);

  if (!isOpen || !item) return null;

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
      await onSave(item.id, {
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
    
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
        <div
          
          
          
          
          className="relative w-full max-w-lg   p-6 sm:p-7 shadow-2xl border border-[#3c2a1e]/80 shadow-black/60 overflow-hidden"
          style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: "var(--border-subtle)" }}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[#f5c842]/10 text-[#f5c842] border border-[#f5c842]/20">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg" style={{ color: "var(--text-primary)" }}>Edit Inventory Item</h3>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Update properties for SKU: <span className="font-mono font-bold" style={{ color: "var(--accent)" }}>{item.sku}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-black/10 transition-colors cursor-pointer"
              style={{ color: "var(--text-muted)" }}
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
              <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--text-muted)" }}>
                Item Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#f5c842]/40 transition-colors"
                style={{
                  background: "var(--bg-input)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-primary)"
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--text-muted)" }}>
                  SKU Identifier <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono uppercase focus:outline-none focus:border-[#f5c842]/40 transition-colors"
                  style={{
                    background: "var(--bg-input)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--text-primary)"
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--text-muted)" }}>
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#f5c842]/40 transition-colors cursor-pointer"
                  style={{
                    background: "var(--bg-input)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--text-primary)"
                  }}
                >
                  {categories.map((c) => (
                    <option key={c} value={c} className="bg-[#141009] text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--text-muted)" }}>
                  Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono focus:outline-none focus:border-[#f5c842]/40 transition-colors"
                  style={{
                    background: "var(--bg-input)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--text-primary)"
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--text-muted)" }}>
                  Safety Threshold
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.reorder_level}
                  onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono focus:outline-none focus:border-[#f5c842]/40 transition-colors"
                  style={{
                    background: "var(--bg-input)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--text-primary)"
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--text-muted)" }}>
                  Unit Cost ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unit_price}
                  onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono focus:outline-none focus:border-[#f5c842]/40 transition-colors"
                  style={{
                    background: "var(--bg-input)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--text-primary)"
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer"
                style={{
                  background: "var(--bg-input)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-muted)"
                }}
              >
                Cancel
              </button>
              <button
                
                type="submit"
                disabled={loading}
                className="btn-gold flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? "Saving Changes..." : "Save Changes"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    
  );
}

