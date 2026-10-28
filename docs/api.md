# ResourceOne API Reference (current prototype)

Base URL: `http://127.0.0.1:8000`

Interactive OpenAPI docs: `http://127.0.0.1:8000/docs`

All endpoints are currently unauthenticated. There is no JWT login endpoint or server-side role enforcement in this branch. Do not expose the API publicly.

## Routes

| Method | Path | Purpose | Query/body |
|---|---|---|---|
| `GET` | `/api/health` | Health/version/database/item-count summary | None |
| `GET` | `/api/users` | List seeded user records | None |
| `GET` | `/api/inventory` | List inventory items | Optional `search`, `category`, `context`, `status` |
| `GET` | `/api/inventory/low-stock` | Items at or below their reorder level | None |
| `GET` | `/api/inventory/{item_id}` | Get one item | Path `item_id` |
| `POST` | `/api/inventory` | Create an inventory item | `ItemCreate` JSON |
| `PUT` | `/api/inventory/{item_id}` | Update item fields | `ItemUpdate` JSON |
| `POST` | `/api/inventory/{item_id}/adjust` | Restock, sale, or relief distribution | `StockAdjustRequest` JSON |
| `DELETE` | `/api/inventory/{item_id}` | Delete item and record an activity | Path `item_id` |
| `GET` | `/api/activities` | List activity records | Optional `action_type`, `search`, `limit` (1–200, default 50), `offset` (default 0) |
| `GET` | `/api/dashboard/stats` | Dashboard metrics and recent activity | Optional `context` |
| `GET` | `/api/export/csv` | Download inventory CSV | Optional `context` |
| `POST` | `/api/seed` | Clear inventory/activity rows and reseed sample data | No body |

For `context`, the intended values are `ngo`, `retail`, or `all`. Inventory listing also supports a `category` and `status` filter. Search matches item name or SKU.

## Schemas

### Create item

```json
{
  "name": "Emergency blankets",
  "sku": "LOG-BLNK-020",
  "category": "Disaster Logistics",
  "context_tag": "ngo",
  "quantity": 20,
  "reorder_level": 5,
  "unit_price": 24.0
}
```

Constraints include name length 2–200, SKU length 2–50, category length 2–100, quantity >= 0, reorder level >= 1, and unit price >= 0. Duplicate SKUs return HTTP 400.

### Adjust stock

```json
{
  "adjustment_type": "RESTOCK",
  "quantity": 10,
  "note": "Demo replenishment",
  "performed_by": "Manager"
}
```

`adjustment_type` must be `RESTOCK`, `SALE`, or `RELIEF_DISTRIBUTION`; quantity must be greater than zero. `RESTOCK` increases stock. `SALE` and `RELIEF_DISTRIBUTION` decrease stock. Attempting to issue more than the available quantity returns HTTP 400.

## Example requests (Windows CMD)

```cmd
curl http://127.0.0.1:8000/api/health
curl "http://127.0.0.1:8000/api/inventory?context=ngo"
curl "http://127.0.0.1:8000/api/inventory?search=paracetamol"
curl http://127.0.0.1:8000/api/dashboard/stats
curl -X POST http://127.0.0.1:8000/api/inventory/1/adjust -H "Content-Type: application/json" -d "{\"adjustment_type\":\"RESTOCK\",\"quantity\":5,\"note\":\"Demo restock\",\"performed_by\":\"Manager\"}"
```

## Response and error behavior

- Successful creation returns HTTP `201` with the created item.
- Successful reads and updates return JSON.
- Missing item IDs return HTTP `404` with a `detail` message.
- Duplicate SKU on create/update returns HTTP `400`.
- Invalid stock-adjustment type or insufficient stock returns HTTP `400`.
- Pydantic request validation failures are reported by FastAPI as HTTP `422`.
- CSV export returns `text/csv` with a `Content-Disposition` download filename.

## Dashboard response fields

`GET /api/dashboard/stats` returns `total_items`, `low_stock_count`, `critical_count`, `total_valuation`, `total_outflow_today`, `recent_activities`, and `throughput_curve`. Valuation is computed from `quantity * unit_price`. The throughput curve contains seven daily intake/outflow points.

## Important limitations

- No JWT, login, permissions, or organization scoping is implemented.
- `/api/users` returns sample user data; these rows have no passwords.
- `/api/seed` is destructive to inventory and activity logs.
- The frontend may use in-memory fallback data when the API is unreachable, so the UI can appear to work without persisting changes.
- The API currently configures wildcard CORS. Treat it as local-demo code, not production-ready.
- Finance, PDF, and versioned `/api/v1` routes from the plan are not present in this prototype.
