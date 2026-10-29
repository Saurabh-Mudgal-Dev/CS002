/**
 * Formatting utilities for ResourceOne
 * Conforms to Indian Numbering system (en-IN) and standard IST operations display.
 */

export function formatCurrency(amount, currency = "INR") {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "—";
  }
  const numeric = typeof amount === "string" ? parseFloat(amount) : amount;
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(numeric);
  } catch {
    return `₹${numeric.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  }
}

export function formatNumber(val, decimals = 0) {
  if (val === null || val === undefined || isNaN(val)) {
    return "0";
  }
  const numeric = typeof val === "string" ? parseFloat(val) : val;
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(numeric);
}

export function formatDate(dateStr, includeTime = false) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);

    const options = {
      day: "numeric",
      month: "short",
      year: "numeric",
      ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {})
    };
    return new Intl.DateTimeFormat("en-IN", options).format(d);
  } catch {
    return String(dateStr);
  }
}

export function formatTimeAgo(dateStr) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - d) / 1000);

    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 86400 * 7) return `${Math.floor(diffSec / 86400)}d ago`;

    return formatDate(dateStr, false);
  } catch {
    return String(dateStr);
  }
}

