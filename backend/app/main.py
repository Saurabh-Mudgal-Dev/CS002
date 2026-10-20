import csv
import io
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app.models import InventoryItem, User, ActivityLog
from app.schemas import (
    ItemCreate, ItemUpdate, ItemOut, StockAdjustRequest,
    DashboardStats, ActivityLogOut, UserOut, HealthResponse
)
from app.seed import seed_database

# Initialize tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ResourceOne API",
    description="Smart Inventory & Resource Management Platform API for NGOs and Small Businesses",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    """Ensure database has seed items on application startup."""
    seed_database()


@app.get("/api/health", response_model=HealthResponse, tags=["System"])
def health_check(db: Session = Depends(get_db)):
    total = db.query(InventoryItem).count()
    return {
        "status": "healthy",
        "version": "1.0.0",
        "database": str(engine.url).split("://")[0],
        "total_items": total
    }


@app.get("/api/users", response_model=List[UserOut], tags=["Users"])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()


@app.get("/api/inventory", response_model=List[ItemOut], tags=["Inventory"])
def list_inventory(
    search: Optional[str] = None,
    category: Optional[str] = None,
    context: Optional[str] = Query(None, description="'ngo', 'retail', or 'all'"),
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(InventoryItem)

    if context and context != "all":
        query = query.filter(or_(InventoryItem.context_tag == context, InventoryItem.context_tag == "general"))

    if category and category != "All":
        query = query.filter(InventoryItem.category == category)

    if status and status != "All":
        query = query.filter(InventoryItem.status == status)

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                InventoryItem.name.ilike(search_fmt),
                InventoryItem.sku.ilike(search_fmt)
            )
        )

    return query.order_by(InventoryItem.id.desc()).all()


@app.get("/api/inventory/low-stock", response_model=List[ItemOut], tags=["Inventory"])
def get_low_stock_items(db: Session = Depends(get_db)):
    return db.query(InventoryItem).filter(InventoryItem.quantity <= InventoryItem.reorder_level).all()


@app.get("/api/inventory/{item_id}", response_model=ItemOut, tags=["Inventory"])
def get_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item
