import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "./useAuth";
import {
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Compass
} from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

const DEMO_ACCOUNTS = [
  {
    role: "Admin",
    org: "Asha Relief (NGO)",
    email: "admin@asha.org",
    desc: "Full operational & administrative control",
    color: "primary"
  },
  {
    role: "Manager",
    org: "Asha Relief (NGO)",
    email: "manager@asha.org",
    desc: "Catalog, restock, purchases & movement ops",
    color: "info"
  },
  {
    role: "Accountant",
    org: "Asha Relief (NGO)",
    email: "accounts@asha.org",
    desc: "Donations, expenses & financial ledger",
    color: "success"
  },
  {
    role: "Volunteer",
    org: "Asha Relief (NGO)",
    email: "volunteer@asha.org",
    desc: "Relief disbursements & field intake only",
    color: "warning"
  },
  {
    role: "Retail Owner",
    org: "Sunrise Kirana",
    email: "owner@sunrise.store",
    desc: "Small business retail sales & supply inventory",
    color: "neutral"
  }
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const from = location.state?.from?.pathname || "/overview";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || "Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword("Demo@12345");
    setErrorMessage("");
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="w-full max-w-[420px] space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#123A6B] text-white shadow-md font-bold text-xl tracking-wider">
            R1
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            ResourceOne
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Smart Inventory & Resource Management Platform
          </p>
        </div>

        {/* Login Form Card */}
        <Card className="p-6 sm:p-7 shadow-sm border border-[var(--border-subtle)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                Sign in to your account
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Sign in to access your organization's stock operations and reports.
              </p>
            </div>

            {errorMessage && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900/50 text-xs leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[var(--text-secondary)]">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. manager@asha.org"
                    className="pl-9 text-sm"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-[var(--text-secondary)]">
                    Password
                  </label>
                  <span className="text-[11px] text-[var(--text-dim)]">Demo: Demo@12345</span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="pl-9 pr-9 text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] hover:text-[var(--text-secondary)]"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center py-2.5 mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Authenticating..." : "Sign In"}
              {!isSubmitting && <ArrowRight className="w-4 h-4 ml-1.5" />}
            </Button>
          </form>

          {/* Continue as Guest option */}
          <div className="mt-5 pt-4 border-t border-[var(--border-subtle)] text-center">
            <Link
              to="/overview"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--accent)] hover:underline"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Continue exploring as Guest (Public Mode)</span>
            </Link>
          </div>
        </Card>

        {/* Demo Accounts Quick-Fill Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Quick Demo Accounts
            </span>
            <span className="text-[11px] text-[var(--text-dim)]">Click to auto-fill</span>
          </div>

          <div className="space-y-1.5">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleFillDemo(acc.email)}
                className="w-full text-left p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elev)] hover:border-[var(--accent)] hover:bg-[var(--badge-bg)] transition-all flex items-center justify-between text-xs group cursor-pointer"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)]">
                      {acc.role}
                    </span>
                    <span className="text-[11px] text-[var(--text-dim)]">({acc.org})</span>
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] truncate max-w-[260px]">
                    {acc.email}
                  </div>
                </div>
                <Badge variant={acc.color} size="sm">
                  {acc.role}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-[var(--text-dim)]">
          K.R. Mangalam University · Second Year Minor Project
        </p>
      </div>
    </div>
  );
}
