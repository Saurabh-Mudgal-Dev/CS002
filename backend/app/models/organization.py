from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from app.database import Base


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    org_type = Column(String(20), nullable=False)  # "ngo" or "retail"
    currency = Column(String(10), nullable=False, default="INR")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    items = relationship("InventoryItem", back_populates="organization", cascade="all, delete-orphan")
    movements = relationship("StockMovement", back_populates="organization", cascade="all, delete-orphan")
    purchases = relationship("Purchase", back_populates="organization", cascade="all, delete-orphan")
    donations = relationship("Donation", back_populates="organization", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="organization", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="organization", cascade="all, delete-orphan")
