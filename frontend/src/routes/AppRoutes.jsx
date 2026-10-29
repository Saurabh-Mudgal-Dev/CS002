import { Routes, Route, Navigate } from "react-router-dom";
import OverviewPage from "../pages/OverviewPage";
import InventoryPage from "../pages/InventoryPage";
import FinancePage from "../pages/FinancePage";
import AuditLogPage from "../pages/AuditLogPage";
import SettingsPage from "../pages/SettingsPage";
import LoginPage from "../features/auth/LoginPage";
import DesignPage from "../pages/DesignPage";

export default function AppRoutes({
  inventory,
  contextMode,
  userRole,
  onOpenAddModal,
  onOpenAdjustModal,
  onOpenEditModal,
  onOpenDeleteModal,
  onExportCSV,
  showToast,
}) {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/overview" replace />} />
      <Route path="/dashboard" element={<Navigate to="/overview" replace />} />
      <Route
        path="/overview"
        element={<OverviewPage showToast={showToast} />}
      />
      <Route
        path="/inventory"
        element={
          <InventoryPage
            inventory={inventory}
            contextMode={contextMode}
            userRole={userRole}
            onOpenAddModal={onOpenAddModal}
            onOpenAdjustModal={onOpenAdjustModal}
            onOpenEditModal={onOpenEditModal}
            onOpenDeleteModal={onOpenDeleteModal}
            onExportCSV={onExportCSV}
          />
        }
      />
      <Route
        path="/finance"
        element={<FinancePage showToast={showToast} />}
      />
      <Route
        path="/audit"
        element={
          <AuditLogPage
            contextMode={contextMode}
            userRole={userRole}
            onExportCSV={onExportCSV}
          />
        }
      />
      <Route
        path="/audit-log"
        element={<Navigate to="/audit" replace />}
      />
      <Route
        path="/settings"
        element={<SettingsPage showToast={showToast} />}
      />
      <Route path="/login" element={<LoginPage />} />
      {import.meta.env.DEV && (
        <Route path="/design" element={<DesignPage />} />
      )}
      <Route path="*" element={<Navigate to="/overview" replace />} />
    </Routes>
  );
}
