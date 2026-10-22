const API_BASE = "http://127.0.0.1:8000/api";

// Fallback seed data in case API server is unreachable
let localInventory = [
  { id: 1, name: "Paracetamol 500mg Tablets (Box of 100)", sku: "MED-PARA-500", category: "Medical Relief", context_tag: "ngo", quantity: 8, reorder_level: 20, unit_price: 12.50, status: "Low Stock", created_at: new Date().toISOString() },
  { id: 2, name: "Sterile Gauze & Bandage Rolls (Pack of 20)", sku: "MED-GAUZ-020", category: "Medical Relief", context_tag: "ngo", quantity: 14, reorder_level: 25, unit_price: 18.00, status: "Low Stock", created_at: new Date().toISOString() },
  { id: 3, name: "Water Purification Chlorine Tablets (1000 Tabs)", sku: "SAN-WTR-1000", category: "Sanitation & Water", context_tag: "ngo", quantity: 42, reorder_level: 15, unit_price: 32.00, status: "In Stock", created_at: new Date().toISOString() },
  { id: 4, name: "Emergency Thermal Foil Blankets (Pack of 10)", sku: "LOG-BLNK-010", category: "Disaster Logistics", context_tag: "ngo", quantity: 6, reorder_level: 15, unit_price: 24.00, status: "Low Stock", created_at: new Date().toISOString() },
  { id: 5, name: "Oral Rehydration Salts (ORS) Sachets (Pack of 50)", sku: "MED-ORS-050", category: "Medical Relief", context_tag: "ngo", quantity: 75, reorder_level: 30, unit_price: 9.50, status: "In Stock", created_at: new Date().toISOString() },
  { id: 6, name: "Fortified Wheat Flour 25kg Sack", sku: "FOD-WHT-025", category: "Emergency Rations", context_tag: "ngo", quantity: 38, reorder_level: 20, unit_price: 28.00, status: "In Stock", created_at: new Date().toISOString() },
  { id: 7, name: "Infant Nutritional Milk Formula 500g", sku: "FOD-INF-500", category: "Emergency Rations", context_tag: "ngo", quantity: 0, reorder_level: 15, unit_price: 16.00, status: "Critical", created_at: new Date().toISOString() },
  { id: 8, name: "Refined Sunflower Cooking Oil 1L Pouch", sku: "RTL-OIL-001", category: "Grocery & Staples", context_tag: "retail", quantity: 55, reorder_level: 20, unit_price: 3.80, status: "In Stock", created_at: new Date().toISOString() },
  { id: 9, name: "Premium Traditional Basmati Rice 5kg Bag", sku: "RTL-RCE-005", category: "Grocery & Staples", context_tag: "retail", quantity: 9, reorder_level: 15, unit_price: 11.50, status: "Low Stock", created_at: new Date().toISOString() },
  { id: 10, name: "Instant Hand Sanitizer 500ml Pump Bottle", sku: "RTL-SNT-500", category: "Daily Essentials", context_tag: "retail", quantity: 34, reorder_level: 15, unit_price: 4.50, status: "In Stock", created_at: new Date().toISOString() },
  { id: 11, name: "Warm White LED Bulb 9W (Pack of 4)", sku: "RTL-LEDB-009", category: "Hardware & Electric", context_tag: "retail", quantity: 18, reorder_level: 10, unit_price: 8.00, status: "In Stock", created_at: new Date().toISOString() },
  { id: 12, name: "Heavy-Duty AA Alkaline Batteries (Pack of 10)", sku: "RTL-BATT-010", category: "Hardware & Electric", context_tag: "retail", quantity: 4, reorder_level: 10, unit_price: 6.50, status: "Low Stock", created_at: new Date().toISOString() }
];

let localLogs = [
  { id: 1, action_type: "RESTOCK", item_name: "Paracetamol 500mg Tablets (Box of 100)", quantity_change: 50, note: "District Health Donation", performed_by: "Manager", timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: 2, action_type: "RELIEF_DISTRIBUTION", item_name: "Emergency Thermal Foil Blankets (Pack of 10)", quantity_change: -10, note: "Dispatched to Sector 4 Night Shelter", performed_by: "Volunteer", timestamp: new Date(Date.now() - 43200000).toISOString() },
  { id: 3, action_type: "SALE", item_name: "Refined Sunflower Cooking Oil 1L Pouch", quantity_change: -5, note: "Walk-in Customer Order #1042", performed_by: "Manager", timestamp: new Date(Date.now() - 14400000).toISOString() }
];

let backendActive = false;

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      backendActive = true;
      return await res.json();
    }
  } catch {
    backendActive = false;
  }
  return { status: "offline", version: "1.0.0", database: "local-memory", total_items: localInventory.length };
}

export function isBackendOnline() {
  return backendActive;
}

export async function getInventory(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.category && params.category !== "All") query.set("category", params.category);
  if (params.context && params.context !== "all") query.set("context", params.context);
  if (params.status && params.status !== "All") query.set("status", params.status);

  try {
    const res = await fetch(`${API_BASE}/inventory?${query.toString()}`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      backendActive = true;
      return await res.json();
    }
  } catch {
    backendActive = false;
  }

  // Fallback local memory filter
  let list = [...localInventory];
  if (params.context && params.context !== "all") {
    list = list.filter(i => i.context_tag === params.context || i.context_tag === "general");
  }
  if (params.category && params.category !== "All") {
    list = list.filter(i => i.category === params.category);
  }
  if (params.status && params.status !== "All") {
    list = list.filter(i => i.status === params.status);
  }
  if (params.search) {
    const s = params.search.toLowerCase();
    list = list.filter(i => i.name.toLowerCase().includes(s) || i.sku.toLowerCase().includes(s));
  }
  return list;
}

export async function createItem(itemData) {
  try {
    const res = await fetch(`${API_BASE}/inventory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemData),
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      backendActive = true;
      return await res.json();
    }
    const err = await res.json();
    throw new Error(err.detail || "Failed to create item");
  } catch (error) {
    if (backendActive) throw error;
    // Local fallback
    const newItem = {
      id: Date.now(),
      ...itemData,
      status: itemData.quantity <= 0 ? "Critical" : itemData.quantity <= itemData.reorder_level ? "Low Stock" : "In Stock",
      created_at: new Date().toISOString()
    };
    localInventory.unshift(newItem);
    localLogs.unshift({
      id: Date.now(),
      action_type: "ITEM_CREATED",
      item_name: newItem.name,
      quantity_change: newItem.quantity,
      note: `New SKU in ${newItem.category}`,
      performed_by: "Manager",
      timestamp: new Date().toISOString()
    });
    return newItem;
  }
}

export async function adjustStock(itemId, { adjustment_type, quantity, note, performed_by }) {
  try {
    const res = await fetch(`${API_BASE}/inventory/${itemId}/adjust`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adjustment_type, quantity, note, performed_by }),
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      backendActive = true;
      return await res.json();
    }
    const err = await res.json();
    throw new Error(err.detail || "Failed to adjust stock");
  } catch (error) {
    if (backendActive) throw error;
    // Local fallback
    const item = localInventory.find(i => i.id === itemId);
    if (!item) throw new Error("Item not found");
    const delta = adjustment_type === "RESTOCK" ? quantity : -quantity;
    if (delta < 0 && item.quantity < Math.abs(delta)) {
      throw new Error(`Insufficient stock! Available: ${item.quantity}`);
    }
    item.quantity += delta;
    item.status = item.quantity <= 0 ? "Critical" : item.quantity <= item.reorder_level ? "Low Stock" : "In Stock";

    localLogs.unshift({
      id: Date.now(),
      action_type: adjustment_type,
      item_name: item.name,
      quantity_change: delta,
      note: note || adjustment_type,
      performed_by: performed_by || "Manager",
      timestamp: new Date().toISOString()
    });
    return item;
  }
}

export async function getDashboardStats(context = "all") {
  try {
    const res = await fetch(`${API_BASE}/dashboard/stats?context=${context}`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      backendActive = true;
      return await res.json();
    }
  } catch {
    backendActive = false;
  }

  // Local fallback calculation
  let items = localInventory;
  if (context && context !== "all") {
    items = items.filter(i => i.context_tag === context || i.context_tag === "general");
  }
  const total_items = items.length;
  const low_stock_count = items.filter(i => i.quantity > 0 && i.quantity <= i.reorder_level).length;
  const critical_count = items.filter(i => i.quantity <= 0).length;
  const total_valuation = items.reduce((acc, i) => acc + (i.quantity * i.unit_price), 0);

  return {
    total_items,
    low_stock_count,
    critical_count,
    total_valuation: Math.round(total_valuation * 100) / 100,
    total_outflow_today: 48,
    recent_activities: localLogs.slice(0, 8),
    throughput_curve: [
      { day: "Mon", intake: 25, outflow: 14 },
      { day: "Tue", intake: 40, outflow: 28 },
      { day: "Wed", intake: 15, outflow: 32 },
      { day: "Thu", intake: 50, outflow: 22 },
      { day: "Fri", intake: 35, outflow: 45 },
      { day: "Sat", intake: 60, outflow: 38 },
      { day: "Sun", intake: 20, outflow: 18 }
    ]
  };
}

export async function updateItem(itemId, itemData) {
  try {
    const res = await fetch(`${API_BASE}/inventory/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemData),
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      backendActive = true;
      return await res.json();
    }
    const err = await res.json();
    throw new Error(err.detail || "Failed to update item");
  } catch (error) {
    if (backendActive) throw error;
    // Local fallback
    const index = localInventory.findIndex(i => i.id === itemId);
    if (index === -1) throw new Error("Item not found");
    localInventory[index] = {
      ...localInventory[index],
      ...itemData,
      status: (itemData.quantity ?? localInventory[index].quantity) <= 0
        ? "Critical"
        : (itemData.quantity ?? localInventory[index].quantity) <= (itemData.reorder_level ?? localInventory[index].reorder_level)
        ? "Low Stock"
        : "In Stock"
    };
    localLogs.unshift({
      id: Date.now(),
      action_type: "ITEM_UPDATED",
      item_name: localInventory[index].name,
      quantity_change: 0,
      note: `Updated properties for SKU ${localInventory[index].sku}`,
      performed_by: "Manager",
      timestamp: new Date().toISOString()
    });
    return localInventory[index];
  }
}

export async function deleteItem(itemId) {
  try {
    const res = await fetch(`${API_BASE}/inventory/${itemId}`, {
      method: "DELETE",
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      backendActive = true;
      return await res.json();
    }
    const err = await res.json();
    throw new Error(err.detail || "Failed to delete item");
  } catch (error) {
    if (backendActive) throw error;
    // Local fallback
    const item = localInventory.find(i => i.id === itemId);
    if (!item) throw new Error("Item not found");
    localInventory = localInventory.filter(i => i.id !== itemId);
    localLogs.unshift({
      id: Date.now(),
      action_type: "ITEM_DELETED",
      item_name: item.name,
      quantity_change: -item.quantity,
      note: `Deleted SKU ${item.sku} from catalog`,
      performed_by: "Admin",
      timestamp: new Date().toISOString()
    });
    return { message: `Item '${item.name}' deleted successfully.` };
  }
}

export async function getActivityLogs(params = {}) {
  const query = new URLSearchParams();
  if (params.action_type && params.action_type !== "All") query.set("action_type", params.action_type);
  if (params.search) query.set("search", params.search);
  if (params.limit) query.set("limit", params.limit);
  if (params.offset) query.set("offset", params.offset);

  try {
    const res = await fetch(`${API_BASE}/activities?${query.toString()}`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      backendActive = true;
      return await res.json();
    }
  } catch {
    backendActive = false;
  }

  // Local fallback
  let list = [...localLogs];
  if (params.action_type && params.action_type !== "All") {
    list = list.filter(l => l.action_type === params.action_type.toUpperCase());
  }
  if (params.search) {
    const s = params.search.toLowerCase();
    list = list.filter(l => l.item_name.toLowerCase().includes(s) || (l.note && l.note.toLowerCase().includes(s)));
  }
  return {
    total: list.length,
    items: list
  };
}

export function downloadCSVUrl(context = "all") {
  return `${API_BASE}/export/csv?context=${context}`;
}
