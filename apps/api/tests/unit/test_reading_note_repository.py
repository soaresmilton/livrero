from datetime import UTC, datetime
from uuid import uuid4

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.book import BookStatus
from app.domain.entities.reading_note import ReadingNote
from app.infrastructure.persistence.models.book_model import BookModel
from app.infrastructure.persistence.models.user_model import UserModel
from app.infrastructure.persistence.repositories.reading_note_repository import (
    SQLAlchemyReadingNoteRepository,
)


@pytest.fixture
async def sample_user_and_book(db_session: AsyncSession):
    user_id = uuid4()
    user = UserModel(
        id=user_id,
        name="Test",
        email=f"test_{user_id}@test.com",
        password_hash="hash",
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    db_session.add(user)

    book_id = uuid4()
    book = BookModel(
        id=book_id,
        user_id=user_id,
        title="Test Book",
        author="Author",
        status=BookStatus.READING,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    db_session.add(book)
    await db_session.commit()
    return user_id, book_id


@pytest.mark.asyncio
async def test_save_and_get_note(db_session: AsyncSession, sample_user_and_book):
    user_id, book_id = sample_user_and_book
    repo = SQLAlchemyReadingNoteRepository(db_session)

    note = ReadingNote(
        id=uuid4(),
        user_id=user_id,
        book_id=book_id,
        content_markdown="# Hello",
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )

    saved = await repo.save(note)
    assert saved.id == note.id
    assert saved.content_markdown == "# Hello"

    retrieved = await repo.get_by_book_id(book_id)
    assert retrieved is not None
    assert retrieved.id == note.id
    assert retrieved.content_markdown == "# Hello"


@pytest.mark.asyncio
async def test_list_recent(db_session: AsyncSession, sample_user_and_book):
    user_id, book_id = sample_user_and_book
    repo = SQLAlchemyReadingNoteRepository(db_session)

    note1 = ReadingNote(
        id=uuid4(),
        user_id=user_id,
        book_id=book_id,
        content_markdown="Note 1",
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    await repo.save(note1)

    recent = await repo.list_recent(user_id)
    assert len(recent) == 1
    assert recent[0].id == note1.id
