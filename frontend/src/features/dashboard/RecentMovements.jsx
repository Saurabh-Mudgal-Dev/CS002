import { Link } from "react-router-dom";
import { History, ArrowRight } from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { formatNumber, formatCurrency, formatTimeAgo } from "../../lib/format";

export default function RecentMovements({ movements = [], currency = "INR" }) {
  const hasMovements = movements && movements.length > 0;

  const getMovementBadge = (type) => {
    switch (type?.toUpperCase()) {
      case "RESTOCK":
        return { label: "Restock", variant: "success", isPositive: true };
      case "RELIEF":
        return { label: "Aid Relief", variant: "warning", isPositive: false };
      case "SALE":
        return { label: "Sale", variant: "info", isPositive: false };
      case "ADJUSTMENT":
        return { label: "Adjustment", variant: "neutral", isPositive: true };
      default:
        return { label: type || "Movement", variant: "neutral", isPositive: true };
    }
  };

  return (
    <Card className="p-5 sm:p-6 border border-[var(--border-subtle)] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[var(--accent)]" />
          <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
            Recent Stock Movements
          </h2>
        </div>
        <Link
          to="/audit"
          className="text-xs font-medium text-[var(--accent)] hover:underline flex items-center gap-1"
        >
          <span>Audit Ledger</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {!hasMovements ? (
        <div className="py-8 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded-lg">
          No stock adjustments logged yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-medium">
                <th className="pb-2.5 font-medium">Action</th>
                <th className="pb-2.5 font-medium">Item & SKU</th>
                <th className="pb-2.5 font-medium text-right">Quantity</th>
                <th className="pb-2.5 font-medium text-right">Valuation</th>
                <th className="pb-2.5 font-medium text-right">Actor</th>
                <th className="pb-2.5 font-medium text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {movements.slice(0, 7).map((m) => {
                const badge = getMovementBadge(m.movement_type);
                const delta = m.quantity_delta;
                const isPositive = delta > 0;

                return (
                  <tr key={m.id} className="hover:bg-[var(--row-hover)] transition-colors">
                    <td className="py-2.5">
                      <Badge variant={badge.variant} size="sm">
                        {badge.label}
                      </Badge>
                    </td>
                    <td className="py-2.5 min-w-[160px]">
                      <div className="font-semibold text-[var(--text-primary)] truncate max-w-[200px]">
                        {m.item_name || m.summary}
                      </div>
                      {m.sku && (
                        <div className="text-[10px] font-mono text-[var(--text-dim)]">
                          {m.sku}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 text-right font-semibold tabular-nums">
                      <span className={isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
                        {isPositive ? `+${formatNumber(delta)}` : formatNumber(delta)}
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-[var(--text-muted)] tabular-nums">
                      {m.total_value ? formatCurrency(m.total_value, currency) : "—"}
                    </td>
                    <td className="py-2.5 text-right text-[var(--text-dim)] truncate max-w-[100px]">
                      {m.actor_name || "System"}
                    </td>
                    <td className="py-2.5 text-right text-[var(--text-dim)] whitespace-nowrap">
                      {formatTimeAgo(m.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
