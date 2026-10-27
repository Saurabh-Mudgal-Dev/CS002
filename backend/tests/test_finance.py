from decimal import Decimal
from tests.conftest import get_auth_headers


def test_purchase_creates_record_and_restocks(client, db_session):
    from app.models.inventory import InventoryItem
    headers = get_auth_headers(user_id=1, org_id=1, role="admin")

    initial_item = db_session.query(InventoryItem).filter(InventoryItem.id == 1).first()
    initial_qty = initial_item.quantity_on_hand

    response = client.post(
        "/api/v1/purchases",
        headers=headers,
        json={
            "item_id": 1,
            "invoice_no": "INV-2026-TEST",
            "supplier_name": "Apex Pharma",
            "quantity": 20,
            "unit_cost": 28.50,
            "payment_status": "paid"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert float(data["total_amount"]) == 20 * 28.50

    db_session.refresh(initial_item)
    assert initial_item.quantity_on_hand == initial_qty + Decimal("20.00")
    assert initial_item.unit_cost == Decimal("28.50")


def test_goods_donation_restocks_inventory(client, db_session):
    from app.models.inventory import InventoryItem
    headers = get_auth_headers(user_id=1, org_id=1, role="admin")

    item = db_session.query(InventoryItem).filter(InventoryItem.id == 1).first()
    start_qty = item.quantity_on_hand

    response = client.post(
        "/api/v1/donations",
        headers=headers,
        json={
            "donor_name": "Health Aid NGO",
            "donation_type": "goods",
            "item_id": 1,
            "quantity": 10,
            "declared_value": 250.00,
            "receipt_no": "REC-TEST-GOODS-101"
        }
    )
    assert response.status_code == 201
    db_session.refresh(item)
    assert item.quantity_on_hand == start_qty + Decimal("10.00")


def test_duplicate_donation_receipt_returns_conflict(client):
    headers = get_auth_headers(user_id=1, org_id=1, role="admin")
    payload = {
        "donor_name": "Global Giving",
        "donation_type": "cash",
        "amount": 5000.00,
        "receipt_no": "REC-UNIQUE-999"
    }
    res1 = client.post("/api/v1/donations", headers=headers, json=payload)
    assert res1.status_code == 201

    res2 = client.post("/api/v1/donations", headers=headers, json=payload)
    assert res2.status_code == 409
    assert "already exists" in res2.json()["detail"]


def test_expense_and_finance_summary(client):
    headers = get_auth_headers(user_id=1, org_id=1, role="admin")
    exp_res = client.post(
        "/api/v1/expenses",
        headers=headers,
        json={
            "category": "utilities",
            "amount": 1200.00,
            "description": "Monthly warehouse electricity",
            "receipt_no": "UTIL-881"
        }
    )
    assert exp_res.status_code == 201

    summary_res = client.get("/api/v1/finance/summary", headers=headers)
    assert summary_res.status_code == 200
    sdata = summary_res.json()
    assert "net_position" in sdata
    assert "inventory_value" in sdata


def test_reports_endpoints(client):
    headers = get_auth_headers(user_id=1, org_id=1, role="admin")

    # 1. Inventory CSV
    inv_csv = client.get("/api/v1/reports/inventory.csv", headers=headers)
    assert inv_csv.status_code == 200
    assert inv_csv.headers["content-type"].startswith("text/csv")
    assert "Item ID" in inv_csv.text

    # 2. Finance CSV
    fin_csv = client.get("/api/v1/reports/finance.csv", headers=headers)
    assert fin_csv.status_code == 200
    assert fin_csv.headers["content-type"].startswith("text/csv")
    assert "PURCHASES" in fin_csv.text

    # 3. PDF Report
    pdf_res = client.get("/api/v1/reports/report.pdf", headers=headers)
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert pdf_res.content.startswith(b"%PDF-")
