from tests.conftest import get_auth_headers


def test_login_success(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@asha.org", "password": "Demo@12345"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "admin@asha.org"
    assert data["user"]["role"] == "admin"
    assert "ro_session" in response.cookies


def test_login_invalid_password(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@asha.org", "password": "WrongPassword"}
    )
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


def test_auth_me_endpoint(client):
    headers = get_auth_headers(user_id=1, org_id=1, role="admin")
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert data["org_name"] == "Asha Relief"
    assert data["email"] == "admin@asha.org"
    assert data["role"] == "admin"


def test_admin_rbac_protection(client):
    volunteer_headers = get_auth_headers(user_id=3, org_id=1, role="volunteer")
    # Volunteers cannot access user management
    response = client.get("/api/v1/users", headers=volunteer_headers)
    assert response.status_code == 403
