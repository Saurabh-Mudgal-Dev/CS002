import React from "react";

export default function Input({ id, className = "", ...rest }) {
  return (
    <input
      id={id}
      className={`w-[200px] max-w-full rounded-md border border-[var(--border-mid)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] disabled:opacity-50 disabled:pointer-events-none ${className}`}
      {...rest}
    />
  );
}

