from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    role = Column(String(50), nullable=False, default="Manager")
    created_at = Column(DateTime, default=datetime.utcnow)


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    sku = Column(String(50), unique=True, index=True, nullable=False)
    category = Column(String(100), nullable=False, index=True)
    context_tag = Column(String(20), nullable=False, default="general")
    quantity = Column(Integer, nullable=False, default=0)
    reorder_level = Column(Integer, nullable=False, default=10)
    unit_price = Column(Float, nullable=False, default=0.0)
    status = Column(String(30), nullable=False, default="In Stock")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def calculate_status(self):
        if self.quantity <= 0:
            return "Critical"
        elif self.quantity <= self.reorder_level:
            return "Low Stock"
        return "In Stock"


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    action_type = Column(String(50), nullable=False)
    item_name = Column(String(200), nullable=False)
    quantity_change = Column(Integer, nullable=False)
    note = Column(String(255), nullable=True)
    performed_by = Column(String(100), nullable=False, default="Admin")
    timestamp = Column(DateTime, default=datetime.utcnow)
