from datetime import UTC, datetime
from uuid import uuid4

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.book import BookStatus
from app.infrastructure.persistence.models.book_model import BookModel
from app.infrastructure.persistence.models.reading_session_model import (
    ReadingSessionModel,
)
from app.infrastructure.persistence.models.user_model import UserModel
from app.infrastructure.security.jwt_service import create_access_token


@pytest.fixture
async def dashboard_data(db_session: AsyncSession):
    now = datetime.now(UTC)
    user_id = uuid4()
    user = UserModel(
        id=user_id,
        name="Dash User",
        email=f"dash_{user_id}@example.com",
        password_hash="hash",
        created_at=now,
        updated_at=now,
    )
    db_session.add(user)

    book_id = uuid4()
    book = BookModel(
        id=book_id,
        user_id=user_id,
        title="Finished Book",
        author="Author",
        total_pages=200,
        status=BookStatus.READ,
        created_at=now,
        updated_at=now,
        finished_reading_at=now,
    )
    db_session.add(book)

    session = ReadingSessionModel(
        id=uuid4(),
        user_id=user_id,
        book_id=book_id,
        start_time=now,
        end_time=now,
        starting_page=0,
        ending_page=50,
        minutes_read=40,
    )
    db_session.add(session)
    await db_session.commit()

    return user, book, now.year


@pytest.mark.asyncio
async def test_dashboard_summary(client: AsyncClient, dashboard_data):
    user, book, year = dashboard_data
    headers = {"Authorization": f"Bearer {create_access_token(str(user.id))}"}

    res = await client.get(f"/api/v1/dashboard/summary?year={year}", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["year"] == year
    assert data["completed_books_total"] == 1
    assert data["completed_books_year"] == 1
    assert data["pages_read"] == 50
    assert data["minutes_read"] == 40
    assert data["current_streak"] == 1
    assert data["goals"]["books"]["target"] == 0


@pytest.mark.asyncio
async def test_dashboard_summary_with_goal_progress(
    client: AsyncClient, dashboard_data
):
    user, book, year = dashboard_data
    headers = {"Authorization": f"Bearer {create_access_token(str(user.id))}"}

    await client.put(
        f"/api/v1/goals/{year}",
        headers=headers,
        json={"books_goal": 4, "pages_goal": 100, "minutes_goal": 80},
    )

    res = await client.get(f"/api/v1/dashboard/summary?year={year}", headers=headers)
    data = res.json()
    assert data["goals"]["books"]["target"] == 4
    assert data["goals"]["books"]["current"] == 1
    assert data["goals"]["pages"]["current"] == 50
    assert data["goals"]["pages"]["percent"] == 50.0


@pytest.mark.asyncio
async def test_dashboard_heatmap(client: AsyncClient, dashboard_data):
    user, book, year = dashboard_data
    headers = {"Authorization": f"Bearer {create_access_token(str(user.id))}"}

    res = await client.get(f"/api/v1/dashboard/heatmap?year={year}", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["year"] == year
    assert len(data["days"]) == 1
    assert data["days"][0]["count"] == 40


@pytest.mark.asyncio
async def test_dashboard_requires_auth(client: AsyncClient):
    res = await client.get("/api/v1/dashboard/summary")
    assert res.status_code in (401, 403)
