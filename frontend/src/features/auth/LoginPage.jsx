import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "./useAuth";
import {
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Compass,
  Sparkles
} from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

const DEMO_ACCOUNTS = [
  {
    role: "Admin",
    org: "Community Relief (NGO)",
    email: "admin@resourceone.org",
    legacyEmail: "admin@asha.org",
    desc: "Full operational & administrative control",
    color: "primary"
  },
  {
    role: "Inventory Manager",
    org: "Community Relief (NGO)",
    email: "manager@resourceone.org",
    legacyEmail: "manager@asha.org",
    desc: "Catalog, restock, purchases & movement ops",
    color: "info"
  },
  {
    role: "Accountant",
    org: "Community Relief (NGO)",
    email: "accounts@resourceone.org",
    legacyEmail: "accounts@asha.org",
    desc: "Donations, expenses & financial ledger",
    color: "success"
  },
  {
    role: "Volunteer",
    org: "Community Relief (NGO)",
    email: "volunteer@resourceone.org",
    legacyEmail: "volunteer@asha.org",
    desc: "Relief disbursements & field intake only",
    color: "warning"
  },
  {
    role: "Retail Owner",
    org: "Sunrise Retail Store",
    email: "owner@sunrise.store",
    legacyEmail: "owner@sunrise.store",
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

  const handleFillDemo = (acc) => {
    setEmail(acc.email);
    setPassword("Demo@12345");
    setErrorMessage("");
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 bg-alukaze-grid"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="w-full max-w-[440px] space-y-6">
        {/* Brand Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="text-center space-y-2.5"
        >
          <Link to="/overview" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-center font-black text-xl shadow-md ring-1 ring-white/20">
              R1
            </div>
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              ResourceOne Workspace
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Smart Inventory & Resource Operations Architecture
            </p>
          </div>
        </motion.div>

        {/* Login Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
        >
          <Card className="p-6 sm:p-7 shadow-alukaze border border-slate-200/90 dark:border-slate-800">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Sign in to your account
                </h2>
                <p className="text-xs text-slate-500">
                  Access your organization's real-time stock operations and ledgers.
                </p>
              </div>

              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -6 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -6 }}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 text-xs leading-relaxed"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. manager@resourceone.org"
                      className="pl-10 text-sm"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">Demo: Demo@12345</span>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="pl-10 pr-10 text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
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
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <Link
                to="/overview"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <Compass className="w-4 h-4" />
                <span>Explore Interactive Showcase as Guest</span>
              </Link>
            </div>
          </Card>
        </motion.div>

        {/* Demo Accounts Quick-Fill Section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
          className="space-y-2.5"
        >
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Quick Demo Personas</span>
            </div>
            <span className="text-[11px] text-slate-400">Click to fill</span>
          </div>

          <div className="space-y-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <motion.button
                key={acc.email}
                type="button"
                whileHover={{ scale: 1.015, y: -1 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.15 }}
                onClick={() => handleFillDemo(acc)}
                className="w-full text-left p-3 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-xs transition-colors flex items-center justify-between text-xs group cursor-pointer"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      {acc.role}
                    </span>
                    <span className="text-[11px] text-slate-400">({acc.org})</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono truncate max-w-[260px]">
                    {acc.email}
                  </div>
                </div>
                <Badge variant={acc.color} size="sm">
                  {acc.role}
                </Badge>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400">
          K.R. Mangalam University · Second Year Minor Project
        </p>
      </div>
    </div>
  );
}
