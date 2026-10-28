import React from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

const variants = {
  primary: "bg-[var(--accent)] text-white border-[var(--accent)] hover:bg-[var(--accent-hover)] shadow-sm",
  secondary:
    "bg-transparent text-[var(--text-primary)] border-[var(--border-mid)] hover:bg-[var(--bg-surface-elev)]",
  ghost: "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elev)]",
  danger: "border-red-500/30 text-red-500 hover:bg-red-500/10",
};

export default function Button({
  children,
  variant = "primary",
  disabled = false,
  loading = false,
  onClick,
  className = "",
  type = "button",
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      {loading ? (
        <span className="flex items-center gap-1.5 text-xs font-semibold">
          <span className="relative flex h-3 w-3 rounded-full">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--accent)]" />
          </span>
          Loadingâ€¦
        </span>
      ) : (
        children
      )}
    </button>
  );
}

