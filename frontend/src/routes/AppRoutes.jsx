import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "../pages/DashboardPage";
import InventoryPage from "../pages/InventoryPage";
import AuditLogPage from "../pages/AuditLogPage";
import DesignPage from "../pages/DesignPage";

export default function AppRoutes({
  stats,
  inventory,
  contextMode,
  userRole,
  setUserRole,
  onOpenAddModal,
  onOpenAdjustModal,
  onOpenEditModal,
  onOpenDeleteModal,
  onExportCSV
}) {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />
      <Route
        path="/dashboard"
        element={
          <DashboardPage
            stats={stats}
            inventory={inventory}
            contextMode={contextMode}
            userRole={userRole}
            onOpenAddModal={onOpenAddModal}
            onOpenAdjustModal={onOpenAdjustModal}
            onExportCSV={onExportCSV}
          />
        }
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
        path="/audit-log"
        element={
          <AuditLogPage
            contextMode={contextMode}
            userRole={userRole}
            onExportCSV={onExportCSV}
          />
        }
      />
      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />
      {import.meta.env.DEV && (
        <Route path="/design" element={<DesignPage />} />
      )}
    </Routes>
  );
}

