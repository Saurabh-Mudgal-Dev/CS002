from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models.finance import Expense
from app.models.user import User
from app.models.organization import Organization
from app.schemas.finance import ExpenseCreate, ExpenseOut
from app.core.deps import require_roles, get_optional_user
from app.services.finance import create_expense_record

router = APIRouter(prefix="/expenses", tags=["Expenses"])


@router.get("", response_model=List[ExpenseOut])
def list_expenses(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    org_type: Optional[str] = Query("ngo"),
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    List operating expenses.
    Unauthenticated visitors can browse expense vouchers in public preview mode;
    Authenticated users view expenses for their scoped organization.
    """
    if current_user:
        target_org_id = current_user.org_id
    else:
        org = db.query(Organization).filter(Organization.org_type == org_type).first()
        target_org_id = org.id if org else 1

    expenses = db.query(Expense).filter(
        Expense.org_id == target_org_id
    ).order_by(desc(Expense.expense_date), desc(Expense.id)).offset(offset).limit(limit).all()
    return expenses


@router.post("", response_model=ExpenseOut, status_code=status.HTTP_201_CREATED)
def create_expense(
    payload: ExpenseCreate,
    request: Request,
    current_user: User = Depends(require_roles("admin", "accountant")),
    db: Session = Depends(get_db)
):
    ip_addr = request.client.host if request.client else "127.0.0.1"
    expense = create_expense_record(
        db=db,
        org_id=current_user.org_id,
        user_id=current_user.id,
        data=payload,
        ip_address=ip_addr
    )
    db.commit()
    db.refresh(expense)
    return expense
