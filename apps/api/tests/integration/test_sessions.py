import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_reading_sessions(client: AsyncClient):
    # Register and login
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "sessions@example.com",
            "password": "password123",
            "name": "Sessions User",
        },
    )
    res = await client.post(
        "/api/v1/auth/login",
        json={"email": "sessions@example.com", "password": "password123"},
    )
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create book
    res = await client.post(
        "/api/v1/books",
        json={"title": "Session Book", "author": "Tester", "status": "WANT_TO_READ"},
        headers=headers,
    )
    book_id = res.json()["id"]

    # Start session
    res = await client.post(
        "/api/v1/sessions", json={"book_id": book_id}, headers=headers
    )
    assert res.status_code == 201
    session_id = res.json()["id"]

    # Get active session
    res = await client.get("/api/v1/sessions/active", headers=headers)
    assert res.status_code == 200
    assert res.json()["id"] == session_id

    # End session
    res = await client.post(
        f"/api/v1/sessions/{session_id}/end",
        json={"starting_page": 1, "ending_page": 10, "notes": "Good"},
        headers=headers,
    )
    assert res.status_code == 200
    assert res.json()["end_time"] is not None

    # List sessions for book
    res = await client.get(f"/api/v1/sessions/book/{book_id}", headers=headers)
    assert res.status_code == 200
    assert len(res.json()["items"]) == 1
