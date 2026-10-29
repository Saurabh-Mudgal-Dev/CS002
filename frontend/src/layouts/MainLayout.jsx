import React from "react";
import { Link, useLocation } from "react-router-dom";
import Topbar from "../components/layout/Topbar";
import Toast from "../components/ui/Toast";
import AddItemModal from "../components/inventory/AddItemModal";
import AdjustStockModal from "../components/inventory/AdjustStockModal";
import EditItemModal from "../components/inventory/EditItemModal";
import DeleteItemModal from "../components/inventory/DeleteItemModal";
import AboutModal from "../components/AboutModal";
import {
  TrendingUp,
  Package,
  History,
  HeartHandshake,
  Store
} from "lucide-react";

export default function MainLayout({
  children,
  contextMode,
  setContextMode,
  userRole,
  setUserRole,
  inventory,
  lowStockCount,
  backendStatus,
  toast,
  closeToast,
  isAddModalOpen,
  setIsAddModalOpen,
  adjustModalItem,
  setAdjustModalItem,
  editModalItem,
  setEditModalItem,
  deleteModalItem,
  setDeleteModalItem,
  isAboutModalOpen,
  setIsAboutModalOpen,
  onAddItem,
  onAdjustStock,
  onEditItem,
  onDeleteItem,
  onViewAlerts
}) {
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Overview", icon: Package },
    { path: "/inventory", label: `Catalog (${inventory.length})`, icon: Package },
    { path: "/audit-log", label: "Audit Ledger", icon: History }
  ];

  return (
    <div
      className="min-h-screen flex flex-col font-sans transition-colors duration-200"
      style={{ background: "var(--bg-primary)", color: "var(--text-secondary)" }}
    >
      <Topbar
        contextMode={contextMode}
        setContextMode={setContextMode}
        userRole={userRole}
        setUserRole={setUserRole}
        lowStockCount={lowStockCount}
        backendStatus={backendStatus}
        onOpenAbout={() => setIsAboutModalOpen(true)}
        onViewAlerts={onViewAlerts}
      />

      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Navigation bar with motion layout indicator */}
        <div
          className="flex items-center justify-between border-b pb-3"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <nav className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (location.pathname === "/" && item.path === "/dashboard");

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[var(--accent)] text-white"
                      : "hover:bg-[var(--bg-surface)]"
                  }`}
                  style={!isActive ? { color: "var(--text-muted)" } : {}}
                >
                  <Icon className="w-4 h-4 relative z-10 shrink-0" />
                  <span className="relative z-10 whitespace-nowrap">{item.label}</span>


                </Link>
              );
            })}
          </nav>

          {/* Mode badge */}
          <div
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border shadow-sm"
            style={{
              background: "var(--bg-input)",
              borderColor: "var(--border-subtle)",
              color: "var(--text-secondary)"
            }}
          >
            {contextMode === "ngo" ? (
              <>
                <HeartHandshake className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
                <span>NGO Mode</span>
              </>
            ) : (
              <>
                <Store className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
                <span>Business Mode</span>
              </>
            )}
          </div>
        </div>

        {/* Page Content */}
        {children}
      </main>

      {/* Footer */}
      <footer
        className="relative z-10 w-full border-t py-4 px-4 sm:px-6 text-center text-xs transition-colors"
        style={{
          borderColor: "var(--border-subtle)",
          background: "var(--bg-card)",
          color: "var(--text-muted)"
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 font-semibold">
          <span>ResourceOne Â· Smart Inventory & Resource Operations Platform</span>
          <span style={{ color: "var(--text-dim)" }}>
            Enterprise Edition Â· Dual Operational NGO & Retail Architecture
          </span>
        </div>
      </footer>

      {/* Modals */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={onAddItem}
        contextMode={contextMode}
      />

      <AdjustStockModal
        isOpen={!!adjustModalItem}
        item={adjustModalItem}
        onClose={() => setAdjustModalItem(null)}
        onAdjust={onAdjustStock}
        contextMode={contextMode}
      />

      <EditItemModal
        isOpen={!!editModalItem}
        item={editModalItem}
        onClose={() => setEditModalItem(null)}
        onSave={onEditItem}
        contextMode={contextMode}
      />

      <DeleteItemModal
        isOpen={!!deleteModalItem}
        item={deleteModalItem}
        onClose={() => setDeleteModalItem(null)}
        onConfirm={onDeleteItem}
      />

      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}

