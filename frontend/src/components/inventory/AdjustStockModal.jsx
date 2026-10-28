import React, { useState } from "react";
import { X, RefreshCw, HeartHandshake, Store } from "lucide-react";

export default function AdjustStockModal({ isOpen, item, onClose, onAdjust, contextMode }) {
  if (!isOpen || !item) return null;

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

    if ((adjustmentType === "RELIEF_DISTRIBUTION" || adjustmentType === "SALE") && qty > item.quantity) {
      setError(`Cannot dispatch more than current stock (${item.quantity} available).`);
      return;
    }

    try {
      setLoading(true);
      await onAdjust(item.id, {
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
    
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
        <div
          
          
          
          
          className="relative w-full max-w-md   p-6 sm:p-7 shadow-2xl border border-[#3c2a1e]/80 shadow-black/60 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#2a1e16]">
            <div>
              <h3 className="font-extrabold text-lg text-[#fdf6e9]">Adjust Stock Level</h3>
              <p className="text-xs text-[#7a6352] truncate max-w-xs">{item.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-[#5a4030] hover:text-[#fdf6e9] p-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current balance */}
          <div className="mt-4 p-3.5 rounded-2xl bg-[#0d0a08] border border-[#3c2a1e] flex items-center justify-between text-xs">
            <div>
              <span className="text-[#7a6352]">Current Balance:</span>
              <div className="text-base font-extrabold text-[#fdf6e9] tabular-nums">
                {item.quantity} units
              </div>
            </div>
            <div>
              <span className="text-[#7a6352]">Safety Threshold:</span>
              <div className="text-sm font-bold text-[#f5c842] tabular-nums">
                {item.reorder_level} units
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Adjustment Type Switcher */}
            <div>
              <label className="block text-xs font-bold text-[#b5997e] mb-2">
                Action Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustmentType(isNGO ? "RELIEF_DISTRIBUTION" : "SALE")}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    adjustmentType !== "RESTOCK"
                      ? "bg-rose-500/12 border-rose-500/35 text-rose-300 shadow-md shadow-rose-500/10"
                      : "bg-[#0d0a08] border-[#3c2a1e] text-[#7a6352] hover:border-[#5a4030]"
                  }`}
                >
                  {isNGO ? <HeartHandshake className="w-5 h-5 mb-1 text-rose-400" /> : <Store className="w-5 h-5 mb-1 text-rose-400" />}
                  <span>{isNGO ? "Issue Relief (-)" : "Record Sale (-)"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdjustmentType("RESTOCK")}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    adjustmentType === "RESTOCK"
                      ? "bg-emerald-500/12 border-emerald-500/35 text-emerald-300 shadow-md shadow-emerald-500/10"
                      : "bg-[#0d0a08] border-[#3c2a1e] text-[#7a6352] hover:border-[#5a4030]"
                  }`}
                >
                  <RefreshCw className="w-5 h-5 mb-1 text-emerald-400" />
                  <span>{isNGO ? "Donation Inflow (+)" : "Supplier Delivery (+)"}</span>
                </button>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-bold text-[#b5997e] mb-1.5">
                Quantity to {adjustmentType === "RESTOCK" ? "Add" : "Deduct"} <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="1"
                max={adjustmentType !== "RESTOCK" ? item.quantity : 9999}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0d0a08] border border-[#3c2a1e] text-sm text-[#fdf6e9] focus:outline-none focus:border-[#f5c842]/40 transition-all tabular-nums font-bold"
                required
              />
            </div>

            {/* Reference Note */}
            <div>
              <label className="block text-xs font-bold text-[#b5997e] mb-1.5">
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
                className="w-full px-4 py-2 rounded-xl bg-[#0d0a08] border border-[#3c2a1e] text-xs text-[#fdf6e9] placeholder-[#3c2a1e] focus:outline-none focus:border-[#f5c842]/40 transition-all"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2a1e16]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-[#5a4030] hover:text-[#fdf6e9] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                
                type="submit"
                disabled={loading}
                className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg transition-all disabled:opacity-50 cursor-pointer ${
                  adjustmentType === "RESTOCK"
                    ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20"
                    : "bg-rose-600 hover:bg-rose-500 shadow-rose-600/20"
                }`}
              >
                {loading ? "Processing..." : adjustmentType === "RESTOCK" ? "Confirm Restock (+)" : "Confirm Outflow (-)"}
              </button>
            </div>
          </form>
        </div>
      </div>
    
  );
}

