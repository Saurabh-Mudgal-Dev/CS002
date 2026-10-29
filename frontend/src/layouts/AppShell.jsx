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
  Sparkles
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

  const isNGO = organization?.type === "ngo";

  const navItems = [
    {
      path: "/overview",
      alias: ["/", "/dashboard"],
      label: "Overview",
      icon: LayoutDashboard,
      alwaysShow: true,
    },
    {
      path: "/inventory",
      alias: [],
      label: "Catalog",
      icon: Package,
      alwaysShow: true,
    },
    {
      path: "/finance",
      alias: [],
      label: "Finance",
      icon: Coins,
      alwaysShow: true,
    },
    {
      path: "/audit",
      alias: ["/audit-log"],
      label: "Audit Ledger",
      icon: History,
      alwaysShow: true,
    },
    {
      path: "/settings",
      alias: [],
      label: "Settings",
      icon: Settings,
      alwaysShow: true,
    },
  ];

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await logout();
    navigate("/overview");
  };

  const roleBadge = getRoleBadgeVariant(role);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[var(--bg-primary)] text-[var(--text-secondary)]">
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Alukaze Sidebar (240px) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[240px] bg-[var(--bg-surface-elev)] border-r border-[var(--border-subtle)] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[var(--border-subtle)]">
          <Link
            to="/overview"
            className="flex items-center gap-2.5 font-bold tracking-tight text-sm text-[var(--text-primary)]"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-gradient)] text-white flex items-center justify-center font-extrabold text-xs shadow-xs ring-1 ring-[var(--accent)]/20">
              R1
            </div>
            <div className="flex flex-col">
              <span className="leading-tight font-extrabold text-[var(--text-primary)]">ResourceOne</span>
              <span className="text-[10px] text-[var(--text-muted)] font-medium truncate max-w-[140px]">
                {organization?.name || "Inventory OS"}
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 rounded-lg text-[var(--text-dim)] hover:text-[var(--text-secondary)] lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Organization / Context Indicator */}
        <div className="px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)]">
              {isNGO ? (
                <HeartHandshake className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Store className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              )}
              <span className="truncate max-w-[125px]">
                {isNGO ? "Community NGO" : "Retail Commercial"}
              </span>
            </div>
            <Badge variant={isNGO ? "success" : "info"} size="sm">
              {organization?.currency || "INR"}
            </Badge>
          </div>

          {!isAuthenticated && (
            <div className="mt-2.5 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px]">
              <span className="text-[var(--text-dim)] font-medium">Preview:</span>
              <div className="flex items-center gap-1 bg-[var(--border-subtle)] p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setGuestOrgType("ngo")}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all ${
                    guestOrgType === "ngo"
                      ? "bg-[var(--bg-surface-elev)] text-[var(--accent)] shadow-2xs border border-[var(--border-subtle)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                  }`}
                >
                  NGO
                </button>
                <button
                  type="button"
                  onClick={() => setGuestOrgType("retail")}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all ${
                    guestOrgType === "retail"
                      ? "bg-white dark:bg-[var(--bg-surface-elev)] text-[var(--accent)] shadow-2xs"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  Retail
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            if (!item.alwaysShow && !item.visible && !item.lockedForGuest) {
              return null;
            }

            const Icon = item.icon;
            const isActive =
              location.pathname === item.path || (item.alias && item.alias.includes(location.pathname));

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors duration-150 ${
                  isActive
                    ? "text-[var(--text-primary)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebarActivePill"
                    className="absolute inset-0 bg-[var(--accent)] rounded-xl -z-10 shadow-xs"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <div className="flex items-center gap-2.5 z-10">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Footer Panel */}
        <div className="p-3 border-t border-[var(--border-subtle)] space-y-2">
          {isAuthenticated ? (
            <div className="p-2.5 rounded-xl bg-[var(--bg-surface)]/50 border border-[var(--border-subtle)]/70 border-[var(--border-subtle)]/60 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[var(--bg-surface-elev)] text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                    {user?.full_name || user?.email}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge variant={roleBadge.variant} size="sm">
                      {roleBadge.label}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--border-subtle)]/60 border-[var(--border-subtle)] flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setAboutOpen(true)}
                  className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] dark:hover:text-[var(--text-primary)] flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Info className="w-3.5 h-3.5" />
                  About
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-[11px] text-rose-600 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-gradient-to-b from-blue-50/70 to-indigo-50/40 dark:from-[var(--bg-surface-elev)] dark:to-[var(--bg-surface-elev)]/40 border border-blue-100 border-[var(--border-subtle)] space-y-2.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span className="text-xs font-bold text-[var(--text-primary)]">Public Showcase</span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] leading-tight">
                Live sandbox mode enabled. Explore stock metrics and audits.
              </p>
              <Link to="/login" className="block">
                <Button variant="primary" size="sm" className="w-full justify-center">
                  <LogIn className="w-3.5 h-3.5 mr-1" />
                  Sign In
                </Button>
              </Link>
            </div>
          )}

          <div className="flex items-center justify-between px-1 text-[11px] text-[var(--text-dim)]">
            <button
              type="button"
              onClick={() => setAboutOpen(true)}
              className="hover:text-[var(--text-secondary)] dark:hover:text-[var(--text-primary)] cursor-pointer font-medium"
            >
              ResourceOne v1.0
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-lg hover:bg-[var(--row-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] dark:hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              title="Toggle Light/Dark Theme"
            >
              {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-[240px] min-w-0">
        {/* Alukaze Topbar (64px) with subtle blur */}
        <header className="sticky top-0 z-30 h-16 bg-white/85 dark:bg-[var(--bg-surface-elev)]/85 backdrop-blur-md border-b border-[var(--border-subtle)] px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] dark:hover:text-[var(--text-primary)] lg:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] leading-tight">
                {organization?.name || "ResourceOne Platform"}
              </h1>
              <p className="text-[11px] text-[var(--text-dim)] hidden sm:block font-medium">
                {isNGO ? "Community Aid & Humanitarian Operations" : "Commercial Retail & Grocers"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Live indicator */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/40 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Engine</span>
            </div>

            {/* Role Badge */}
            <Badge variant={roleBadge.variant} size="md">
              {roleBadge.label}
            </Badge>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] dark:hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]/70 hover:bg-[var(--row-hover)] transition-colors cursor-pointer"
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
                  className="flex items-center gap-1.5 p-1.5 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--row-hover)] transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-[var(--bg-surface)] text-[var(--text-primary)] text-[11px] font-bold flex items-center justify-center">
                    {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--text-dim)]" />
                </button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 mt-2 w-48 rounded-2xl bg-[var(--bg-surface-elev)] border border-[var(--border-subtle)] shadow-xl py-1.5 z-50 text-xs"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-3.5 py-2.5 border-b border-[var(--border-subtle)]">
                        <p className="font-semibold text-[var(--text-primary)] truncate">
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
                        className="w-full text-left px-3.5 py-2 hover:bg-rose-50/60 dark:hover:bg-rose-950/20 text-rose-600 flex items-center gap-2 cursor-pointer font-medium"
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

        {/* Page Main Content Container (max-w-1400px) */}
        <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
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



