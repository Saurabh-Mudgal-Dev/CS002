from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.organization import Organization
from app.core.deps import get_optional_user
from app.schemas.finance import FinanceSummary
from app.services.finance import get_finance_summary

router = APIRouter(prefix="/finance", tags=["Finance"])


@router.get("/summary", response_model=FinanceSummary)
def get_org_finance_summary(
    org_type: Optional[str] = Query("ngo"),
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Get organization finance summary (Cash income, Operating expenses, Net position, Inventory value).
    Accessible to guests in read-only public preview; authenticated users view their scoped organization.
    """
    if current_user:
        target_org_id = current_user.org_id
    else:
        org = db.query(Organization).filter(Organization.org_type == org_type).first()
        target_org_id = org.id if org else 1

    return get_finance_summary(db, target_org_id)
