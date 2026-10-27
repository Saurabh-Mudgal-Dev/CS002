from typing import List
from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models.finance import Purchase
from app.models.inventory import InventoryItem
from app.models.user import User
from app.schemas.finance import PurchaseCreate, PurchaseOut
from app.core.deps import require_roles
from app.services.finance import create_purchase_record

router = APIRouter(prefix="/purchases", tags=["Purchases"])


@router.get("", response_model=List[PurchaseOut])
def list_purchases(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(require_roles("admin", "manager", "accountant")),
    db: Session = Depends(get_db)
):
    purchases = db.query(Purchase).filter(
        Purchase.org_id == current_user.org_id
    ).order_by(desc(Purchase.purchase_date), desc(Purchase.id)).offset(offset).limit(limit).all()

    results = []
    for p in purchases:
        item = db.query(InventoryItem).filter(InventoryItem.id == p.item_id).first()
        out = PurchaseOut.model_validate(p)
        out.item_name = item.name if item else None
        results.append(out)
    return results


@router.post("", response_model=PurchaseOut, status_code=status.HTTP_201_CREATED)
def create_purchase(
    payload: PurchaseCreate,
    request: Request,
    current_user: User = Depends(require_roles("admin", "manager")),
    db: Session = Depends(get_db)
):
    ip_addr = request.client.host if request.client else "127.0.0.1"
    purchase = create_purchase_record(
        db=db,
        org_id=current_user.org_id,
        user_id=current_user.id,
        data=payload,
        ip_address=ip_addr
    )
    db.commit()
    db.refresh(purchase)

    item = db.query(InventoryItem).filter(InventoryItem.id == purchase.item_id).first()
    res = PurchaseOut.model_validate(purchase)
    res.item_name = item.name if item else None
    return res
