from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models.organization import Organization
from app.models.inventory import InventoryItem
from app.models.movement import StockMovement
from app.models.user import User
from app.core.deps import get_optional_user
from app.services.finance import get_finance_summary

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary")
def get_dashboard_summary(
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Returns unified summary data for the Operations Overview screen.
    Accessible without mandatory authentication (guest viewer mode scopes to default org).
    Financial indicators are only included for Admin, Manager, and Accountant.
    """
    if current_user:
        org_id = current_user.org_id
        viewer_role = current_user.role.lower()
        is_authenticated = True
        user_name = current_user.full_name
    else:
        first_org = db.query(Organization).first()
        org_id = first_org.id if first_org else 1
        viewer_role = "guest"
        is_authenticated = False
        user_name = "Guest Viewer"

    org = db.query(Organization).filter(Organization.id == org_id).first()
    raw_name = org.name if org else "ResourceOne Platform"
    if "asha" in raw_name.lower():
        raw_name = "Community Relief Organization"

    org_info = {
        "id": org.id if org else 1,
        "name": raw_name,
        "org_type": org.org_type if org else "ngo",
        "currency": org.currency if org else "INR"
    }

    # 1. Inventory & Stock Status
    items = db.query(InventoryItem).filter(
        InventoryItem.org_id == org_id,
        InventoryItem.is_archived == False
    ).all()

    total_items = len(items)
    now = datetime.now(timezone.utc)
    today = now.date()

    low_stock_items = [i for i in items if 0 < i.quantity_on_hand <= i.reorder_level]
    critical_items = [i for i in items if i.quantity_on_hand == 0]
    expiring_soon_items = [
        i for i in items
        if i.expiry_date and today <= i.expiry_date <= (today + timedelta(days=30))
    ]
    expired_items = [
        i for i in items
        if i.expiry_date and i.expiry_date < today
    ]

    total_valuation = sum(
        (Decimal(str(i.quantity_on_hand)) * Decimal(str(i.unit_cost)) for i in items),
        Decimal("0.00")
    )

    # 2. 30-Day Throughput (Intake vs Outflow)
    thirty_days_ago = now - timedelta(days=30)
    movements_30d = db.query(StockMovement).filter(
        StockMovement.org_id == org_id,
        StockMovement.created_at >= thirty_days_ago
    ).all()

    # Bucket movements by day
    throughput_map = {}
    for day_offset in range(29, -1, -1):
        d = (now - timedelta(days=day_offset)).date()
        d_str = d.strftime("%Y-%m-%d")
        throughput_map[d_str] = {
            "date": d_str,
            "day": d.strftime("%d %b"),
            "intake": 0.0,
            "outflow": 0.0,
        }

    for m in movements_30d:
        m_date_str = m.created_at.date().strftime("%Y-%m-%d")
        if m_date_str in throughput_map:
            delta = float(m.quantity_delta)
            if delta > 0:
                throughput_map[m_date_str]["intake"] += round(delta, 2)
            else:
                throughput_map[m_date_str]["outflow"] += round(abs(delta), 2)

    throughput_curve = list(throughput_map.values())

    # 3. Active Operational Alerts
    alerts = []
    # Critical (out of stock)
    for i in critical_items:
        alerts.append({
            "id": f"crit-{i.id}",
            "item_id": i.id,
            "name": i.name,
            "sku": i.sku,
            "category": i.category,
            "unit": i.unit,
            "quantity_on_hand": float(i.quantity_on_hand),
            "reorder_level": i.reorder_level,
            "expiry_date": i.expiry_date.strftime("%Y-%m-%d") if i.expiry_date else None,
            "alert_type": "out_of_stock",
            "severity": "danger",
            "message": f"Stock depleted (0 {i.unit} available; reorder target: {i.reorder_level})"
        })

    # Low stock
    for i in low_stock_items:
        alerts.append({
            "id": f"low-{i.id}",
            "item_id": i.id,
            "name": i.name,
            "sku": i.sku,
            "category": i.category,
            "unit": i.unit,
            "quantity_on_hand": float(i.quantity_on_hand),
            "reorder_level": i.reorder_level,
            "expiry_date": i.expiry_date.strftime("%Y-%m-%d") if i.expiry_date else None,
            "alert_type": "low_stock",
            "severity": "warning",
            "message": f"Low stock: {i.quantity_on_hand} {i.unit} remaining (reorder level: {i.reorder_level})"
        })

    # Expiring soon / expired
    for i in expired_items:
        alerts.append({
            "id": f"exp-{i.id}",
            "item_id": i.id,
            "name": i.name,
            "sku": i.sku,
            "category": i.category,
            "unit": i.unit,
            "quantity_on_hand": float(i.quantity_on_hand),
            "reorder_level": i.reorder_level,
            "expiry_date": i.expiry_date.strftime("%Y-%m-%d") if i.expiry_date else None,
            "alert_type": "expired",
            "severity": "danger",
            "message": f"Expired on {i.expiry_date.strftime('%d %b %Y')}"
        })

    for i in expiring_soon_items:
        days_left = (i.expiry_date - today).days
        alerts.append({
            "id": f"exps-{i.id}",
            "item_id": i.id,
            "name": i.name,
            "sku": i.sku,
            "category": i.category,
            "unit": i.unit,
            "quantity_on_hand": float(i.quantity_on_hand),
            "reorder_level": i.reorder_level,
            "expiry_date": i.expiry_date.strftime("%Y-%m-%d") if i.expiry_date else None,
            "alert_type": "expiring_soon",
            "severity": "warning",
            "message": f"Expires in {days_left} day{'s' if days_left != 1 else ''} ({i.expiry_date.strftime('%d %b')})"
        })

    # 4. Recent Stock Movements
    recent_movements_db = db.query(StockMovement).filter(
        StockMovement.org_id == org_id
    ).order_by(desc(StockMovement.created_at)).limit(10).all()

    recent_movements = []
    for m in recent_movements_db:
        item = m.item
        actor = m.actor
        recent_movements.append({
            "id": m.id,
            "item_id": m.item_id,
            "item_name": item.name if item else "Unknown Item",
            "sku": item.sku if item else "",
            "movement_type": m.movement_type,
            "quantity_delta": float(m.quantity_delta),
            "unit_value": float(m.unit_value) if m.unit_value else 0.0,
            "total_value": float(m.total_value) if m.total_value else 0.0,
            "reference_type": m.reference_type,
            "note": m.note or "",
            "actor_name": actor.full_name if actor else "System",
            "created_at": m.created_at.isoformat()
        })

    # 5. Finance summary (restricted to management)
    finance_summary = None
    if viewer_role in ["admin", "manager", "accountant"]:
        try:
            fin = get_finance_summary(db, org_id)
            finance_summary = {
                "cash_income": float(fin.cash_income),
                "expenses": float(fin.expenses),
                "net_position": float(fin.net_position),
                "inventory_value": float(fin.inventory_value),
                "total_purchases": float(fin.total_purchases),
                "total_donations": float(fin.total_donations),
                "total_expenses": float(fin.total_expenses),
            }
        except Exception:
            finance_summary = None

    return {
        "organization": org_info,
        "viewer": {
            "is_authenticated": is_authenticated,
            "role": viewer_role,
            "name": user_name
        },
        "kpis": {
            "total_items": total_items,
            "low_stock_count": len(low_stock_items),
            "critical_count": len(critical_items),
            "expiring_soon_count": len(expiring_soon_items),
            "expired_count": len(expired_items),
            "total_valuation": float(total_valuation),
            "net_position": finance_summary["net_position"] if finance_summary else None,
            "cash_income": finance_summary["cash_income"] if finance_summary else None,
            "expenses": finance_summary["expenses"] if finance_summary else None,
        },
        "throughput_curve": throughput_curve,
        "alerts": alerts,
        "recent_movements": recent_movements,
        "finance": finance_summary,
        "updated_at": now.isoformat()
    }

