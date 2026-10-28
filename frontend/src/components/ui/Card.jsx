import React from "react";

export default function Card({ children, className = "", ...rest }) {
  return (
    <div
      className={`rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elev)] p-5 shadow-sm ${className}`}
      {...rest}
    />
  );
}

