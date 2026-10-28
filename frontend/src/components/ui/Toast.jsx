import React from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[var(--border-mid)] bg-[var(--bg-surface-elev)] shadow-xl pointer-events-auto"
        style={{ color: "var(--text-primary)" }}
      >
        <div className="p-1.5 rounded-md flex items-center">
          {toast.type === "error" ? (
            <span className="w-4 h-4" style={{ color: "var(--badge-text)" }}>
              <AlertTriangle />
            </span>
          ) : (
            <span className="w-4 h-4" style={{ color: "var(--badge-text)" }}>
              <CheckCircle2 />
            </span>
          )}
        </div>
        <div className="text-sm font-medium">{toast.message}</div>
        <button
          onClick={onClose}
          className="ml-auto rounded-md p-1 hover:bg-[var(--bg-surface)] transition-colors"
        >
          <span className="sr-only">Dismiss</span>
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

