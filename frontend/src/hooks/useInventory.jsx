import { useState, useEffect, useCallback, useMemo } from "react";
import { getInventory, createItem, updateItem, deleteItem, adjustStock } from "../api/client";

export function useInventory(contextMode) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getInventory({ context: contextMode });
      setInventory(data);
      setError(null);
    } catch (err) {
      console.error("Failed to load inventory:", err);
      setError(err.message || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, [contextMode]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = useCallback(async (itemData) => {
    const newItem = await createItem(itemData);
    await fetchItems();
    return newItem;
  }, [fetchItems]);

  const editItem = useCallback(async (itemId, itemData) => {
    const updated = await updateItem(itemId, itemData);
    await fetchItems();
    return updated;
  }, [fetchItems]);

  const removeItem = useCallback(async (itemId) => {
    const res = await deleteItem(itemId);
    await fetchItems();
    return res;
  }, [fetchItems]);

  const updateStock = useCallback(async (itemId, adjustPayload) => {
    const updatedItem = await adjustStock(itemId, adjustPayload);
    await fetchItems();
    return updatedItem;
  }, [fetchItems]);

  const lowStockItems = useMemo(() => {
    return inventory.filter((i) => i.quantity <= i.reorder_level);
  }, [inventory]);

  return {
    inventory,
    loading,
    error,
    refreshInventory: fetchItems,
    addItem,
    editItem,
    removeItem,
    updateStock,
    lowStockItems,
    lowStockCount: lowStockItems.length
  };
}

