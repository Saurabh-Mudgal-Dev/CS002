import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AppRoutes from "./routes/AppRoutes";
import { useInventory } from "./hooks/useInventory";
import { useDashboardStats } from "./hooks/useDashboardStats";
import { useToast } from "./hooks/useToast";
import { downloadCSVUrl } from "./api/client";

export default function App() {
  const navigate = useNavigate();
  const [contextMode, setContextMode] = useState("ngo");
  const [userRole, setUserRole] = useState("Manager");

  const { toast, showToast, closeToast } = useToast();
  const {
    inventory,
    addItem,
    editItem,
    removeItem,
    updateStock,
    lowStockCount,
    refreshInventory
  } = useInventory(contextMode);

  const { stats, backendStatus, refreshStats } = useDashboardStats(contextMode);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [adjustModalItem, setAdjustModalItem] = useState(null);
  const [editModalItem, setEditModalItem] = useState(null);
  const [deleteModalItem, setDeleteModalItem] = useState(null);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

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
    await refreshStats();
    showToast(`Created SKU '${created.sku}' successfully!`, "success");
    return created;
  };

  const handleEditItem = async (itemId, itemData) => {
    const updated = await editItem(itemId, itemData);
    await refreshStats();
    showToast(`Updated SKU '${updated.sku}' successfully!`, "success");
    return updated;
  };

  const handleDeleteItem = async (itemId) => {
    await removeItem(itemId);
    await refreshStats();
    showToast("Item deleted from catalog.", "success");
  };

  const handleAdjustStock = async (itemId, adjustPayload) => {
    const updated = await updateStock(itemId, adjustPayload);
    await refreshStats();
    const actionName =
      adjustPayload.adjustment_type === "RESTOCK"
        ? "Restocked (+"
        : contextMode === "ngo"
        ? "Aid Dispatched (-"
        : "Sale Recorded (-";
    showToast(`${actionName}${adjustPayload.quantity}) units of ${updated.name}`, "success");
    return updated;
  };

// function App() {
//   return (
//     <div>
//       <h1>ResourceOne</h1>
//     </div>
//   );
// }

// export default App;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AppRoutes from "./routes/AppRoutes";
import { useInventory } from "./hooks/useInventory";
import { useDashboardStats } from "./hooks/useDashboardStats";
import { useToast } from "./hooks/useToast";
import { downloadCSVUrl } from "./api/client";

export default function App() {
  const navigate = useNavigate();
  const [contextMode, setContextMode] = useState("ngo");
  const [userRole, setUserRole] = useState("Manager");

  const { toast, showToast, closeToast } = useToast();
  const {
    inventory,
    addItem,
    editItem,
    removeItem,
    updateStock,
    lowStockCount,
    refreshInventory
  } = useInventory(contextMode);

  const { stats, backendStatus, refreshStats } = useDashboardStats(contextMode);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [adjustModalItem, setAdjustModalItem] = useState(null);
  const [editModalItem, setEditModalItem] = useState(null);
  const [deleteModalItem, setDeleteModalItem] = useState(null);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

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
    await refreshStats();
    showToast(`Created SKU '${created.sku}' successfully!`, "success");
    return created;
  };

  const handleEditItem = async (itemId, itemData) => {
    const updated = await editItem(itemId, itemData);
    await refreshStats();
    showToast(`Updated SKU '${updated.sku}' successfully!`, "success");
    return updated;
  };

  const handleDeleteItem = async (itemId) => {
    await removeItem(itemId);
    await refreshStats();
    showToast("Item deleted from catalog.", "success");
  };

  const handleAdjustStock = async (itemId, adjustPayload) => {
    const updated = await updateStock(itemId, adjustPayload);
    await refreshStats();
    const actionName =
      adjustPayload.adjustment_type === "RESTOCK"
        ? "Restocked (+"
        : contextMode === "ngo"
        ? "Aid Dispatched (-"
        : "Sale Recorded (-";
    showToast(`${actionName}${adjustPayload.quantity}) units of ${updated.name}`, "success");
    return updated;
  };

  return (
    <MainLayout
      contextMode={contextMode}
      setContextMode={setContextMode}
      userRole={userRole}
      setUserRole={setUserRole}
      inventory={inventory}
      lowStockCount={lowStockCount}
      backendStatus={backendStatus}
      toast={toast}
      closeToast={closeToast}
      isAddModalOpen={isAddModalOpen}
      setIsAddModalOpen={setIsAddModalOpen}
      adjustModalItem={adjustModalItem}
      setAdjustModalItem={setAdjustModalItem}
      editModalItem={editModalItem}
      setEditModalItem={setEditModalItem}
      deleteModalItem={deleteModalItem}
      setDeleteModalItem={setDeleteModalItem}
      isAboutModalOpen={isAboutModalOpen}
      setIsAboutModalOpen={setIsAboutModalOpen}
      onAddItem={handleAddItem}
      onAdjustStock={handleAdjustStock}
      onEditItem={handleEditItem}
      onDeleteItem={handleDeleteItem}
      onViewAlerts={() => navigate("/inventory")}
    >
      <AppRoutes
        stats={stats}
        inventory={inventory}
        contextMode={contextMode}
        userRole={userRole}
        setUserRole={setUserRole}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenAdjustModal={(item) => setAdjustModalItem(item)}
        onOpenEditModal={(item) => setEditModalItem(item)}
        onOpenDeleteModal={(item) => setDeleteModalItem(item)}
        onExportCSV={handleExportCSV}
      />
    </MainLayout>
  );
}