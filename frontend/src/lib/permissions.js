/**
 * RBAC Permission Matrix & Role Helpers
 * Strictly implements §8.2 permission matrix with guest viewer support.
 */

export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  ACCOUNTANT: "accountant",
  VOLUNTEER: "volunteer",
  GUEST: "guest",
};

export const PERMISSIONS = {
  // Public & Operational Views
  VIEW_DASHBOARD: "view:dashboard",
  VIEW_INVENTORY: "view:inventory",
  VIEW_ALERTS: "view:alerts",

  // Inventory Management
  CREATE_ITEM: "create:item",
  EDIT_ITEM: "edit:item",
  ARCHIVE_ITEM: "archive:item",

  // Stock Adjustments
  RECORD_RESTOCK: "record:restock",
  RECORD_SALE: "record:sale",
  RECORD_RELIEF: "record:relief",
  RECORD_ADJUSTMENT: "record:adjustment",

  // Financial & Commercial Operations
  RECORD_PURCHASE: "record:purchase",
  RECORD_DONATION: "record:donation",
  RECORD_EXPENSE: "record:expense",
  VIEW_FINANCE: "view:finance",

  // Reporting & Exports
  DOWNLOAD_INVENTORY_CSV: "download:inventory_csv",
  DOWNLOAD_PDF: "download:pdf",
  DOWNLOAD_FINANCE_CSV: "download:finance_csv",

  // Governance & Team Administration
  VIEW_AUDIT: "view:audit",
  MANAGE_TEAM: "manage:team",
};

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.VIEW_ALERTS,
    PERMISSIONS.CREATE_ITEM,
    PERMISSIONS.EDIT_ITEM,
    PERMISSIONS.ARCHIVE_ITEM,
    PERMISSIONS.RECORD_RESTOCK,
    PERMISSIONS.RECORD_SALE,
    PERMISSIONS.RECORD_RELIEF,
    PERMISSIONS.RECORD_ADJUSTMENT,
    PERMISSIONS.RECORD_PURCHASE,
    PERMISSIONS.RECORD_DONATION,
    PERMISSIONS.RECORD_EXPENSE,
    PERMISSIONS.VIEW_FINANCE,
    PERMISSIONS.DOWNLOAD_INVENTORY_CSV,
    PERMISSIONS.DOWNLOAD_PDF,
    PERMISSIONS.DOWNLOAD_FINANCE_CSV,
    PERMISSIONS.VIEW_AUDIT,
    PERMISSIONS.MANAGE_TEAM,
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.VIEW_ALERTS,
    PERMISSIONS.CREATE_ITEM,
    PERMISSIONS.EDIT_ITEM,
    PERMISSIONS.RECORD_RESTOCK,
    PERMISSIONS.RECORD_SALE,
    PERMISSIONS.RECORD_RELIEF,
    PERMISSIONS.RECORD_ADJUSTMENT,
    PERMISSIONS.RECORD_PURCHASE,
    PERMISSIONS.RECORD_DONATION,
    PERMISSIONS.VIEW_FINANCE,
    PERMISSIONS.DOWNLOAD_INVENTORY_CSV,
    PERMISSIONS.DOWNLOAD_PDF,
    PERMISSIONS.DOWNLOAD_FINANCE_CSV,
  ],
  [ROLES.ACCOUNTANT]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.VIEW_ALERTS,
    PERMISSIONS.RECORD_DONATION,
    PERMISSIONS.RECORD_EXPENSE,
    PERMISSIONS.VIEW_FINANCE,
    PERMISSIONS.DOWNLOAD_INVENTORY_CSV,
    PERMISSIONS.DOWNLOAD_PDF,
    PERMISSIONS.DOWNLOAD_FINANCE_CSV,
    PERMISSIONS.VIEW_AUDIT,
  ],
  [ROLES.VOLUNTEER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.VIEW_ALERTS,
    PERMISSIONS.RECORD_RESTOCK,
    PERMISSIONS.RECORD_RELIEF,
    PERMISSIONS.RECORD_DONATION, // Goods donation only
    PERMISSIONS.DOWNLOAD_INVENTORY_CSV,
    PERMISSIONS.DOWNLOAD_PDF,
  ],
  [ROLES.GUEST]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.VIEW_ALERTS,
    PERMISSIONS.DOWNLOAD_INVENTORY_CSV,
    PERMISSIONS.DOWNLOAD_PDF,
  ],
};

/**
 * Normalizes role string to canonical role enum
 */
export function normalizeRole(role) {
  if (!role) return ROLES.GUEST;
  const lower = String(role).trim().toLowerCase();
  if (lower.includes("admin")) return ROLES.ADMIN;
  if (lower.includes("manager")) return ROLES.MANAGER;
  if (lower.includes("account")) return ROLES.ACCOUNTANT;
  if (lower.includes("volunteer")) return ROLES.VOLUNTEER;
  return ROLES.GUEST;
}

/**
 * Checks whether a given role has permission to execute an action
 */
export function can(role, permission) {
  const norm = normalizeRole(role);
  const permissions = ROLE_PERMISSIONS[norm] || ROLE_PERMISSIONS[ROLES.GUEST];
  return permissions.includes(permission);
}

/**
 * Returns human-readable role badge title
 */
export function getRoleLabel(role) {
  const norm = normalizeRole(role);
  switch (norm) {
    case ROLES.ADMIN:
      return "Administrator";
    case ROLES.MANAGER:
      return "Inventory Manager";
    case ROLES.ACCOUNTANT:
      return "Accountant";
    case ROLES.VOLUNTEER:
      return "Field Volunteer";
    default:
      return "Guest Viewer";
  }
}

/**
 * Returns badge styling attributes
 */
export function getRoleBadgeVariant(role) {
  const norm = normalizeRole(role);
  switch (norm) {
    case ROLES.ADMIN:
      return { variant: "primary", label: "Admin" };
    case ROLES.MANAGER:
      return { variant: "info", label: "Manager" };
    case ROLES.ACCOUNTANT:
      return { variant: "success", label: "Accountant" };
    case ROLES.VOLUNTEER:
      return { variant: "warning", label: "Volunteer" };
    default:
      return { variant: "neutral", label: "Guest View" };
  }
}

