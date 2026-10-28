import React from "react";

export default function Field({ label, error, children, className = "" }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <label className="block text-xs font-semibold text-[var(--text-muted)]">{label}</label>}
      <div>{children}</div>
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

