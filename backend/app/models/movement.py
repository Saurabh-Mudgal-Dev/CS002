from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.database import Base


class StockMovement(Base):
    __tablename__ = "stock_movements"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    item_id = Column(Integer, ForeignKey("inventory_items.id", ondelete="CASCADE"), nullable=False, index=True)
    movement_type = Column(String(30), nullable=False)  # RESTOCK, SALE, RELIEF, ADJUSTMENT
    quantity_delta = Column(Numeric(12, 2), nullable=False)
    unit_value = Column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    total_value = Column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    reference_type = Column(String(50), nullable=True)  # purchase, donation, manual
    reference_id = Column(Integer, nullable=True)
    note = Column(String(255), nullable=True)
    actor_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        Index("ix_movements_org_created_at", "org_id", "created_at"),
    )

    organization = relationship("Organization", back_populates="movements")
    item = relationship("InventoryItem", back_populates="movements")
    actor = relationship("User")
