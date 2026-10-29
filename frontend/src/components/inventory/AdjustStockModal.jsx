import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, HeartHandshake, Store } from "lucide-react";
import Button from "../ui/Button";

export default function AdjustStockModal({ isOpen, item, onClose, onAdjust, contextMode }) {
  const isNGO = contextMode === "ngo";
  const defaultAction = isNGO ? "RELIEF_DISTRIBUTION" : "SALE";

  const [adjustmentType, setAdjustmentType] = useState(defaultAction);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) {
      setError("Please enter a valid quantity greater than 0.");
      return;
    }

    if ((adjustmentType === "RELIEF_DISTRIBUTION" || adjustmentType === "SALE") && qty > (item?.quantity ?? 0)) {
      setError(`Cannot dispatch more than current stock (${item?.quantity ?? 0} available).`);
      return;
    }

    try {
      setLoading(true);
      await onAdjust({
        adjustment_type: adjustmentType,
        quantity: qty,
        note: note.trim() || (adjustmentType === "RESTOCK" ? "Inventory Restock" : isNGO ? "Aid Handover" : "Counter Sale"),
        performed_by: isNGO ? "Field Volunteer" : "Store Clerk"
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to adjust stock.");
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
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Adjust Stock Level</h3>
                <p className="text-xs text-slate-500 truncate max-w-xs">{item.name}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current balance */}
            <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400">Current Balance:</span>
                <div className="text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {item.quantity} units
                </div>
              </div>
              <div className="text-right">
                <span className="text-slate-400">Safety Threshold:</span>
                <div className="text-sm font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                  {item.reorder_level} units
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-300 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Adjustment Type Switcher */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Action Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustmentType(isNGO ? "RELIEF_DISTRIBUTION" : "SALE")}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      adjustmentType !== "RESTOCK"
                        ? "bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700"
                    }`}
                  >
                    {isNGO ? <HeartHandshake className="w-5 h-5 mb-1 text-rose-600 dark:text-rose-400" /> : <Store className="w-5 h-5 mb-1 text-rose-600 dark:text-rose-400" />}
                    <span>{isNGO ? "Issue Relief (-)" : "Record Sale (-)"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustmentType("RESTOCK")}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      adjustmentType === "RESTOCK"
                        ? "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700"
                    }`}
                  >
                    <RefreshCw className="w-5 h-5 mb-1 text-emerald-600 dark:text-emerald-400" />
                    <span>{isNGO ? "Donation Inflow (+)" : "Supplier Delivery (+)"}</span>
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Quantity to {adjustmentType === "RESTOCK" ? "Add" : "Deduct"} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={adjustmentType !== "RESTOCK" ? item.quantity : 99999}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all tabular-nums font-bold"
                  required
                />
              </div>

              {/* Reference Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Reference Note / Recipient
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={
                    adjustmentType === "RESTOCK"
                      ? "e.g., Rotary Club Donation or Invoice #942"
                      : isNGO
                      ? "e.g., Flood Relief Camp 4 or Community Health Clinic"
                      : "e.g., Customer Receipt #104 or Online Order"
                  }
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
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
                  variant={adjustmentType === "RESTOCK" ? "primary" : "danger"}
                  size="sm"
                  disabled={loading}
                >
                  {loading ? "Processing..." : adjustmentType === "RESTOCK" ? "Confirm Restock (+)" : "Confirm Outflow (-)"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
