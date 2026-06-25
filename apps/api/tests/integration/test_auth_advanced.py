import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_auth_advanced_flow(client: AsyncClient):
    # Register a user
    res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "advanced@example.com",
            "password": "password123",
            "name": "Advanced User",
        },
    )
    assert res.status_code == 201

    # Login
    res = await client.post(
        "/api/v1/auth/login",
        json={"email": "advanced@example.com", "password": "password123"},
    )
    assert res.status_code == 200
    refresh_token = res.cookies.get("refresh_token")
    assert refresh_token is not None

    # Refresh Token
    res = await client.post(
        "/api/v1/auth/refresh", cookies={"refresh_token": refresh_token}
    )
    assert res.status_code == 200
    new_access_token = res.json()["access_token"]
    assert new_access_token is not None

    # Logout
    res = await client.post(
        "/api/v1/auth/logout", cookies={"refresh_token": refresh_token}
    )
    assert res.status_code == 204

    # Forgot Password
    res = await client.post(
        "/api/v1/auth/forgot-password", json={"email": "advanced@example.com"}
    )
    assert res.status_code == 200

    # We cannot easily test reset_password here without extracting the reset token
    # which is sent via email or logged. But we can test invalid token.
    res = await client.post(
        "/api/v1/auth/reset-password",
        json={"token": "invalid-token", "new_password": "newpassword123"},
    )
    assert res.status_code in [400, 401, 404]


@pytest.mark.asyncio
async def test_auth_errors(client: AsyncClient):
    # Invalid login
    res = await client.post(
        "/api/v1/auth/login",
        json={"email": "nonexistent@example.com", "password": "wrong"},
    )
    assert res.status_code == 401

    # Existing user registration
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "duplicate@example.com",
            "password": "password123",
            "name": "Dup",
        },
    )
    res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "duplicate@example.com",
            "password": "password123",
            "name": "Dup",
        },
    )
    assert res.status_code == 409
