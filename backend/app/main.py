import csv
import io
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app.models import InventoryItem, User, ActivityLog, Organization
from app.core.config import settings
from app.api.v1.router import api_v1_router
from app.schemas import (
    ItemCreate, ItemUpdate, ItemOut, StockAdjustRequest,
    DashboardStats, ActivityLogOut, UserOut, HealthResponse
)
from app.seed import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Only initialize DB if not in test environment or if engine is accessible
    if settings.ENVIRONMENT != "testing":
        try:
            Base.metadata.create_all(bind=engine)
            if settings.SEED_DEMO:
                try:
                    seed_database()
                except Exception as e:
                    print(f"Seed note: {e}")
        except Exception as e:
            print(f"Database connection note (offline/dev fallback): {e}")
    yield


app = FastAPI(
    title="ResourceOne API",
    description="Smart Inventory & Resource Management Platform API for NGOs and Small Businesses",
    version="1.0.0",
    lifespan=lifespan
)

# CORS restricted from environment settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API v1 router
app.include_router(api_v1_router)


@app.get("/api/health", response_model=HealthResponse, tags=["System"])
@app.get("/api/v1/health", response_model=HealthResponse, tags=["System"])
def health_check(db: Session = Depends(get_db)):
    total = db.query(InventoryItem).filter(InventoryItem.is_archived == False).count()
    db_name = str(engine.url).split("://")[0]
    return {
        "status": "healthy",
        "version": "1.0.0",
        "database": db_name,
        "total_items": total
    }


@app.get("/api/users", response_model=List[UserOut], tags=["Users"])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()


@app.get("/api/inventory", response_model=List[ItemOut], tags=["Inventory"])
def list_inventory(
    search: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(InventoryItem).filter(InventoryItem.is_archived == False)

    if category and category != "All":
        query = query.filter(InventoryItem.category == category)

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                InventoryItem.name.ilike(search_fmt),
                InventoryItem.sku.ilike(search_fmt)
            )
        )

    items = query.order_by(InventoryItem.id.desc()).all()
    if status and status != "All":
        items = [i for i in items if i.calculate_status() == status]

    return items


@app.get("/api/inventory/low-stock", response_model=List[ItemOut], tags=["Inventory"])
def get_low_stock_items(db: Session = Depends(get_db)):
    items = db.query(InventoryItem).filter(InventoryItem.is_archived == False).all()
    return [i for i in items if i.calculate_status() in ["low", "out_of_stock"]]


@app.get("/api/inventory/{item_id}", response_model=ItemOut, tags=["Inventory"])
def get_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@app.post("/api/inventory", response_model=ItemOut, status_code=status.HTTP_201_CREATED, tags=["Inventory"])
def create_item(payload: ItemCreate, db: Session = Depends(get_db)):
    org = db.query(Organization).first()
    org_id = org.id if org else 1

    existing = db.query(InventoryItem).filter(
        InventoryItem.org_id == org_id,
        InventoryItem.sku == payload.sku.strip().upper()
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"SKU '{payload.sku}' already exists.")

    item = InventoryItem(
        org_id=org_id,
        name=payload.name.strip(),
        sku=payload.sku.strip().upper(),
        category=payload.category,
        unit=payload.unit,
        quantity_on_hand=payload.quantity_on_hand,
        reorder_level=payload.reorder_level,
        unit_cost=payload.unit_cost,
        unit_price=payload.unit_price,
        expiry_date=payload.expiry_date,
    )
    db.add(item)
    db.flush()

    log = ActivityLog(
        org_id=org_id,
        action="create",
        entity_type="inventory_item",
        entity_id=item.id,
        summary=f"Created SKU {item.sku} in {item.category}",
        ip_address="127.0.0.1",
        created_at=datetime.now(timezone.utc),
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

    update_data = payload.model_dump(exclude_unset=True)
    if "sku" in update_data and update_data["sku"]:
        sku_clean = update_data["sku"].strip().upper()
        other = db.query(InventoryItem).filter(
            InventoryItem.org_id == item.org_id,
            InventoryItem.sku == sku_clean,
            InventoryItem.id != item_id
        ).first()
        if other:
            raise HTTPException(status_code=400, detail="SKU already in use by another item.")
        update_data["sku"] = sku_clean

    changed_fields = []
    for k, v in update_data.items():
        if hasattr(item, k) and getattr(item, k) != v:
            changed_fields.append(f"{k}: {getattr(item, k)} -> {v}")
            setattr(item, k, v)

    log = ActivityLog(
        org_id=item.org_id,
        action="update",
        entity_type="inventory_item",
        entity_id=item.id,
        summary=f"SKU {item.sku} updated ({', '.join(changed_fields[:3]) if changed_fields else 'details updated'})",
        ip_address="127.0.0.1",
        created_at=datetime.now(timezone.utc),
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
    qty = Decimal(str(payload.quantity))

    if adj_type in ["RELIEF_DISTRIBUTION", "SALE", "RELIEF"]:
        if item.quantity_on_hand < qty:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock! Available: {item.quantity_on_hand}, Requested: {qty}"
            )
        item.quantity_on_hand -= qty
    elif adj_type == "RESTOCK":
        item.quantity_on_hand += qty
    else:
        raise HTTPException(
            status_code=400,
            detail="Invalid adjustment_type. Must be RELIEF, SALE, or RESTOCK"
        )

    log = ActivityLog(
        org_id=item.org_id,
        action="movement",
        entity_type="stock_movement",
        entity_id=item.id,
        summary=f"{adj_type} of {qty} units for {item.name}. {payload.note or ''}".strip(),
        ip_address="127.0.0.1",
        created_at=datetime.now(timezone.utc),
    )
    db.add(log)
    db.commit()
    db.refresh(item)
    return item


@app.delete("/api/inventory/{item_id}", tags=["Inventory"])
def archive_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Soft-delete / archive
    item.is_archived = True
    log = ActivityLog(
        org_id=item.org_id,
        action="archive",
        entity_type="inventory_item",
        entity_id=item.id,
        summary=f"Archived SKU {item.sku} ({item.name})",
        ip_address="127.0.0.1",
        created_at=datetime.now(timezone.utc),
    )
    db.add(log)
    db.commit()
    return {"message": f"Item '{item.name}' archived successfully."}


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
        query = query.filter(ActivityLog.action == action_type.lower())
    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                ActivityLog.summary.ilike(search_fmt),
                ActivityLog.action.ilike(search_fmt)
            )
        )
    total = query.count()
    logs = query.order_by(ActivityLog.created_at.desc()).offset(offset).limit(limit).all()
    return {
        "total": total,
        "items": [ActivityLogOut.model_validate(l) for l in logs]
    }


@app.get("/api/dashboard/stats", response_model=DashboardStats, tags=["Dashboard"])
def get_dashboard_stats(db: Session = Depends(get_db)):
    items = db.query(InventoryItem).filter(InventoryItem.is_archived == False).all()
    total_items = len(items)
    low_stock_count = sum(1 for i in items if i.calculate_status() == "low")
    critical_count = sum(1 for i in items if i.calculate_status() == "out_of_stock")
    total_valuation = float(sum(i.total_value for i in items))

    recent_logs = db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(10).all()

    now = datetime.now(timezone.utc)
    throughput = []
    for day_offset in range(6, -1, -1):
        day_date = now - timedelta(days=day_offset)
        day_start = datetime(day_date.year, day_date.month, day_date.day, tzinfo=timezone.utc)
        day_end = day_start + timedelta(days=1)

        day_logs = db.query(ActivityLog).filter(
            ActivityLog.created_at >= day_start,
            ActivityLog.created_at < day_end
        ).all()

        intake = sum(1 for l in day_logs if l.action in ["create", "restock"])
        outflow = sum(1 for l in day_logs if l.action in ["sale", "relief"])

        throughput.append({
            "day": day_date.strftime("%a"),
            "intake": intake,
            "outflow": outflow
        })

    return {
        "total_items": total_items,
        "low_stock_count": low_stock_count,
        "critical_count": critical_count,
        "total_valuation": total_valuation,
        "total_outflow_today": 0,
        "recent_activities": [ActivityLogOut.model_validate(l) for l in recent_logs],
        "throughput_curve": throughput
    }


@app.get("/api/export/csv", tags=["Export"])
def export_csv(db: Session = Depends(get_db)):
    items = db.query(InventoryItem).filter(InventoryItem.is_archived == False).order_by(InventoryItem.id.asc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Item ID", "SKU", "Item Name", "Category", "Quantity", "Unit", "Reorder Level", "Unit Cost", "Unit Price", "Total Valuation", "Status"])

    for i in items:
        writer.writerow([
            i.id,
            i.sku,
            i.name,
            i.category,
            f"{i.quantity_on_hand:.2f}",
            i.unit,
            i.reorder_level,
            f"{i.unit_cost:.2f}",
            f"{i.unit_price:.2f}",
            f"{i.total_value:.2f}",
            i.calculate_status()
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=ResourceOne_Inventory_Report.csv"}
    )


@app.post("/api/seed", tags=["System"])
def reseed(db: Session = Depends(get_db)):
    """Clear and re-seed sample items."""
    db.query(ActivityLog).delete()
    db.query(InventoryItem).delete()
    db.commit()
    seed_database()
    count = db.query(InventoryItem).count()
    return {"message": f"Successfully seeded {count} items."}
