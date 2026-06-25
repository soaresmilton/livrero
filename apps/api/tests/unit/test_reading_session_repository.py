from datetime import UTC, datetime, timedelta
from uuid import uuid4

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.reading_session import ReadingSession
from app.infrastructure.persistence.repositories.reading_session_repository import (
    SQLAlchemyReadingSessionRepository,
)


@pytest.fixture
def session_repo(db_session: AsyncSession):
    return SQLAlchemyReadingSessionRepository(db_session)


@pytest.mark.asyncio
async def test_session_repository_create_and_get(
    session_repo: SQLAlchemyReadingSessionRepository,
):
    now = datetime.now(UTC)
    s = ReadingSession(
        id=uuid4(),
        user_id=uuid4(),
        book_id=uuid4(),
        start_time=now,
        end_time=None,
        starting_page=1,
        ending_page=None,
        minutes_read=0,
        notes=None,
        created_at=now,
        updated_at=now,
    )

    saved = await session_repo.create(s)
    assert saved.id == s.id

    found = await session_repo.get_by_id(s.id)
    assert found is not None
    assert found.starting_page == 1
    assert found.end_time is None


@pytest.mark.asyncio
async def test_session_repository_update(
    session_repo: SQLAlchemyReadingSessionRepository,
):
    now = datetime.now(UTC)
    s = ReadingSession(
        id=uuid4(),
        user_id=uuid4(),
        book_id=uuid4(),
        start_time=now,
        end_time=None,
        starting_page=10,
        ending_page=None,
        minutes_read=0,
        notes=None,
        created_at=now,
        updated_at=now,
    )
    await session_repo.create(s)

    later = now + timedelta(minutes=30)
    s.end_time = later
    s.ending_page = 20
    s.minutes_read = 30
    s.notes = "Good read"

    updated = await session_repo.update(s)
    assert updated.ending_page == 20

    found = await session_repo.get_by_id(s.id)
    assert found.notes == "Good read"
    assert found.minutes_read == 30


@pytest.mark.asyncio
async def test_session_repository_update_not_found(
    session_repo: SQLAlchemyReadingSessionRepository,
):
    s = ReadingSession(
        id=uuid4(),
        user_id=uuid4(),
        book_id=uuid4(),
        start_time=datetime.now(UTC),
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    with pytest.raises(ValueError):
        await session_repo.update(s)


@pytest.mark.asyncio
async def test_session_repository_get_active_session(
    session_repo: SQLAlchemyReadingSessionRepository,
):
    user_id = uuid4()
    book_id = uuid4()
    now = datetime.now(UTC)

    s = ReadingSession(
        id=uuid4(),
        user_id=user_id,
        book_id=book_id,
        start_time=now,
        created_at=now,
        updated_at=now,
    )
    await session_repo.create(s)

    active = await session_repo.get_active_session(user_id)
    assert active is not None
    assert active.id == s.id

    # End it
    s.end_time = now + timedelta(minutes=10)
    await session_repo.update(s)

    active_after = await session_repo.get_active_session(user_id)
    assert active_after is None


@pytest.mark.asyncio
async def test_session_repository_delete(
    session_repo: SQLAlchemyReadingSessionRepository,
):
    s = ReadingSession(
        id=uuid4(),
        user_id=uuid4(),
        book_id=uuid4(),
        start_time=datetime.now(UTC),
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    await session_repo.create(s)

    await session_repo.delete(s.id)
    assert await session_repo.get_by_id(s.id) is None


@pytest.mark.asyncio
async def test_session_repository_list_by_book(
    session_repo: SQLAlchemyReadingSessionRepository,
):
    book_id = uuid4()
    now = datetime.now(UTC)

    for _ in range(5):
        s = ReadingSession(
            id=uuid4(),
            user_id=uuid4(),
            book_id=book_id,
            start_time=now,
            created_at=now,
            updated_at=now,
        )
        await session_repo.create(s)

    sessions, total = await session_repo.list_by_book(book_id, limit=10, offset=0)
    assert total == 5
    assert len(sessions) == 5
