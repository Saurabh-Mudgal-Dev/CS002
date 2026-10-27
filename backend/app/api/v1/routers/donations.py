from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models.finance import Donation
from app.models.inventory import InventoryItem
from app.models.user import User
from app.schemas.finance import DonationCreate, DonationOut
from app.core.deps import get_current_user
from app.services.finance import create_donation_record

router = APIRouter(prefix="/donations", tags=["Donations"])


@router.get("", response_model=List[DonationOut])
def list_donations(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List donations.
    Volunteers only see their own recorded donations.
    Admin, Manager, Accountant see all donations for their organization.
    """
    query = db.query(Donation).filter(Donation.org_id == current_user.org_id)
    if current_user.role.lower() == "volunteer":
        query = query.filter(Donation.recorded_by == current_user.id)

    donations = query.order_by(desc(Donation.donation_date), desc(Donation.id)).offset(offset).limit(limit).all()

    results = []
    for d in donations:
        item = db.query(InventoryItem).filter(InventoryItem.id == d.item_id).first() if d.item_id else None
        out = DonationOut.model_validate(d)
        out.item_name = item.name if item else None
        results.append(out)
    return results


@router.post("", response_model=DonationOut, status_code=status.HTTP_201_CREATED)
def create_donation(
    payload: DonationCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create donation:
      - Volunteer: can record goods donations only
      - Admin, Manager, Accountant: can record cash or goods donations
    """
    if current_user.role.lower() == "volunteer" and payload.donation_type.lower() != "goods":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Volunteers can only record in-kind goods donations."
        )

    ip_addr = request.client.host if request.client else "127.0.0.1"
    donation = create_donation_record(
        db=db,
        org_id=current_user.org_id,
        user_id=current_user.id,
        data=payload,
        ip_address=ip_addr
    )
    db.commit()
    db.refresh(donation)

    item = db.query(InventoryItem).filter(InventoryItem.id == donation.item_id).first() if donation.item_id else None
    res = DonationOut.model_validate(donation)
    res.item_name = item.name if item else None
    return res
