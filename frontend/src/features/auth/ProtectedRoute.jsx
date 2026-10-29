import { Link, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";
import { ShieldAlert, Lock, ArrowRight } from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

export default function ProtectedRoute({
  children,
  permission = null,
  requiredRole = null,
  fallbackTitle = "Authentication Required",
  fallbackMessage = "This section requires signing in with an authorized account."
}) {
  const { isAuthenticated, role, can, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-[var(--text-muted)] text-sm">
        Verifying permissions...
      </div>
    );
  }

  const hasAccess =
    (!permission || can(permission)) &&
    (!requiredRole || (Array.isArray(requiredRole) ? requiredRole.includes(role) : role === requiredRole));

  if (!hasAccess) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4">
        <Card className="p-8 text-center space-y-5 border border-[var(--border-subtle)]">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 flex items-center justify-center">
            {isAuthenticated ? <ShieldAlert className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              {fallbackTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed max-w-md mx-auto">
              {!isAuthenticated
                ? fallbackMessage
                : `Your current role (${role}) does not have permission to view this section.`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {!isAuthenticated ? (
              <Link to="/login" state={{ from: location }}>
                <Button variant="primary">
                  <span>Sign In to Continue</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            ) : (
              <Link to="/overview">
                <Button variant="secondary">Return to Overview</Button>
              </Link>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return children;
}
