from datetime import datetime, date
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_serializer, model_validator


class ItemBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    sku: str = Field(..., min_length=2, max_length=50)
    category: str = Field(..., min_length=2, max_length=100)
    unit: str = Field(default="Unit", max_length=30)
    quantity_on_hand: Decimal = Field(default=Decimal("0.00"), ge=0)
    reorder_level: int = Field(default=10, ge=0)
    unit_cost: Decimal = Field(default=Decimal("0.00"), ge=0)
    unit_price: Decimal = Field(default=Decimal("0.00"), ge=0)
    expiry_date: Optional[date] = None
    is_archived: bool = False


class ItemCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    sku: str = Field(..., min_length=2, max_length=50)
    category: str = Field(..., min_length=2, max_length=100)
    unit: str = Field(default="Unit", max_length=30)
    quantity_on_hand: Decimal = Field(default=Decimal("0.00"), ge=0)
    reorder_level: int = Field(default=10, ge=0)
    unit_cost: Decimal = Field(default=Decimal("0.00"), ge=0)
    unit_price: Decimal = Field(default=Decimal("0.00"), ge=0)
    expiry_date: Optional[date] = None

    # Support legacy field names if provided
    @model_validator(mode="before")
    @classmethod
    def handle_legacy_fields(cls, data):
        if isinstance(data, dict):
            if "quantity" in data and "quantity_on_hand" not in data:
                data["quantity_on_hand"] = data["quantity"]
        return data


class ItemUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=200)
    sku: Optional[str] = Field(None, min_length=2, max_length=50)
    category: Optional[str] = Field(None, min_length=2, max_length=100)
    unit: Optional[str] = Field(None, max_length=30)
    reorder_level: Optional[int] = Field(None, ge=0)
    unit_cost: Optional[Decimal] = Field(None, ge=0)
    unit_price: Optional[Decimal] = Field(None, ge=0)
    expiry_date: Optional[date] = None


class ItemOut(BaseModel):
    id: int
    org_id: int
    name: str
    sku: str
    category: str
    unit: str
    quantity_on_hand: Decimal
    reorder_level: int
    unit_cost: Decimal
    unit_price: Decimal
    expiry_date: Optional[date] = None
    is_archived: bool
    created_at: datetime
    updated_at: datetime
    status: str
    expiry_status: str
    total_value: Decimal

    # Legacy compatibility fields
    @property
    def quantity(self) -> float:
        return float(self.quantity_on_hand)

    @model_validator(mode="before")
    @classmethod
    def populate_derived(cls, data):
        if hasattr(data, "calculate_status"):
            status_val = data.calculate_status()
            expiry_val = data.calculate_expiry_status()
            val_calc = data.total_value
            return {
                "id": data.id,
                "org_id": data.org_id,
                "name": data.name,
                "sku": data.sku,
                "category": data.category,
                "unit": data.unit,
                "quantity_on_hand": data.quantity_on_hand,
                "reorder_level": data.reorder_level,
                "unit_cost": data.unit_cost,
                "unit_price": data.unit_price,
                "expiry_date": data.expiry_date,
                "is_archived": data.is_archived,
                "created_at": data.created_at,
                "updated_at": data.updated_at,
                "status": status_val,
                "expiry_status": expiry_val,
                "total_value": val_calc,
            }
        return data

    model_config = ConfigDict(from_attributes=True)


class StockMovementCreate(BaseModel):
    movement_type: str = Field(..., description="RESTOCK, SALE, RELIEF, or ADJUSTMENT")
    quantity: Decimal = Field(..., gt=0, description="Positive quantity to adjust")
    note: Optional[str] = Field(None, max_length=255)
    reference_type: Optional[str] = Field(None, max_length=50)
    reference_id: Optional[int] = None


class StockMovementOut(BaseModel):
    id: int
    org_id: int
    item_id: int
    movement_type: str
    quantity_delta: Decimal
    unit_value: Decimal
    total_value: Decimal
    reference_type: Optional[str] = None
    reference_id: Optional[int] = None
    note: Optional[str] = None
    actor_user_id: Optional[int] = None
    created_at: datetime
    actor_name: Optional[str] = None
    item_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
