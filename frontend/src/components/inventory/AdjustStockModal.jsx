import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, RefreshCw, HeartHandshake, Store } from "lucide-react";
import Button from "../ui/Button";

export default function AdjustStockModal({
  isOpen,
  item,
  onClose,
  onAdjust,
  contextMode,
}) {
  const isNGO = contextMode === "ngo";
  const defaultAction = isNGO ? "RELIEF_DISTRIBUTION" : "SALE";

  const [adjustmentType, setAdjustmentType] = useState(defaultAction);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && item) {
      setAdjustmentType(defaultAction);
      setQuantity(1);
      setNote("");
      setError("");
      setLoading(false);
    }
  }, [isOpen, item, defaultAction]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const qty = parseInt(quantity, 10);

    if (!Number.isInteger(qty) || qty <= 0) {
      setError("Please enter a valid quantity greater than 0.");
      return;
    }

    if (
      (adjustmentType === "RELIEF_DISTRIBUTION" ||
        adjustmentType === "SALE") &&
      qty > Number(item.quantity)
    ) {
      setError(
        `Cannot dispatch more than current stock (${item.quantity} available).`
      );
      return;
    }

    try {
      setLoading(true);

      await onAdjust({
        adjustment_type: adjustmentType,
        quantity: qty,
        note:
          note.trim() ||
          (adjustmentType === "RESTOCK"
            ? "Inventory Restock"
            : isNGO
              ? "Aid Handover"
              : "Counter Sale"),
        performed_by: isNGO ? "Field Volunteer" : "Store Clerk",
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
            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-7"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Adjust Stock Level
                </h3>
                <p className="max-w-xs truncate text-xs text-slate-500">
                  {item.name}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Current balance */}
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-xs dark:border-slate-700/60 dark:bg-slate-800/60">
              <div>
                <span className="text-slate-400">Current Balance:</span>
                <div className="tabular-nums text-base font-extrabold text-slate-900 dark:text-white">
                  {item.quantity} units
                </div>
              </div>

              <div className="text-right">
                <span className="text-slate-400">Safety Threshold:</span>
                <div className="tabular-nums text-sm font-bold text-amber-600 dark:text-amber-400">
                  {item.reorder_level} units
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Adjustment type */}
              <div>
                <label className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Action Type
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setAdjustmentType(
                        isNGO ? "RELIEF_DISTRIBUTION" : "SALE"
                      )
                    }
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border p-3 text-xs font-bold transition-all ${
                      adjustmentType !== "RESTOCK"
                        ? "border-rose-300 bg-rose-50 text-rose-700 shadow-xs dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                        : "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800"
                    }`}
                  >
                    {isNGO ? (
                      <HeartHandshake className="mb-1 h-5 w-5 text-rose-600 dark:text-rose-400" />
                    ) : (
                      <Store className="mb-1 h-5 w-5 text-rose-600 dark:text-rose-400" />
                    )}

                    <span>
                      {isNGO ? "Issue Relief (-)" : "Record Sale (-)"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustmentType("RESTOCK")}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border p-3 text-xs font-bold transition-all ${
                      adjustmentType === "RESTOCK"
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700 shadow-xs dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800"
                    }`}
                  >
                    <RefreshCw className="mb-1 h-5 w-5 text-emerald-600 dark:text-emerald-400" />

                    <span>
                      {isNGO
                        ? "Donation Inflow (+)"
                        : "Supplier Delivery (+)"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Quantity to{" "}
                  {adjustmentType === "RESTOCK" ? "Add" : "Deduct"}{" "}
                  <span className="text-rose-500">*</span>
                </label>

                <input
                  type="number"
                  min="1"
                  max={
                    adjustmentType !== "RESTOCK"
                      ? item.quantity
                      : 99999
                  }
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold tabular-nums text-slate-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>

              {/* Reference note */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-3 dark:border-slate-800">
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
                  {loading
                    ? "Processing..."
                    : adjustmentType === "RESTOCK"
                      ? "Confirm Restock (+)"
                      : "Confirm Outflow (-)"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}