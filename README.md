# ResourceOne

ResourceOne is a prototype smart-inventory dashboard for NGO relief supplies and small-retailer stock. It provides inventory search/filtering, stock adjustments, low-stock indicators, an activity log, dashboard summaries, and CSV export.

> **Implementation status:** This README documents the code currently present on the `sora` branch, not every feature described in `PLAN.md`. The current prototype does **not** implement login/JWT authentication, server-side role enforcement, organizations/tenant isolation, finance modules, PDF reporting, or Alembic migrations. Seeded users are display/sample records, not login accounts. Do not expose this prototype to the public internet.

## Stack

- Frontend: React 19, Vite 8, React Router, Tailwind CSS 4, Lucide React
- Backend: Python, FastAPI, Uvicorn, Pydantic
- ORM/database layer: SQLAlchemy 2.0
- Database: SQLite by default; MySQL can be selected with `DATABASE_URL`
- Deployment: native processes; Docker is intentionally excluded from the plan

## Requirements

- Python 3.12+ recommended
- Node.js and npm compatible with the Vite version in `frontend/package.json`
- Optional: MySQL 8 if you want to run against MySQL rather than the default SQLite database

## Run locally on Windows

Open two Command Prompt windows in the repository root.

### 1. Start the backend

```cmd
cd backend
py -3 -m venv .venv
.venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The backend uses `sqlite:///./resourceone.db` when `DATABASE_URL` is not set. The relative SQLite file is created from the backend working directory. On startup, the app creates its SQLAlchemy tables and attempts to seed sample records if the inventory table is empty.

Open:
- Health check: http://127.0.0.1:8000/api/health
- Interactive API documentation: http://127.0.0.1:8000/docs

### 2. Start the frontend

In the second Command Prompt window:

```cmd
cd frontend
npm install
npm run dev
```

Open the Vite URL printed in the terminal (normally http://localhost:5173).

The frontend currently calls `http://127.0.0.1:8000/api` directly. If the backend is unreachable, the frontend can fall back to in-memory sample data; changes made in that fallback mode are not persisted to the database. Check the backend-status indicator before relying on data changes.

## Optional: use MySQL

1. Install and start MySQL 8.
2. Create a database and local user, for example:

```sql
CREATE DATABASE resourceone CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER 'resourceone'@'localhost' IDENTIFIED BY 'change-me';
GRANT ALL PRIVILEGES ON resourceone.* TO 'resourceone'@'localhost';
FLUSH PRIVILEGES;
```

3. In the same Command Prompt session you will use to start Uvicorn, set the connection string:

```cmd
set DATABASE_URL=mysql+pymysql://resourceone:change-me@127.0.0.1:3306/resourceone?charset=utf8mb4
```

4. Start the backend from the `backend` directory:

```cmd
uvicorn app.main:app --reload --port 8000
```

`backend/app/database.py` reads `DATABASE_URL` from the process environment. The checked-in `.env.example` is a reference for the intended configuration; the current app does not implement all of the planned environment settings. There is no checked-in Alembic migration in this branch, so do not run `alembic upgrade head` for this version.

## Sample data

The seed routine contains example inventory for NGO and retail contexts, three sample user records, and activity-log records. The sample user records (`admin@resourceone.org`, `manager@resourceone.org`, and `volunteer@resourceone.org`) do not have passwords and cannot be used to log in. The current UI's role selector is presentation state only; it is not an authorization boundary.

The `POST /api/seed` endpoint clears inventory and activity-log records before reseeding. Use it only with disposable demo data.

## Useful checks

With the backend running:

```cmd
curl http://127.0.0.1:8000/api/health
curl http://127.0.0.1:8000/api/inventory
curl http://127.0.0.1:8000/api/dashboard/stats
```

Frontend checks, from `frontend`:

```cmd
npm run lint
npm run build
```

## Troubleshooting

- **Frontend says backend is offline:** start Uvicorn first and open `http://127.0.0.1:8000/api/health`.
- **Port 8000 is already in use:** stop the process using it or start Uvicorn on another port; the frontend API URL would also need updating in `frontend/src/api/client.js`.
- **MySQL connection refused:** confirm the MySQL service is running, port 3306 is reachable, and the `DATABASE_URL` username/password/database are correct.
- **Missing Python package:** activate `backend\.venv` before installing requirements and starting Uvicorn.
- **Changes disappear after refresh while backend is offline:** the frontend is using in-memory fallback data. Reconnect the backend to use persistent database data.
- **Need to reset demo data:** `POST /api/seed` is destructive to inventory and activity logs. Only use it with disposable data.

## Architecture and API details

See [`docs/architecture.md`](docs/architecture.md), [`docs/api.md`](docs/api.md), [`docs/demo-script.md`](docs/demo-script.md), and [`docs/deck-notes.md`](docs/deck-notes.md).
