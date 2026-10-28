# ResourceOne Demo Script

**Duration:** approximately 6 minutes  
**Audience:** project evaluator or teammate  
**Branch baseline:** current `sora` prototype

> This script intentionally demonstrates only features present in the current prototype. Do not present login, JWT/RBAC enforcement, finance pages, PDF reports, or organization-level data isolation as implemented.

## Before the demo

1. Start the backend from `backend` using the README instructions.
2. Start the frontend from `frontend`.
3. Open the Vite URL and verify the backend status indicates that the API is reachable.
4. Open `http://127.0.0.1:8000/docs` in a second tab for the API view.
5. Use disposable sample data. Do not call `POST /api/seed` unless you intend to reset inventory and activity records.

## Six-minute walkthrough

| Time | Action | Talking point |
|---|---|---|
| 0:00–0:40 | Introduce ResourceOne and switch between NGO and retail context in the UI. | One prototype supports two inventory contexts through a context tag/filter. This is not separate organization tenancy. |
| 0:40–1:30 | Show dashboard summary cards and the throughput/activity visualization. | The dashboard summarizes item count, low/critical stock, inventory valuation, and stock outflow. |
| 1:30–2:20 | Open Inventory; search by item name or SKU and filter by category/status. | The API supports search and filters; low-stock status is derived from quantity and reorder level. |
| 2:20–3:10 | Add a demo item. | Show validation and the unique SKU check. Explain that the backend persists the item when the API is online. |
| 3:10–4:00 | Adjust stock using RESTOCK, SALE, or RELIEF_DISTRIBUTION. | Stock changes update quantity/status and create an activity record. Over-issuing stock is rejected. |
| 4:00–4:45 | Open the audit/activity view and search/filter activity. | Entries show action type, item, quantity change, note, actor label, and timestamp. This is an activity log, not a tamper-proof audit system. |
| 4:45–5:25 | Download the inventory CSV. | The export includes SKU, item, category, context, quantity, reorder level, unit price, total valuation, and status. |
| 5:25–6:00 | Show `/docs` and `/api/health`; close with limitations and next steps. | The current prototype has an open API and no authentication. The roadmap adds JWT/RBAC, organization isolation, finance, migrations, and expanded reports. |

## Demo recovery

- If the backend is offline, stop and restart Uvicorn. The UI has in-memory fallback data, so avoid presenting fallback-mode changes as persisted.
- If an item cannot be created, check for a duplicate SKU.
- If stock adjustment fails, verify the requested quantity does not exceed stock and use one of the three supported adjustment types.
- If sample data must be restored, use `POST /api/seed` only when it is safe to clear inventory and activity-log rows.
