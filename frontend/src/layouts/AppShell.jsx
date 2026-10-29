import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import { useTheme } from "../context/ThemeContext";
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
  Compass
} from "lucide-react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import AboutModal from "../components/AboutModal";
import Toast from "../components/ui/Toast";
import { getRoleBadgeVariant, PERMISSIONS } from "../lib/permissions";

export default function AppShell({ children, toast, closeToast }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, isAuthenticated, organization, logout, guestOrgType, setGuestOrgType, can } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const isNGO = organization?.type === "ngo";

  // Navigation Items per §10.5
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
      alwaysShow: false,
      visible: can(PERMISSIONS.VIEW_FINANCE),
      lockedForGuest: !isAuthenticated,
    },
    {
      path: "/audit",
      alias: ["/audit-log"],
      label: "Audit Ledger",
      icon: History,
      alwaysShow: false,
      visible: can(PERMISSIONS.VIEW_AUDIT),
      lockedForGuest: !isAuthenticated,
    },
    {
      path: "/settings",
      alias: [],
      label: "Settings",
      icon: Settings,
      alwaysShow: false,
      visible: can(PERMISSIONS.MANAGE_TEAM),
      lockedForGuest: !isAuthenticated,
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
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (232px) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[232px] bg-[var(--bg-surface-elev)] border-r border-[var(--border-subtle)] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border-subtle)]">
          <Link
            to="/overview"
            className="flex items-center gap-2.5 font-bold tracking-tight text-sm text-[var(--text-primary)]"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-8 h-8 rounded-lg bg-[#123A6B] text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
              R1
            </div>
            <div className="flex flex-col">
              <span className="leading-tight">ResourceOne</span>
              <span className="text-[10px] text-[var(--text-muted)] font-normal truncate max-w-[140px]">
                {organization?.name || "Inventory Platform"}
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 rounded-md text-[var(--text-dim)] hover:text-[var(--text-primary)] lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Organization / Context Indicator */}
        <div className="px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-primary)]">
              {isNGO ? (
                <HeartHandshake className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Store className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              )}
              <span className="truncate max-w-[120px] font-semibold">
                {isNGO ? "Community NGO" : "Retail Store"}
              </span>
            </div>
            <Badge variant={isNGO ? "success" : "info"} size="sm">
              {organization?.currency || "INR"}
            </Badge>
          </div>

          {/* Quick toggle for guest viewers to preview NGO vs Retail */}
          {!isAuthenticated && (
            <div className="mt-2 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px]">
              <span className="text-[var(--text-dim)]">Public Preview:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setGuestOrgType("ngo")}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    guestOrgType === "ngo"
                      ? "bg-[var(--accent)] text-white"
                      : "text-[var(--text-muted)] hover:bg-[var(--bg-surface-elev)]"
                  }`}
                >
                  NGO
                </button>
                <button
                  type="button"
                  onClick={() => setGuestOrgType("retail")}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    guestOrgType === "retail"
                      ? "bg-[var(--accent)] text-white"
                      : "text-[var(--text-muted)] hover:bg-[var(--bg-surface-elev)]"
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
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-[#123A6B] text-white shadow-xs"
                    : "text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.lockedForGuest && (
                  <span className="text-[10px] text-[var(--text-dim)] opacity-70">Auth</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Footer Panel */}
        <div className="p-3 border-t border-[var(--border-subtle)] space-y-2">
          {isAuthenticated ? (
            <div className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#123A6B] text-white text-xs font-bold flex items-center justify-center shrink-0">
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

              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setAboutOpen(true)}
                  className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1"
                >
                  <Info className="w-3.5 h-3.5" />
                  About
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-[11px] text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2.5">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-xs font-semibold text-[var(--text-primary)]">Public Guest View</span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] leading-tight">
                Viewing general inventory and operational metrics.
              </p>
              <Link to="/login" className="block">
                <Button variant="primary" size="sm" className="w-full justify-center">
                  <LogIn className="w-3.5 h-3.5 mr-1" />
                  Sign In
                </Button>
              </Link>
            </div>
          )}

          {/* Quick theme & about footer */}
          <div className="flex items-center justify-between px-1 text-[11px] text-[var(--text-dim)]">
            <button
              type="button"
              onClick={() => setAboutOpen(true)}
              className="hover:text-[var(--text-primary)]"
            >
              v1.0.0
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1 rounded-md hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]"
              title="Toggle color theme"
            >
              {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-[232px] min-w-0">
        {/* Topbar (64px) */}
        <header className="sticky top-0 z-30 h-16 bg-[var(--bg-surface-elev)] border-b border-[var(--border-subtle)] px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] lg:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-[var(--text-primary)] leading-tight">
                {organization?.name || "ResourceOne Platform"}
              </h1>
              <p className="text-[11px] text-[var(--text-muted)] hidden sm:block">
                {isNGO ? "Humanitarian Aid & Relief Operations" : "Small Retail Inventory Operations"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Status indicator */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live System</span>
            </div>

            {/* Role / Guest Badge */}
            <Badge variant={roleBadge.variant} size="sm">
              {roleBadge.label}
            </Badge>

            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
              title="Toggle Dark/Light Mode"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User action button */}
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
                  className="flex items-center gap-1.5 p-1.5 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-[#123A6B] text-white text-[11px] font-bold flex items-center justify-center">
                    {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--text-dim)]" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-xl bg-[var(--bg-surface-elev)] border border-[var(--border-subtle)] shadow-lg py-1.5 z-50 text-xs"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-[var(--border-subtle)]">
                      <p className="font-semibold text-[var(--text-primary)] truncate">
                        {user?.full_name}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] truncate">{user?.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAboutOpen(true)}
                      className="w-full text-left px-3 py-2 hover:bg-[var(--bg-surface)] flex items-center gap-2 text-[var(--text-secondary)]"
                    >
                      <Info className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      About ResourceOne
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
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
