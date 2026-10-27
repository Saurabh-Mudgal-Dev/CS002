from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.core.deps import require_roles
from app.schemas.finance import FinanceSummary
from app.services.finance import get_finance_summary

router = APIRouter(prefix="/finance", tags=["Finance"])


@router.get("/summary", response_model=FinanceSummary)
def get_org_finance_summary(
    current_user: User = Depends(require_roles("admin", "manager", "accountant")),
    db: Session = Depends(get_db)
):
    """
    Get organization finance summary (Cash income, Operating expenses, Net position, Inventory value).
    """
    return get_finance_summary(db, current_user.org_id)
