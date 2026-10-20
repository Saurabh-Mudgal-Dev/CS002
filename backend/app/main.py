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


@app.post("/api/inventory", response_model=ItemOut, status_code=status.HTTP_201_CREATED, tags=["Inventory"])
def create_item(payload: ItemCreate, db: Session = Depends(get_db)):
    # Check duplicate SKU
    existing = db.query(InventoryItem).filter(InventoryItem.sku == payload.sku.strip().upper()).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"SKU '{payload.sku}' already exists.")

    item = InventoryItem(
        name=payload.name.strip(),
        sku=payload.sku.strip().upper(),
        category=payload.category,
        context_tag=payload.context_tag,
        quantity=payload.quantity,
        reorder_level=payload.reorder_level,
        unit_price=payload.unit_price,
    )
    item.status = item.calculate_status()
    db.add(item)

    log = ActivityLog(
        action_type="ITEM_CREATED",
        item_name=item.name,
        quantity_change=item.quantity,
        note=f"New SKU created in {item.category}",
        performed_by="Manager"
    )
    db.add(log)

    db.commit()
    db.refresh(item)
    return item


@app.put("/api/inventory/{item_id}", response_model=ItemOut, tags=["Inventory"])
def update_item(item_id: int, payload: ItemUpdate, db: Session = Depends(get_db)):
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    update_data = payload.dict(exclude_unset=True)
    if "sku" in update_data:
        update_data["sku"] = update_data["sku"].strip().upper()
        # Verify unique
        other = db.query(InventoryItem).filter(InventoryItem.sku == update_data["sku"], InventoryItem.id != item_id).first()
        if other:
            raise HTTPException(status_code=400, detail="SKU already in use by another item.")

    changed_fields = []
    for k, v in update_data.items():
        if getattr(item, k) != v:
            changed_fields.append(f"{k}: {getattr(item, k)} -> {v}")
        setattr(item, k, v)

    item.status = item.calculate_status()

    log = ActivityLog(
        action_type="ITEM_UPDATED",
        item_name=item.name,
        quantity_change=0,
        note=f"SKU {item.sku} updated ({', '.join(changed_fields[:3]) if changed_fields else 'details updated'})",
        performed_by="Manager"
    )
    db.add(log)

    db.commit()
    db.refresh(item)
    return item


@app.post("/api/inventory/{item_id}/adjust", response_model=ItemOut, tags=["Inventory"])
def adjust_stock(item_id: int, payload: StockAdjustRequest, db: Session = Depends(get_db)):
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    adj_type = payload.adjustment_type.upper()
    qty = payload.quantity

    if adj_type in ["RELIEF_DISTRIBUTION", "SALE"]:
        if item.quantity < qty:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock! Available: {item.quantity}, Requested: {qty}"
            )
        item.quantity -= qty
        signed_change = -qty
    elif adj_type == "RESTOCK":
        item.quantity += qty
        signed_change = qty
    else:
        raise HTTPException(
            status_code=400,
            detail="Invalid adjustment_type. Must be RELIEF_DISTRIBUTION, SALE, or RESTOCK"
        )

    item.status = item.calculate_status()

    log = ActivityLog(
        action_type=adj_type,
        item_name=item.name,
        quantity_change=signed_change,
        note=payload.note or f"{adj_type.replace('_', ' ').title()}",
        performed_by=payload.performed_by or "Manager"
    )
    db.add(log)

    db.commit()
    db.refresh(item)
    return item


@app.delete("/api/inventory/{item_id}", tags=["Inventory"])
def delete_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    log = ActivityLog(
        action_type="ITEM_DELETED",
        item_name=item.name,
        quantity_change=-item.quantity,
        note=f"Deleted SKU {item.sku} from catalog",
        performed_by="Admin"
    )
    db.add(log)
    db.delete(item)
    db.commit()
    return {"message": f"Item '{item.name}' deleted successfully."}


@app.get("/api/activities", tags=["Activities"])
def list_activities(
    action_type: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(ActivityLog)
    if action_type and action_type != "All":
        query = query.filter(ActivityLog.action_type == action_type.upper())
    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                ActivityLog.item_name.ilike(search_fmt),
                ActivityLog.note.ilike(search_fmt),
                ActivityLog.performed_by.ilike(search_fmt)
            )
        )
    total = query.count()
    logs = query.order_by(ActivityLog.timestamp.desc()).offset(offset).limit(limit).all()
    return {
        "total": total,
        "items": logs
    }
