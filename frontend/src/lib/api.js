/**
 * ResourceOne HTTP Client
 * Uses native fetch with credentials: "include" for 8-hour httpOnly cookies.
 * Handles error normalization, token sessions, and blob streaming.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1";
const LEGACY_BASE = "http://127.0.0.1:8000/api";

class ApiError extends Error {
  constructor(message, status = 500, code = "API_ERROR", details = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
    credentials: "include", // Sends ro_session cookie
  };

  if (options.body && typeof options.body === "object" && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  let res;
  try {
    res = await fetch(url, config);
  } catch (err) {
    throw new ApiError(
      "Unable to reach the server. Please verify the backend is running.",
      0,
      "NETWORK_ERROR",
      err
    );
  }

  if (res.status === 204) {
    return null;
  }

  let data;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const errorMsg =
      (typeof data === "object" && data !== null && (data.detail || data.error?.message || data.message)) ||
      res.statusText ||
      `Request failed with status ${res.status}`;
    throw new ApiError(errorMsg, res.status, data?.error?.code || `HTTP_${res.status}`, data);
  }

  return data;
}

/**
 * Downloads a file as a blob with an authenticated request and triggers browser download
 */
async function downloadBlob(path, defaultFilename) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  let res;
  try {
    res = await fetch(url, {
      method: "GET",
      credentials: "include",
    });
  } catch (err) {
    throw new ApiError("Failed to initiate file download.", 0, "NETWORK_ERROR", err);
  }

  if (!res.ok) {
    let errMsg = "Download failed";
    try {
      const errJson = await res.json();
      errMsg = errJson.detail || errJson.message || errMsg;
    } catch {
      errMsg = `Download failed with HTTP ${res.status}`;
    }
    throw new ApiError(errMsg, res.status);
  }

  const blob = await res.blob();
  const disposition = res.headers.get("content-disposition") || "";
  let filename = defaultFilename;
  const filenameMatch = disposition.match(/filename="?([^";]+)"?/);
  if (filenameMatch && filenameMatch[1]) {
    filename = filenameMatch[1];
  }

  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(blobUrl);

  return filename;
}

export const api = {
  // Auth API
  auth: {
    async login(email, password) {
      return request("/auth/login", {
        method: "POST",
        body: { email, password },
      });
    },

    async logout() {
      try {
        return await request("/auth/logout", { method: "POST" });
      } catch (e) {
        console.warn("Logout error:", e);
        return { message: "Logged out" };
      }
    },

    async getMe() {
      return request("/auth/me", { method: "GET" });
    },
  },

  // Dashboard & Overview
  dashboard: {
    async getSummary() {
      try {
        return await request("/dashboard/summary");
      } catch (err) {
        // Fallback to legacy endpoint if /api/v1/dashboard/summary is unreachable
        if (err.status === 404 || err.status === 0) {
          try {
            const legacyStats = await request(`${LEGACY_BASE}/dashboard/stats`);
            return {
              organization: { name: "ResourceOne Platform", org_type: "ngo", currency: "INR" },
              viewer: { is_authenticated: false, role: "guest", name: "Guest" },
              kpis: {
                total_items: legacyStats.total_items || 0,
                low_stock_count: legacyStats.low_stock_count || 0,
                critical_count: legacyStats.critical_count || 0,
                expiring_soon_count: 0,
                total_valuation: legacyStats.total_valuation || 0,
                net_position: null,
              },
              throughput_curve: legacyStats.throughput_curve || [],
              alerts: [],
              recent_movements: legacyStats.recent_activities || [],
              finance: null,
            };
          } catch {
            throw err;
          }
        }
        throw err;
      }
    },
  },

  // Reports & Exports
  reports: {
    async downloadInventoryCsv() {
      return downloadBlob("/reports/inventory.csv", "ResourceOne_Inventory_Report.csv");
    },

    async downloadFinanceCsv() {
      return downloadBlob("/reports/finance.csv", "ResourceOne_Finance_Report.csv");
    },

    async downloadPdf() {
      return downloadBlob("/reports/report.pdf", "ResourceOne_Operations_Report.pdf");
    },
  },

  // Inventory Catalog
  inventory: {
    async list(params = {}) {
      const query = new URLSearchParams();
      if (params.search) query.set("search", params.search);
      if (params.category && params.category !== "All") query.set("category", params.category);
      if (params.status && params.status !== "All") query.set("status", params.status);

      return request(`${LEGACY_BASE}/inventory?${query.toString()}`);
    },

    async get(id) {
      return request(`${LEGACY_BASE}/inventory/${id}`);
    },

    async create(data) {
      return request(`${LEGACY_BASE}/inventory`, {
        method: "POST",
        body: data,
      });
    },

    async update(id, data) {
      return request(`${LEGACY_BASE}/inventory/${id}`, {
        method: "PUT",
        body: data,
      });
    },

    async adjustStock(id, payload) {
      return request(`${LEGACY_BASE}/inventory/${id}/adjust`, {
        method: "POST",
        body: payload,
      });
    },

    async archive(id) {
      return request(`${LEGACY_BASE}/inventory/${id}`, {
        method: "DELETE",
      });
    },
  },

  // Activities & Movements
  activities: {
    async list(params = {}) {
      const query = new URLSearchParams();
      if (params.action_type && params.action_type !== "All") query.set("action_type", params.action_type);
      if (params.search) query.set("search", params.search);
      if (params.limit) query.set("limit", params.limit);
      if (params.offset) query.set("offset", params.offset);

      return request(`${LEGACY_BASE}/activities?${query.toString()}`);
    },
  },

  // System & Health
  system: {
    async checkHealth() {
      try {
        return await request(`${LEGACY_BASE}/health`);
      } catch {
        return { status: "offline", database: "disconnected", total_items: 0 };
      }
    },
  },
};

export { ApiError };

