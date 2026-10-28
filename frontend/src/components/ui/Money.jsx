import React from "react";

export default function Money({ amount, currency = "INR" }) {
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
  }).format(amount ?? 0);

  return (
    <span className="tabular-nums font-medium text-[var(--text-primary)]">
      {formatted}
    </span>
  );
}

