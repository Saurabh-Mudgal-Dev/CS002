import React from "react";

export default function Table({ children, className = "" }) {
  return (
    <div className={`overflow-x-auto border border-[var(--border-subtle)] rounded-lg ${className}`}>
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  );
}

export function TableHeader({ children, className = "" }) {
  return <thead className={className}>{children}</thead>;
}

export function TableBody({ children, className = "" }) {
  return <tbody className={className}>{children}</tbody>;
}

export function TableRow({ children, className = "" }) {
  return (
    <tr className={`border-b border-[var(--border-subtle)] hover:bg-[var(--row-hover)] transition-colors ${className}`}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className = "" }) {
  return (
    <th
      className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-subtle)] bg-[var(--table-header-bg)] text-left ${className}`}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className = "" }) {
  return (
    <td className={`px-4 py-3 text-[var(--text-secondary)] border-b border-[var(--border-subtle)] ${className}`}>
      {children}
    </td>
  );
}

