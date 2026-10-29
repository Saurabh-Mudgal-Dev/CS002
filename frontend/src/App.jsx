import { useState } from "react";
import { useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./features/auth";
import AppShell from "./layouts/AppShell";
import AppRoutes from "./routes/AppRoutes";
import LoginPage from "./features/auth/LoginPage";
import { useInventory } from "./hooks/useInventory";
import { useToast } from "./hooks/useToast";
import { downloadCSVUrl } from "./api/client";
import AddItemModal from "./components/inventory/AddItemModal";
import AdjustStockModal from "./components/inventory/AdjustStockModal";
import EditItemModal from "./components/inventory/EditItemModal";
import DeleteItemModal from "./components/inventory/DeleteItemModal";

function AppContent() {
  const location = useLocation();
  const { user, organization, guestOrgType, isAuthenticated } = useAuth();
  const contextMode = isAuthenticated ? organization?.type || "ngo" : guestOrgType || "ngo";
  const userRole = isAuthenticated ? user?.role || "Admin" : "Guest";

  const { toast, showToast, closeToast } = useToast();

  const {
    inventory,
    addItem,
    editItem,
    removeItem,
    updateStock,
    refreshInventory,
  } = useInventory(contextMode);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [adjustModalItem, setAdjustModalItem] = useState(null);
  const [editModalItem, setEditModalItem] = useState(null);
  const [deleteModalItem, setDeleteModalItem] = useState(null);

  const handleExportCSV = () => {
    const url = downloadCSVUrl(contextMode);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ResourceOne_${contextMode.toUpperCase()}_Inventory.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Inventory CSV audit sheet downloaded!", "success");
  };

  const handleAddItem = async (newItemData) => {
    const created = await addItem(newItemData);
    await refreshInventory();
    showToast(`Created SKU '${created.sku}' successfully!`, "success");
    return created;
  };

  const handleEditItem = async (itemId, itemData) => {
    const updated = await editItem(itemId, itemData);
    await refreshInventory();
    showToast(`Updated SKU '${updated.sku}' successfully!`, "success");
    return updated;
  };

  const handleDeleteItem = async (itemId) => {
    await removeItem(itemId);
    await refreshInventory();
    showToast("Item deleted from catalog.", "success");
  };

  const handleAdjustStock = async (itemId, adjustPayload) => {
    const updated = await updateStock(itemId, adjustPayload);
    await refreshInventory();
    const actionName =
      adjustPayload.adjustment_type === "RESTOCK"
        ? "Restocked (+"
        : contextMode === "ngo"
        ? "Aid Dispatched (-"
        : "Sale Recorded (-";
    showToast(`${actionName}${adjustPayload.quantity}) units of ${updated.name}`, "success");
    return updated;
  };

  // If on login route, render LoginPage without AppShell
  if (location.pathname === "/login") {
    return <LoginPage />;
  }

  return (
    <AppShell toast={toast} closeToast={closeToast}>
      <AppRoutes
        inventory={inventory}
        contextMode={contextMode}
        userRole={userRole}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenAdjustModal={(item) => setAdjustModalItem(item)}
        onOpenEditModal={(item) => setEditModalItem(item)}
        onOpenDeleteModal={(item) => setDeleteModalItem(item)}
        onExportCSV={handleExportCSV}
        showToast={showToast}
      />

      {/* Inventory Action Modals */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddItem}
        contextMode={contextMode}
      />

      <AdjustStockModal
        isOpen={Boolean(adjustModalItem)}
        item={adjustModalItem}
        onClose={() => setAdjustModalItem(null)}
        onAdjust={(payload) => handleAdjustStock(adjustModalItem.id, payload)}
        contextMode={contextMode}
      />

      <EditItemModal
        isOpen={Boolean(editModalItem)}
        item={editModalItem}
        onClose={() => setEditModalItem(null)}
        onSave={(data) => handleEditItem(editModalItem.id, data)}
        contextMode={contextMode}
      />

      <DeleteItemModal
        isOpen={Boolean(deleteModalItem)}
        item={deleteModalItem}
        onClose={() => setDeleteModalItem(null)}
        onConfirm={handleDeleteItem}
      />
    </AppShell>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
