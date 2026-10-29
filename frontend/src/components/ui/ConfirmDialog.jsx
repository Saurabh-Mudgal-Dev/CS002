import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";
import Button from "./Button";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm action",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  className = "",
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={`relative z-10 w-full max-w-md rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elev)] p-6 shadow-2xl ${className}`}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start gap-3.5 mb-4">
              {danger && (
                <div className="w-9 h-9 rounded-xl bg-rose-50/70 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
              )}
              <div className="space-y-1">
                <h3 className="font-bold text-[var(--text-primary)] text-base">
                  {title}
                </h3>
                {message && (
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-[var(--border-subtle)]">
              <Button
                variant="secondary"
                size="sm"
                onClick={onClose}
              >
                {cancelLabel}
              </Button>
              <Button
                variant={danger ? "danger" : "primary"}
                size="sm"
                onClick={onConfirm}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
