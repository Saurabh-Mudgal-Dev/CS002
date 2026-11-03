import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../features/auth/useAuth";
import { useTheme } from "../context";
import {
  LayoutDashboard,
  Package,
  Coins,
  History,
  Settings,
  Menu,
  X,
  LogOut,
  LogIn,
  Sun,
  Moon,
  Info,
  Store,
  HeartHandshake,
  ChevronDown,
  Boxes,
  UserRound
} from "lucide-react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import AboutModal from "../components/AboutModal";
import Toast from "../components/ui/Toast";
import { getRoleBadgeVariant } from "../lib/permissions";

export default function AppShell({ children, toast, closeToast }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, isAuthenticated, organization, logout, guestOrgType, setGuestOrgType } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const isNGO = organization?.type === "ngo" || (!isAuthenticated && guestOrgType === "ngo");

  const navItems = [
    {
      path: "/overview",
      alias: ["/", "/dashboard"],
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      path: "/inventory",
      alias: [],
      label: "Catalog",
      icon: Package,
    },
    {
      path: "/finance",
      alias: [],
      label: "Finance",
      icon: Coins,
    },
    {
      path: "/audit",
      alias: ["/audit-log"],
      label: "Audit Ledger",
      icon: History,
    },
    {
      path: "/settings",
      alias: [],
      label: "Settings",
      icon: Settings,
    },
  ];

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await logout();
    navigate("/overview");
  };

  const roleBadge = getRoleBadgeVariant(role);

  return (
    <div className="relative app-bg min-h-screen flex flex-col lg:flex-row text-[var(--text-secondary)] font-display">
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar (248px) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[248px] bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-[72px] flex items-start justify-between px-5 pt-4 sm:items-center sm:pt-0 border-b border-[var(--border-subtle)]">
          <Link
            to="/overview"
            className="flex items-center gap-3 font-bold tracking-tight text-sm"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-10 h-10 rounded-xl bg-accent-gradient text-white flex items-center justify-center shadow-[0_6px_18px_-4px_rgba(124,58,237,0.6)] ring-1 ring-white/25">
              <Boxes className="w-5 h-5" strokeWidth={2.2} />
            </div>
            <div className="flex flex-col">
              <span className="leading-tight font-extrabold text-[var(--text-primary)] text-[15px] tracking-tight">
                ResourceOne
              </span>
              <span className="text-[10.5px] text-[var(--text-muted)] font-medium truncate max-w-[150px]">
                {organization?.name || "Smart Inventory OS"}
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="self-center p-1 rounded-lg text-[var(--text-dim)] hover:text-[var(--text-primary)] lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Organization / Context Indicator */}
        <div className="px-4 py-4 border-b border-[var(--border-subtle)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-dim)] mb-1.5">
            Organization
          </p>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[13px] font-bold text-[var(--text-primary)] truncate">
              {isNGO ? "Community NGO" : "Retail Business"}
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/12 border border-emerald-500/30 text-[9px] font-extrabold tracking-widest text-emerald-600 dark:text-emerald-300">
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
          </div>

          <div className="mt-2.5 flex items-center gap-2 flex-wrap text-[10.5px]">
            {!isAuthenticated && (
              <div className="flex items-center gap-1 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-subtle)] p-0.5">
                <button
                  type="button"
                  onClick={() => setGuestOrgType("ngo")}
                  className={`px-2.5 py-1 rounded-md text-[10.5px] font-bold transition-all cursor-pointer ${
                    guestOrgType === "ngo"
                      ? "bg-accent-gradient text-white shadow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  NGO
                </button>
                <button
                  type="button"
                  onClick={() => setGuestOrgType("retail")}
                  className={`px-2.5 py-1 rounded-md text-[10.5px] font-bold transition-all cursor-pointer ${
                    guestOrgType === "retail"
                      ? "bg-accent-gradient text-white shadow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  Retail
                </button>
              </div>
            )}
            {isNGO ? (
              <Badge variant="success" size="sm" className="gap-1">
                <HeartHandshake className="w-3 h-3" />
                Relief
              </Badge>
            ) : (
              <Badge variant="warning" size="sm" className="gap-1">
                <Store className="w-3 h-3" />
                Retail
              </Badge>
            )}
            <Badge variant="primary" size="sm">
              {organization?.currency || "INR"}
            </Badge>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path || (item.alias && item.alias.includes(location.pathname));

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-colors duration-150 ${
                  isActive
                    ? "text-white"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--row-hover)]"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebarActivePill"
                    className="absolute inset-0 bg-accent-gradient rounded-xl -z-10 shadow-[0_8px_20px_-6px_rgba(124,58,237,0.6)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className="w-4 h-4 shrink-0" strokeWidth={2.2} />
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Footer Panel */}
        <div className="p-3 border-t border-[var(--border-subtle)] space-y-2.5">
          {isAuthenticated ? (
            <div className="p-3 rounded-xl bg-[var(--bg-card-base)] border border-[var(--border-subtle)] space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-accent-gradient text-white text-sm font-bold flex items-center justify-center shrink-0 shadow-sm">
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-bold text-[var(--text-primary)] truncate">
                    {user?.full_name || user?.email}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Badge variant={roleBadge.variant} size="sm">
                      {roleBadge.label}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setAboutOpen(true)}
                  className="text-[11.5px] text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1.5 cursor-pointer font-semibold transition-colors"
                >
                  <Info className="w-3.5 h-3.5" />
                  About
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-[11.5px] text-rose-500 hover:text-rose-400 flex items-center gap-1.5 cursor-pointer font-semibold transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-[var(--bg-card-base)] border border-[var(--border-subtle)] space-y-2.5 relative overflow-hidden card-topline">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Boxes className="w-3.5 h-3.5" />
                </div>
                <span className="text-[12.5px] font-extrabold text-[var(--text-primary)]">Public Showcase</span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] leading-snug">
                Live sandbox preview. Explore catalog metrics and stock information.
              </p>
              <Link to="/login" className="block">
                <Button variant="primary" size="sm" className="w-full justify-center">
                  <LogIn className="w-3.5 h-3.5 mr-1" />
                  Sign In
                </Button>
              </Link>
            </div>
          )}

          <div className="flex items-center justify-between px-1.5 text-[11px] text-[var(--text-dim)]">
            <button
              type="button"
              onClick={() => setAboutOpen(true)}
              className="hover:text-[var(--text-secondary)] cursor-pointer font-semibold transition-colors"
            >
              ResourceOne v1.0
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-lg hover:bg-[var(--row-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer border border-transparent hover:border-[var(--border-subtle)]"
              title="Toggle Light / Dark Theme"
            >
              {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col lg:pl-[248px] min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-[72px] bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-subtle)] px-4 sm:px-7 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl border border-[var(--border-mid)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--row-hover)] lg:hidden cursor-pointer transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-[15px] sm:text-base font-extrabold text-[var(--text-primary)] leading-tight tracking-tight">
                {organization?.name || "Community Relief Organization"}
              </h1>
              <p className="text-[11px] text-[var(--text-dim)] hidden sm:block font-medium">
                {isNGO ? "Community Aid & Humanitarian Operations" : "Commercial Retail Operations"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live indicator */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/25 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Engine</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] bg-[var(--row-hover)] text-[var(--text-muted)] border border-[var(--border-subtle)] font-bold">
              <UserRound className="w-3.5 h-3.5" />
              <span>{isAuthenticated ? roleBadge.label : "Guest View"}</span>
            </div>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-[var(--border-mid)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--row-hover)] transition-colors cursor-pointer"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User action */}
            {!isAuthenticated ? (
              <Link to="/login">
                <Button variant="primary" size="sm">
                  <LogIn className="w-3.5 h-3.5 mr-1" />
                  Sign In
                </Button>
              </Link>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 px-1.5 py-1.5 rounded-xl border border-[var(--border-mid)] hover:bg-[var(--row-hover)] transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-accent-gradient text-white text-[11px] font-bold flex items-center justify-center">
                    {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--text-dim)]" />
                </button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.96 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 mt-2 w-48 rounded-2xl bg-[var(--bg-card-base)] border border-[var(--border-subtle)] shadow-[var(--shadow-pop)] py-1.5 z-50 text-xs"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-3.5 py-2.5 border-b border-[var(--border-subtle)]">
                        <p className="font-bold text-[var(--text-primary)] truncate">
                          {user?.full_name}
                        </p>
                        <p className="text-[11px] text-[var(--text-dim)] truncate">{user?.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAboutOpen(true)}
                        className="w-full text-left px-3.5 py-2 hover:bg-[var(--row-hover)] flex items-center gap-2 text-[var(--text-secondary)] cursor-pointer"
                      >
                        <Info className="w-3.5 h-3.5 text-[var(--text-dim)]" />
                        About Platform
                      </button>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left px-3.5 py-2 hover:bg-rose-500/10 text-rose-500 flex items-center gap-2 cursor-pointer font-semibold"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-7 py-6 sm:py-7">
          {children}
        </main>

        {/* Footer */}
        <footer className="w-full border-t border-[var(--border-subtle)] py-4 px-4 sm:px-7">
          <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[11px] font-semibold text-[var(--text-dim)]">
            <span>ResourceOne · Smart Inventory & Resource Operations Platform</span>
            <span>Aurora Edition · NGO & Retail Dual Architecture</span>
          </div>
        </footer>
      </div>

      {/* About Modal */}
      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />

      {/* Global Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </div>
  );
}
