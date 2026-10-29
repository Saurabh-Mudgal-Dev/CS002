import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

export default function AlertsList({ alerts = [] }) {
  const hasAlerts = alerts && alerts.length > 0;

  return (
    <Card className="p-5 sm:p-6 border border-[var(--border-subtle)] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
            Operational Alerts
          </h2>
        </div>
        {hasAlerts && (
          <Badge variant={alerts.some((a) => a.severity === "danger") ? "danger" : "warning"} size="sm">
            {alerts.length} Active
          </Badge>
        )}
      </div>

      {!hasAlerts ? (
        <div className="py-8 px-4 flex flex-col items-center justify-center text-center space-y-2 border border-dashed border-[var(--border-subtle)] rounded-lg">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-[var(--text-primary)]">
            All stock levels are optimal
          </p>
          <p className="text-[11px] text-[var(--text-muted)] max-w-xs">
            Zero low-stock deficits or upcoming expiration warnings for this organization.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {alerts.map((alert) => {
            const isDanger = alert.severity === "danger";
            const isExpiry = alert.alert_type.includes("expir");

            return (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border text-xs transition-colors flex items-start justify-between gap-3 ${
                  isDanger
                    ? "bg-red-50/70 dark:bg-red-950/30 border-red-200 dark:border-red-900/40"
                    : "bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40"
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="shrink-0 mt-0.5">
                    {isExpiry ? (
                      <Clock
                        className={`w-4 h-4 ${
                          isDanger ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"
                        }`}
                      />
                    ) : (
                      <AlertTriangle
                        className={`w-4 h-4 ${
                          isDanger ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"
                        }`}
                      />
                    )}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[var(--text-primary)] truncate max-w-[180px]">
                        {alert.name}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase">
                        {alert.sku}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] leading-tight">
                      {alert.message}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-1.5">
                  <Badge variant={isDanger ? "danger" : "warning"} size="sm">
                    {isDanger ? (alert.alert_type === "out_of_stock" ? "Out of Stock" : "Expired") : "Low Stock"}
                  </Badge>
                  <Link
                    to={`/inventory?search=${encodeURIComponent(alert.sku)}`}
                    className="text-[11px] font-medium text-[var(--accent)] hover:underline flex items-center gap-0.5"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
