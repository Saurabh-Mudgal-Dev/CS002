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
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/12 text-amber-600 dark:text-amber-400 shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)] tracking-tight">
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
        <div className="py-8 px-4 flex flex-col items-center justify-center text-center space-y-2.5">
          <div className="w-12 h-12 rounded-full bg-emerald-500/12 text-emerald-500 flex items-center justify-center ring-4 ring-emerald-500/10">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-[var(--text-primary)]">
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
                className={`p-3 rounded-xl border text-xs transition-colors flex items-start justify-between gap-3 ${
                  isDanger
                    ? "bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/40"
                    : "bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40"
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="shrink-0 mt-0.5">
                    {isExpiry ? (
                      <Clock
                        className={`w-4 h-4 ${
                          isDanger ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"
                        }`}
                      />
                    ) : (
                      <AlertTriangle
                        className={`w-4 h-4 ${
                          isDanger ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"
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

