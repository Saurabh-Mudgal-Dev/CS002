from tests.conftest import get_auth_headers


def test_restock_movement_success(client):
    headers = get_auth_headers(user_id=1, org_id=1, role="admin")
    response = client.post(
        "/api/v1/items/1/movements",
        headers=headers,
        json={"movement_type": "RESTOCK", "quantity": 15, "note": "Routine restock"}
    )
    assert response.status_code == 201
    data = response.json()
    assert float(data["quantity_delta"]) == 15.0


def test_relief_over_issue_fails(client):
    headers = get_auth_headers(user_id=1, org_id=1, role="admin")
    # Item 1 has 10 units, attempting to distribute 25 units should fail
    response = client.post(
        "/api/v1/items/1/movements",
        headers=headers,
        json={"movement_type": "RELIEF", "quantity": 25, "note": "Emergency over-issue attempt"}
    )
    assert response.status_code == 409
    assert "Insufficient stock" in response.json()["detail"]


def test_ngo_cannot_make_sale_movement(client):
    headers = get_auth_headers(user_id=1, org_id=1, role="admin")
    # Org 1 is NGO, SALE is prohibited
    response = client.post(
        "/api/v1/items/1/movements",
        headers=headers,
        json={"movement_type": "SALE", "quantity": 2}
    )
    assert response.status_code == 400
    assert "retail organizations" in response.json()["detail"]


def test_tenant_isolation_item_access(client):
    # Org 1 user attempts to adjust Org 2 item (id=2)
    headers = get_auth_headers(user_id=1, org_id=1, role="admin")
    response = client.post(
        "/api/v1/items/2/movements",
        headers=headers,
        json={"movement_type": "RESTOCK", "quantity": 5}
    )
    assert response.status_code == 404
