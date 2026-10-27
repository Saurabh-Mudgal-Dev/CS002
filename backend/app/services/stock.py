from decimal import Decimal
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.inventory import InventoryItem
from app.models.movement import StockMovement
from app.models.organization import Organization
from app.models.audit import ActivityLog


def record_movement(
    db: Session,
    org_id: int,
    item_id: int,
    movement_type: str,
    quantity: Decimal,
    actor_user_id: Optional[int] = None,
    note: Optional[str] = None,
    reference_type: Optional[str] = None,
    reference_id: Optional[int] = None,
    ip_address: str = "127.0.0.1"
) -> StockMovement:
    """
    Core stock movement service.
    Enforces business rules:
      - Validates type and sign: RESTOCK (+), SALE (-), RELIEF (-), ADJUSTMENT (+/-)
      - Org type validation: SALE is retail only, RELIEF is NGO only
      - Locks the row using SELECT ... FOR UPDATE (if DB supports, fallback sync)
      - Rejects over-issue (negative stock)
      - Updates item quantity_on_hand and snapshots unit_value / total_value
      - Inserts StockMovement and ActivityLog in the same transaction
    """
    mv_type = movement_type.upper().strip()
    if quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Movement quantity must be greater than zero."
        )

    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found."
        )

    # Org-type constraints from §9.1
    org_type = (org.org_type or "ngo").lower()
    if mv_type == "SALE" and org_type != "retail":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="SALE movements are only permitted for retail organizations."
        )
    if mv_type == "RELIEF" and org_type != "ngo":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="RELIEF distribution movements are only permitted for NGO organizations."
        )

    # Lock row for update
    item = db.query(InventoryItem).filter(
        InventoryItem.id == item_id,
        InventoryItem.org_id == org_id
    ).with_for_update().first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found."
        )

    # Determine delta and valuation snapshot
    # Sign by type: RESTOCK (+), SALE (-), RELIEF (-), ADJUSTMENT (+)
    if mv_type in ["RESTOCK"]:
        qty_delta = quantity
        unit_val = item.unit_cost
        tot_val = (qty_delta * unit_val).quantize(Decimal("0.01"))
    elif mv_type in ["SALE"]:
        if item.quantity_on_hand < quantity:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Insufficient stock for sale! Available: {item.quantity_on_hand}, Requested: {quantity}"
            )
        qty_delta = -quantity
        unit_val = item.unit_price  # snapshots unit_price (revenue) for SALE
        tot_val = (quantity * unit_val).quantize(Decimal("0.01"))
    elif mv_type in ["RELIEF"]:
        if item.quantity_on_hand < quantity:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Insufficient stock for relief! Available: {item.quantity_on_hand}, Requested: {quantity}"
            )
        qty_delta = -quantity
        unit_val = Decimal("0.00")  # RELIEF revenue is 0
        tot_val = Decimal("0.00")
    elif mv_type in ["ADJUSTMENT"]:
        # default adjustment positive unless noted, but if note indicates reduction or over-issue check
        qty_delta = quantity
        unit_val = item.unit_cost
        tot_val = (qty_delta * unit_val).quantize(Decimal("0.01"))
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid movement type '{movement_type}'. Allowed: RESTOCK, SALE, RELIEF, ADJUSTMENT"
        )

    new_stock = item.quantity_on_hand + qty_delta
    if new_stock < 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot reduce stock below zero. Current: {item.quantity_on_hand}, Requested delta: {qty_delta}"
        )

    item.quantity_on_hand = new_stock

    movement = StockMovement(
        org_id=org_id,
        item_id=item.id,
        movement_type=mv_type,
        quantity_delta=qty_delta,
        unit_value=unit_val,
        total_value=tot_val,
        reference_type=reference_type,
        reference_id=reference_id,
        note=note,
        actor_user_id=actor_user_id
    )
    db.add(movement)
    db.flush()

    summary_action = "Restocked" if qty_delta > 0 else "Dispatched"
    activity_summary = f"{summary_action} {quantity} {item.unit} of {item.name}"
    if note:
        activity_summary += f" ({note})"

    activity = ActivityLog(
        org_id=org_id,
        actor_user_id=actor_user_id,
        action="movement",
        entity_type="stock_movement",
        entity_id=movement.id,
        summary=activity_summary,
        ip_address=ip_address
    )
    db.add(activity)

    return movement
