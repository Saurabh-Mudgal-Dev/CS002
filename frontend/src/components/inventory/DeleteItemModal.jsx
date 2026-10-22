import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trash2, AlertTriangle, X } from "lucide-react";

export default function DeleteItemModal({ isOpen, item, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !item) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm(item.id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-md rounded-3xl coffee-glass p-6 sm:p-7 shadow-2xl border border-rose-500/30 overflow-hidden"
          style={{ background: "var(--bg-card)" }}
        >
          <div className="flex items-start justify-between pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/25">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-rose-400">Delete Inventory Item</h3>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Permanent Catalog Action</p>
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

          <div className="my-4 space-y-3">
            <p className="text-xs font-medium leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Are you sure you want to delete <strong style={{ color: "var(--text-primary)" }}>{item.name}</strong> from the active catalog? This action will remove the SKU and log the deletion in the audit trail.
            </p>

            <div className="p-3.5 rounded-2xl border text-xs space-y-1.5" style={{ background: "var(--bg-input)", borderColor: "var(--border-subtle)" }}>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>SKU Code:</span>
                <span className="font-mono font-bold" style={{ color: "var(--text-primary)" }}>{item.sku}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Category:</span>
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{item.category}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Remaining Stock:</span>
                <span className="font-mono font-bold text-amber-400">{item.quantity} units</span>
              </div>
            </div>

            {item.quantity > 0 && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-2.5 text-xs text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Notice: Active stock ({item.quantity} units) will be decommissioned.</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: "var(--border-subtle)" }}>
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
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleConfirm}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-lg shadow-rose-600/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{loading ? "Deleting..." : "Confirm Delete"}</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
