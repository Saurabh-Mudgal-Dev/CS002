import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

export default function Toast({ toast, message, type, onClose }) {
  const content = message || toast?.message;
  const toastType = type || toast?.type || "info";

  return (
    <AnimatePresence>
      {content && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl pointer-events-auto max-w-md text-xs sm:text-sm text-slate-800 dark:text-slate-100"
          >
            <div className="shrink-0">
              {toastType === "error" ? (
                <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 flex items-center justify-center">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
              ) : toastType === "success" ? (
                <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 flex items-center justify-center">
                  <Info className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <div className="font-medium flex-1 pr-1 leading-snug">{content}</div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
