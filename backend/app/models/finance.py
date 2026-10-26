from datetime import datetime, date, timezone
from decimal import Decimal
from sqlalchemy import (
    Column, Integer, String, Numeric, Date, DateTime,
    ForeignKey, UniqueConstraint, CheckConstraint, Index
)
from sqlalchemy.orm import relationship
from app.database import Base


class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    item_id = Column(Integer, ForeignKey("inventory_items.id", ondelete="RESTRICT"), nullable=False, index=True)
    invoice_no = Column(String(100), nullable=False)
    supplier_name = Column(String(150), nullable=False)
    quantity = Column(Numeric(12, 2), nullable=False)
    unit_cost = Column(Numeric(12, 2), nullable=False)
    total_amount = Column(Numeric(12, 2), nullable=False)
    payment_status = Column(String(20), nullable=False, default="unpaid")  # paid, unpaid
    purchase_date = Column(Date, nullable=False, default=date.today)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    organization = relationship("Organization", back_populates="purchases")
    item = relationship("InventoryItem")
    creator = relationship("User")


class Donation(Base):
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    donor_name = Column(String(150), nullable=False)
    donation_type = Column(String(20), nullable=False)  # cash, goods
    amount = Column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    item_id = Column(Integer, ForeignKey("inventory_items.id", ondelete="SET NULL"), nullable=True, index=True)
    quantity = Column(Numeric(12, 2), nullable=True)
    declared_value = Column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    purpose = Column(String(255), nullable=True)
    receipt_no = Column(String(100), nullable=False)
    donation_date = Column(Date, nullable=False, default=date.today)
    recorded_by = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint("org_id", "receipt_no", name="uq_donations_org_receipt"),
    )

    organization = relationship("Organization", back_populates="donations")
    item = relationship("InventoryItem")
    recorder = relationship("User")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(50), nullable=False)  # rent, utilities, salaries, transport, supplies, maintenance, other
    amount = Column(Numeric(12, 2), nullable=False)
    description = Column(String(255), nullable=False)
    expense_date = Column(Date, nullable=False, default=date.today)
    receipt_no = Column(String(100), nullable=True)
    recorded_by = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        CheckConstraint("amount >= 0", name="chk_expenses_amount_non_negative"),
    )

    organization = relationship("Organization", back_populates="expenses")
    recorder = relationship("User")
