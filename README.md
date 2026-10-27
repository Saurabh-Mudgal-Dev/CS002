# ResourceOne

Smart Inventory & Resource Management Platform for NGOs and small businesses.

## Stack

- **Frontend:** React 19, Vite 8, Tailwind CSS 4
- **Backend:** Python 3.12+, FastAPI, SQLAlchemy 2.0
- **Database:** MySQL 8.0 (SQLite for local dev)

## Setup

```bash
# Backend
cd backend
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
.venv\Scripts\uvicorn app.main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Copy `.env.example` to `.env` and update the values before starting.

## Links

- API docs: http://localhost:8000/docs
- App: http://localhost:5173
