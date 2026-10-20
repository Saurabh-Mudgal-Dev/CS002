import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";

export default function Toast({ toast, onClose }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id || "toast"}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl coffee-glass shadow-2xl border border-[#5a4234]/60 backdrop-blur-2xl"
        >
          <div
            className={`p-2 rounded-xl ${
              toast.type === "error"
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
            }`}
          >
            {toast.type === "error" ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
          </div>
          <div className="text-sm font-medium text-[#f7efe9] pr-2">
            {toast.message}
          </div>
          <button
            onClick={onClose}
            className="text-[#a8988f] hover:text-[#f7efe9] p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
