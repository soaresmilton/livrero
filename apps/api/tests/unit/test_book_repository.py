from datetime import UTC, datetime
from uuid import uuid4

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.book import Book, BookStatus
from app.infrastructure.persistence.repositories.book_repository import (
    SQLAlchemyBookRepository,
)


@pytest.fixture
def book_repo(db_session: AsyncSession):
    return SQLAlchemyBookRepository(db_session)


@pytest.mark.asyncio
async def test_book_repository_create_and_get(book_repo: SQLAlchemyBookRepository):
    now = datetime.now(UTC)
    book = Book(
        id=uuid4(),
        user_id=uuid4(),
        title="Test Book",
        author="Test Author",
        publisher="Test Pub",
        published_year=2024,
        total_pages=300,
        cover_url=None,
        isbn="1234567890",
        status=BookStatus.READING,
        created_at=now,
        updated_at=now,
        current_page=0,
        started_reading_at=None,
        total_reading_time=0,
        finished_reading_at=None,
    )

    saved = await book_repo.create(book)
    assert saved.id == book.id

    found = await book_repo.get_by_id(book.id)
    assert found is not None
    assert found.title == "Test Book"
    assert found.status == BookStatus.READING


@pytest.mark.asyncio
async def test_book_repository_get_not_found(book_repo: SQLAlchemyBookRepository):
    assert await book_repo.get_by_id(uuid4()) is None


@pytest.mark.asyncio
async def test_book_repository_update(book_repo: SQLAlchemyBookRepository):
    now = datetime.now(UTC)
    book = Book(
        id=uuid4(),
        user_id=uuid4(),
        title="To Update",
        author="Author",
        publisher=None,
        published_year=None,
        total_pages=None,
        cover_url=None,
        isbn=None,
        status=BookStatus.WANT_TO_READ,
        created_at=now,
        updated_at=now,
    )

    await book_repo.create(book)

    book.status = BookStatus.READ
    book.title = "Updated Title"
    updated = await book_repo.update(book)

    assert updated.status == BookStatus.READ
    assert updated.title == "Updated Title"

    found = await book_repo.get_by_id(book.id)
    assert found.status == BookStatus.READ
    assert found.title == "Updated Title"


@pytest.mark.asyncio
async def test_book_repository_update_not_found(book_repo: SQLAlchemyBookRepository):
    book = Book(
        id=uuid4(),
        user_id=uuid4(),
        title="Missing",
        author="Missing",
        status=BookStatus.READ,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    with pytest.raises(ValueError):
        await book_repo.update(book)


@pytest.mark.asyncio
async def test_book_repository_delete(book_repo: SQLAlchemyBookRepository):
    book = Book(
        id=uuid4(),
        user_id=uuid4(),
        title="To Delete",
        author="Author",
        status=BookStatus.READING,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    await book_repo.create(book)

    await book_repo.delete(book.id)

    # Try getting it back
    found = await book_repo.get_by_id(book.id)
    assert (
        found is not None
    )  # It's soft deleted, so get_by_id still returns it, but list won't


@pytest.mark.asyncio
async def test_book_repository_list_by_user(book_repo: SQLAlchemyBookRepository):
    user_id = uuid4()
    now = datetime.now(UTC)
    for i in range(5):
        b = Book(
            id=uuid4(),
            user_id=user_id,
            title=f"Book {i}",
            author="Author",
            status=BookStatus.READING if i % 2 == 0 else BookStatus.WANT_TO_READ,
            created_at=now,
            updated_at=now,
        )
        await book_repo.create(b)

    # List all
    books, total = await book_repo.list_by_user(user_id, limit=10, offset=0)
    assert total == 5
    assert len(books) == 5

    # List by status
    reading_books, reading_total = await book_repo.list_by_user(
        user_id, limit=10, offset=0, status=BookStatus.READING
    )
    assert reading_total == 3

    # Search
    search_books, search_total = await book_repo.list_by_user(
        user_id, limit=10, offset=0, search_query="Book 1"
    )
    assert search_total == 1
    assert search_books[0].title == "Book 1"
