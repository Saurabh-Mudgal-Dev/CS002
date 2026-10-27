from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models.movement import StockMovement
from app.models.inventory import InventoryItem
from app.models.user import User
from app.schemas.inventory import StockMovementCreate, StockMovementOut
from app.core.deps import get_current_user
from app.services.stock import record_movement

router = APIRouter(tags=["Stock Movements"])


@router.post("/items/{item_id}/movements", response_model=StockMovementOut, status_code=status.HTTP_201_CREATED)
def create_item_movement(
    item_id: int,
    payload: StockMovementCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Record stock movement for an item.
    Permitted roles:
      - Admin, Manager
      - Volunteer (RELIEF and RESTOCK only)
    """
    mv_type = payload.movement_type.upper().strip()
    if current_user.role.lower() == "volunteer" and mv_type not in ["RELIEF", "RESTOCK"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Volunteers can only record RELIEF and RESTOCK movements."
        )
    elif current_user.role.lower() not in ["admin", "manager", "volunteer"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to record stock movements."
        )

    ip_addr = request.client.host if request.client else "127.0.0.1"

    movement = record_movement(
        db=db,
        org_id=current_user.org_id,
        item_id=item_id,
        movement_type=mv_type,
        quantity=payload.quantity,
        actor_user_id=current_user.id,
        note=payload.note,
        reference_type=payload.reference_type or "manual",
        reference_id=payload.reference_id,
        ip_address=ip_addr
    )
    db.commit()
    db.refresh(movement)

    # Attach helper details for response
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    res = StockMovementOut.model_validate(movement)
    res.actor_name = current_user.full_name
    res.item_name = item.name if item else None
    return res


@router.get("/movements", response_model=List[StockMovementOut])
def list_movements(
    item_id: Optional[int] = None,
    movement_type: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List stock movements ledger for the organization.
    """
    query = db.query(StockMovement).filter(StockMovement.org_id == current_user.org_id)
    if item_id:
        query = query.filter(StockMovement.item_id == item_id)
    if movement_type and movement_type != "All":
        query = query.filter(StockMovement.movement_type == movement_type.upper())

    movements = query.order_by(desc(StockMovement.created_at)).offset(offset).limit(limit).all()

    results = []
    for m in movements:
        item = db.query(InventoryItem).filter(InventoryItem.id == m.item_id).first()
        actor = db.query(User).filter(User.id == m.actor_user_id).first() if m.actor_user_id else None
        out = StockMovementOut.model_validate(m)
        out.item_name = item.name if item else None
        out.actor_name = actor.full_name if actor else "System"
        results.append(out)

    return results
