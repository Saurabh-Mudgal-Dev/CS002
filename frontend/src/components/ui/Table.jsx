export default function Table({ children, className = "" }) {
  return (
    <div className={`overflow-x-auto border border-[var(--border-subtle)] rounded-2xl ${className}`}>
      <table className="w-full text-xs border-collapse">{children}</table>
    </div>
  );
}

export function TableHeader({ children, className = "" }) {
  return <thead className={`bg-[var(--table-header-bg)] text-[var(--text-dim)] ${className}`}>{children}</thead>;
}

export function TableBody({ children, className = "" }) {
  return <tbody className={`divide-y divide-[var(--border-subtle)] ${className}`}>{children}</tbody>;
}

export function TableRow({ children, className = "" }) {
  return (
    <tr className={`hover:bg-[var(--row-hover)] transition-colors ${className}`}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className = "" }) {
  return (
    <th
      className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-dim)] text-left ${className}`}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className = "" }) {
  return (
    <td className={`px-4 py-3 text-[var(--text-secondary)] ${className}`}>
      {children}
    </td>
  );
}
