import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_and_list_books(client: AsyncClient):
    # Register and login to get token
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "books@example.com",
            "password": "password123",
            "name": "Books User",
        },
    )
    res = await client.post(
        "/api/v1/auth/login",
        json={"email": "books@example.com", "password": "password123"},
    )
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create book
    res = await client.post(
        "/api/v1/books",
        json={
            "title": "Integration Test Book",
            "author": "Tester",
            "status": "WANT_TO_READ",
        },
        headers=headers,
    )
    assert res.status_code == 201
    book_id = res.json()["id"]

    # List books
    res = await client.get("/api/v1/books", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 1
    assert any(b["id"] == book_id for b in data["items"])

    # Update book
    res = await client.patch(
        f"/api/v1/books/{book_id}", json={"title": "Updated Title"}, headers=headers
    )
    assert res.status_code == 200
    assert res.json()["title"] == "Updated Title"

    # Delete book
    res = await client.delete(f"/api/v1/books/{book_id}", headers=headers)
    assert res.status_code == 204
