from datetime import datetime, date
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class PurchaseCreate(BaseModel):
    item_id: int
    invoice_no: str = Field(..., min_length=2, max_length=100)
    supplier_name: str = Field(..., min_length=2, max_length=150)
    quantity: Decimal = Field(..., gt=0)
    unit_cost: Decimal = Field(..., ge=0)
    payment_status: str = Field(default="unpaid", description="'paid' or 'unpaid'")
    purchase_date: Optional[date] = None


class PurchaseOut(BaseModel):
    id: int
    org_id: int
    item_id: int
    invoice_no: str
    supplier_name: str
    quantity: Decimal
    unit_cost: Decimal
    total_amount: Decimal
    payment_status: str
    purchase_date: date
    created_by: int
    created_at: datetime
    item_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class DonationCreate(BaseModel):
    donor_name: str = Field(..., min_length=2, max_length=150)
    donation_type: str = Field(..., description="'cash' or 'goods'")
    amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    item_id: Optional[int] = None
    quantity: Optional[Decimal] = Field(None, gt=0)
    declared_value: Decimal = Field(default=Decimal("0.00"), ge=0)
    purpose: Optional[str] = Field(None, max_length=255)
    receipt_no: str = Field(..., min_length=2, max_length=100)
    donation_date: Optional[date] = None


class DonationOut(BaseModel):
    id: int
    org_id: int
    donor_name: str
    donation_type: str
    amount: Decimal
    item_id: Optional[int] = None
    quantity: Optional[Decimal] = None
    declared_value: Decimal
    purpose: Optional[str] = None
    receipt_no: str
    donation_date: date
    recorded_by: int
    created_at: datetime
    item_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ExpenseCreate(BaseModel):
    category: str = Field(..., min_length=2, max_length=50)
    amount: Decimal = Field(..., gt=0)
    description: str = Field(..., min_length=2, max_length=255)
    expense_date: Optional[date] = None
    receipt_no: Optional[str] = Field(None, max_length=100)


class ExpenseOut(BaseModel):
    id: int
    org_id: int
    category: str
    amount: Decimal
    description: str
    expense_date: date
    receipt_no: Optional[str] = None
    recorded_by: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FinanceSummary(BaseModel):
    cash_income: Decimal
    expenses: Decimal
    net_position: Decimal
    inventory_value: Decimal
    total_purchases: Decimal
    total_donations: Decimal
    total_expenses: Decimal
