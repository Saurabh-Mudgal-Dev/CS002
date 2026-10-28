import React from "react";

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
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed left-[50%] top-[50%] z-50 -translate-x-[50%] -translate-y-[50%] w-full max-w-md rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elev)] p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        style={{ outline: "none" }}
      >
        <h3 className="font-semibold text-[var(--text-primary)] mb-1">{title}</h3>
        {message && <p className="text-sm text-[var(--text-secondary)] mb-6">{message}</p>}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[var(--border-mid)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              danger
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-[var(--accent)] text-white border-[var(--accent)] hover:bg-[var(--accent-hover)]"
            } ${className}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}

