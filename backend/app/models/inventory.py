from datetime import datetime, date, timedelta, timezone
from decimal import Decimal
from sqlalchemy import (
    Column, Integer, String, Numeric, Boolean, Date, DateTime,
    ForeignKey, UniqueConstraint, CheckConstraint, Index
)
from sqlalchemy.orm import relationship
from app.database import Base


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(200), nullable=False, index=True)
    sku = Column(String(50), nullable=False)
    category = Column(String(100), nullable=False, index=True)
    unit = Column(String(30), nullable=False, default="Unit")
    quantity_on_hand = Column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    reorder_level = Column(Integer, nullable=False, default=10)
    unit_cost = Column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    unit_price = Column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    expiry_date = Column(Date, nullable=True)
    is_archived = Column(Boolean, nullable=False, default=False, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    __table_args__ = (
        UniqueConstraint("org_id", "sku", name="uq_inventory_org_sku"),
        CheckConstraint("quantity_on_hand >= 0", name="chk_inventory_quantity_non_negative"),
        Index("ix_inventory_org_name", "org_id", "name"),
        Index("ix_inventory_org_category", "org_id", "category"),
    )

    organization = relationship("Organization", back_populates="items")
    movements = relationship("StockMovement", back_populates="item", cascade="all, delete-orphan")

    def calculate_status(self) -> str:
        qty = Decimal(str(self.quantity_on_hand or 0))
        if qty <= 0:
            return "out_of_stock"
        elif qty <= Decimal(str(self.reorder_level)):
            return "low"
        return "in_stock"

    def calculate_expiry_status(self) -> str:
        if not self.expiry_date:
            return "ok"
        today = date.today()
        if self.expiry_date < today:
            return "expired"
        elif self.expiry_date <= today + timedelta(days=30):
            return "expiring_30d"
        return "ok"

    @property
    def total_value(self) -> Decimal:
        qty = Decimal(str(self.quantity_on_hand or 0))
        cost = Decimal(str(self.unit_cost or 0))
        return (qty * cost).quantize(Decimal("0.01"))
