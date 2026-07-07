from datetime import UTC, datetime
from uuid import uuid4

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.persistence.models.user_model import UserModel
from app.infrastructure.security.jwt_service import create_access_token


@pytest.fixture
async def auth_user(db_session: AsyncSession):
    user_id = uuid4()
    user = UserModel(
        id=user_id,
        name="Goal User",
        email=f"goal_{user_id}@example.com",
        password_hash="hash",
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    db_session.add(user)
    await db_session.commit()
    return user


@pytest.mark.asyncio
async def test_get_goal_empty(client: AsyncClient, auth_user):
    token = create_access_token(str(auth_user.id))
    headers = {"Authorization": f"Bearer {token}"}

    res = await client.get("/api/v1/goals?year=2026", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["year"] == 2026
    assert data["books_goal"] == 0
    assert data["pages_goal"] == 0
    assert data["minutes_goal"] == 0


@pytest.mark.asyncio
async def test_upsert_then_get_goal(client: AsyncClient, auth_user):
    token = create_access_token(str(auth_user.id))
    headers = {"Authorization": f"Bearer {token}"}

    res = await client.put(
        "/api/v1/goals/2026",
        headers=headers,
        json={"books_goal": 24, "pages_goal": 8000, "minutes_goal": 6000},
    )
    assert res.status_code == 200
    created = res.json()
    assert created["books_goal"] == 24
    assert created["pages_goal"] == 8000
    assert created["minutes_goal"] == 6000

    res = await client.get("/api/v1/goals?year=2026", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["books_goal"] == 24
    assert data["id"] == created["id"]


@pytest.mark.asyncio
async def test_upsert_is_idempotent_per_year(client: AsyncClient, auth_user):
    token = create_access_token(str(auth_user.id))
    headers = {"Authorization": f"Bearer {token}"}

    first = await client.put(
        "/api/v1/goals/2027",
        headers=headers,
        json={"books_goal": 10, "pages_goal": 0, "minutes_goal": 0},
    )
    second = await client.put(
        "/api/v1/goals/2027",
        headers=headers,
        json={"books_goal": 12, "pages_goal": 100, "minutes_goal": 50},
    )
    assert first.status_code == 200
    assert second.status_code == 200
    # Same row updated, not a new one
    assert first.json()["id"] == second.json()["id"]
    assert second.json()["books_goal"] == 12


@pytest.mark.asyncio
async def test_goals_require_auth(client: AsyncClient):
    res = await client.get("/api/v1/goals?year=2026")
    assert res.status_code in (401, 403)
