import React, { useEffect } from "react";

export default function Drawer({
  isOpen,
  onClose,
  children,
  placement = "right",
  title,
  className = "",
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const slide = isOpen ? "translate-x-0" : placement === "right" ? "translate-x-full" : "-translate-x-full";

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed inset-y-0 z-50 w-full max-w-md transition-transform duration-150 ease-out ${slide} ${placement === "right" ? "right-0" : "left-0"} shadow-2xl ${className}`}
        role="dialog"
        aria-modal="true"
        style={{
          background: "var(--bg-surface-elev)",
          border: `1px solid var(--border-subtle)`,
        }}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">
            <h3 className="font-semibold text-[var(--text-primary)]">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-md p-1.5 hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] transition-colors"
            >
              <span className="sr-only">Close</span>
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-5 overflow-y-auto max-h-[85vh]">{children}</div>
      </div>
    </>
  );
}

