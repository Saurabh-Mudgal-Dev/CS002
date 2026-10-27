from typing import List, Optional
from pydantic import BaseModel
from decimal import Decimal

from app.schemas.organization import (
    OrganizationBase, OrganizationCreate, OrganizationUpdate, OrganizationOut
)
from app.schemas.user import (
    UserBase, UserCreate, UserUpdate, UserRoleUpdate, UserOut
)
from app.schemas.inventory import (
    ItemBase, ItemCreate, ItemUpdate, ItemOut,
    StockMovementCreate, StockMovementOut
)
from app.schemas.finance import (
    PurchaseCreate, PurchaseOut,
    DonationCreate, DonationOut,
    ExpenseCreate, ExpenseOut,
    FinanceSummary
)
from app.schemas.audit import ActivityLogOut
from app.schemas.auth import (
    LoginRequest, TokenResponse, SessionUser, TokenData
)


# Legacy & Dashboard Compatibility Schemas
class StockAdjustRequest(BaseModel):
    adjustment_type: str
    quantity: Decimal
    note: Optional[str] = None
    performed_by: Optional[str] = "Manager"


class ActivityPoint(BaseModel):
    day: str
    intake: int
    outflow: int


class DashboardStats(BaseModel):
    total_items: int
    low_stock_count: int
    critical_count: int
    total_valuation: float
    total_outflow_today: int
    recent_activities: List[ActivityLogOut]
    throughput_curve: List[ActivityPoint]


class HealthResponse(BaseModel):
    status: str
    version: str
    database: str
    total_items: int


__all__ = [
    "OrganizationBase",
    "OrganizationCreate",
    "OrganizationUpdate",
    "OrganizationOut",
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserRoleUpdate",
    "UserOut",
    "ItemBase",
    "ItemCreate",
    "ItemUpdate",
    "ItemOut",
    "StockMovementCreate",
    "StockMovementOut",
    "StockAdjustRequest",
    "PurchaseCreate",
    "PurchaseOut",
    "DonationCreate",
    "DonationOut",
    "ExpenseCreate",
    "ExpenseOut",
    "FinanceSummary",
    "ActivityLogOut",
    "ActivityPoint",
    "DashboardStats",
    "HealthResponse",
    "LoginRequest",
    "TokenResponse",
    "SessionUser",
    "TokenData",
]
