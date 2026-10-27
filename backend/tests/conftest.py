import pytest
from decimal import Decimal
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import settings
settings.ENVIRONMENT = "testing"

from app.database import Base, get_db
from app.main import app
from app.models.organization import Organization
from app.models.user import User
from app.models.inventory import InventoryItem
from app.core.security import get_password_hash, create_access_token

# In-memory SQLite test database with StaticPool
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()

    # Seed baseline organizations
    ngo_org = Organization(id=1, name="Asha Relief", org_type="ngo", currency="INR")
    retail_org = Organization(id=2, name="Sunrise Store", org_type="retail", currency="INR")
    session.add_all([ngo_org, retail_org])
    session.commit()

    # Seed baseline users
    pw_hash = get_password_hash("Demo@12345")
    admin_user = User(id=1, org_id=1, email="admin@asha.org", full_name="Asha Admin", password_hash=pw_hash, role="admin", is_active=True)
    manager_user = User(id=2, org_id=1, email="manager@asha.org", full_name="Asha Manager", password_hash=pw_hash, role="manager", is_active=True)
    volunteer_user = User(id=3, org_id=1, email="volunteer@asha.org", full_name="Asha Volunteer", password_hash=pw_hash, role="volunteer", is_active=True)
    retail_admin = User(id=4, org_id=2, email="owner@sunrise.store", full_name="Store Owner", password_hash=pw_hash, role="admin", is_active=True)

    session.add_all([admin_user, manager_user, volunteer_user, retail_admin])
    session.commit()

    # Seed sample items
    ngo_item = InventoryItem(
        id=1, org_id=1, name="Paracetamol 500mg", sku="MED-PARA-500",
        category="Medical Supplies", unit="box", quantity_on_hand=Decimal("10.00"),
        reorder_level=5, unit_cost=Decimal("25.00"), unit_price=Decimal("0.00")
    )
    retail_item = InventoryItem(
        id=2, org_id=2, name="Wheat Flour 10kg", sku="RET-FLOUR-10",
        category="Groceries", unit="bag", quantity_on_hand=Decimal("20.00"),
        reorder_level=5, unit_cost=Decimal("350.00"), unit_price=Decimal("420.00")
    )
    session.add_all([ngo_item, retail_item])
    session.commit()

    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def get_auth_headers(user_id: int, org_id: int, role: str):
    token = create_access_token(data={"sub": str(user_id), "org": org_id, "role": role})
    return {"Authorization": f"Bearer {token}"}
