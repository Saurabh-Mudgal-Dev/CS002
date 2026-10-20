from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class ItemBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    sku: str = Field(..., min_length=2, max_length=50)
    category: str = Field(..., min_length=2, max_length=100)
    context_tag: str = Field(default="general")
    quantity: int = Field(default=0, ge=0)
    reorder_level: int = Field(default=10, ge=1)
    unit_price: float = Field(default=0.0, ge=0.0)


class ItemCreate(ItemBase):
    pass


class ItemUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    category: Optional[str] = None
    context_tag: Optional[str] = None
    quantity: Optional[int] = Field(None, ge=0)
    reorder_level: Optional[int] = Field(None, ge=1)
    unit_price: Optional[float] = Field(None, ge=0.0)


class ItemOut(ItemBase):
    id: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class StockAdjustRequest(BaseModel):
    adjustment_type: str = Field(..., description="RELIEF_DISTRIBUTION, SALE, or RESTOCK")
    quantity: int = Field(..., gt=0)
    note: Optional[str] = Field(None, max_length=255)
    performed_by: Optional[str] = Field("Manager", max_length=100)


class ActivityLogOut(BaseModel):
    id: int
    action_type: str
    item_name: str
    quantity_change: int
    note: Optional[str] = None
    performed_by: str
    timestamp: datetime

    class Config:
        from_attributes = True


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True


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
