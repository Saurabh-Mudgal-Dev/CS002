import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, AlertTriangle, X } from "lucide-react";
import Button from "../ui/Button";

export default function DeleteItemModal({ isOpen, item, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);

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
            className="relative w-full max-w-md bg-[var(--bg-surface-elev)] rounded-3xl p-6 sm:p-7 shadow-2xl border border-[var(--border-subtle)] overflow-hidden z-10"
          >
            <div className="flex items-start justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/50">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-rose-600 dark:text-rose-400">Delete Inventory Item</h3>
                  <p className="text-xs text-[var(--text-muted)]">Permanent Catalog Action</p>
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

            <div className="my-4 space-y-3">
              <p className="text-xs font-medium leading-relaxed text-[var(--text-secondary)]">
                Are you sure you want to delete <strong className="text-[var(--text-primary)]">{item.name}</strong> from the active catalog? This action will remove the SKU and log the deletion in the audit trail.
              </p>

              <div className="p-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">SKU Code:</span>
                  <span className="font-mono font-bold text-[var(--text-primary)]">{item.sku}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Category:</span>
                  <span className="font-semibold text-[var(--text-primary)]">{item.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Remaining Stock:</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{item.quantity} units</span>
                </div>
              </div>

              {item.quantity > 0 && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900/50 flex items-center gap-2.5 text-xs text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>Notice: Active stock ({item.quantity} units) will be decommissioned.</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-subtle)]">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleConfirm}
                disabled={loading}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                <span>{loading ? "Deleting..." : "Confirm Delete"}</span>
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}


