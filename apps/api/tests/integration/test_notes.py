from datetime import UTC, datetime
from uuid import uuid4
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.book import BookStatus
from app.infrastructure.persistence.models.book_model import BookModel
from app.infrastructure.persistence.models.reading_note_model import ReadingNoteModel
from app.infrastructure.persistence.models.user_model import UserModel
from app.infrastructure.security.jwt_service import create_access_token


@pytest.fixture
async def sample_note_data(db_session: AsyncSession):
    user_id = uuid4()
    user = UserModel(
        id=user_id,
        name="Note User",
        email=f"note_{user_id}@example.com",
        password_hash="hash",
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    db_session.add(user)

    book_id = uuid4()
    book = BookModel(
        id=book_id,
        user_id=user_id,
        title="Note Book",
        author="Author",
        status=BookStatus.READING,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    db_session.add(book)

    note = ReadingNoteModel(
        id=uuid4(),
        user_id=user_id,
        book_id=book_id,
        content_markdown="Integration Test",
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    db_session.add(note)
    await db_session.commit()

    return user, book, note


@pytest.mark.asyncio
async def test_get_recent_notes(client: AsyncClient, db_session: AsyncSession, sample_note_data):
    user, book, note = sample_note_data
    token = create_access_token(str(user.id))
    headers = {"Authorization": f"Bearer {token}"}

    res = await client.get("/api/v1/notes/recent", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1
    assert data[0]["content_markdown"] == "Integration Test"


@pytest.mark.asyncio
async def test_save_book_note(client: AsyncClient, db_session: AsyncSession, sample_note_data):
    user, book, note = sample_note_data
    token = create_access_token(str(user.id))
    headers = {"Authorization": f"Bearer {token}"}

    # Update the note
    res = await client.put(
        f"/api/v1/books/{book.id}/note",
        headers=headers,
        json={"content_markdown": "Updated Content"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["content_markdown"] == "Updated Content"


@pytest.mark.asyncio
async def test_get_book_note(client: AsyncClient, db_session: AsyncSession, sample_note_data):
    user, book, note = sample_note_data
    token = create_access_token(str(user.id))
    headers = {"Authorization": f"Bearer {token}"}

    res = await client.get(f"/api/v1/books/{book.id}/note", headers=headers)
    assert res.status_code == 200
    assert res.json()["content_markdown"] == "Integration Test"
