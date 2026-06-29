import uuid
from datetime import UTC, datetime

import pytest

from app.application.dto.book_dto import CreateBookRequest, UpdateBookRequest
from app.application.use_cases.manage_books import (
    AddBook,
    ListUserBooks,
    RemoveBook,
    SearchOpenLibrary,
    UpdateBook,
)
from app.domain.entities.book import Book, BookStatus
from app.shared.exceptions import ConflictError


class MockBookRepository:
    def __init__(self):
        self.books = {}
        self.created = []
        self.updated = []
        self.deleted = []

    async def create(self, book: Book) -> Book:
        self.books[book.id] = book
        self.created.append(book)
        return book

    async def update(self, book: Book) -> Book:
        self.books[book.id] = book
        self.updated.append(book)
        return book

    async def get_by_id(self, book_id: uuid.UUID) -> Book | None:
        return self.books.get(book_id)

    async def list_by_user(self, user_id, size, offset, status=None, search_query=None):
        user_books = [b for b in self.books.values() if b.user_id == user_id]
        if status:
            user_books = [b for b in user_books if b.status == status]
        if search_query:
            user_books = [
                b for b in user_books if search_query.lower() in b.title.lower()
            ]
        total = len(user_books)
        return user_books[offset : offset + size], total

    async def delete(self, book_id: uuid.UUID) -> None:
        if book_id in self.books:
            self.deleted.append(book_id)
            del self.books[book_id]


class MockOpenLibrary:
    async def search(self, query: str, limit: int = 5):
        return [{"title": "Mock Book", "author_name": ["Author"], "key": "123"}]


@pytest.fixture
def book_repo():
    return MockBookRepository()


@pytest.fixture
def open_library():
    return MockOpenLibrary()


@pytest.mark.asyncio
async def test_add_book(book_repo):
    use_case = AddBook(book_repo)
    user_id = uuid.uuid4()
    request = CreateBookRequest(
        title="Test Book",
        author="Author",
        publisher="Publisher",
        published_year=2020,
        total_pages=100,
        status=BookStatus.WANT_TO_READ,
    )
    response = await use_case.execute(user_id, request)
    assert response.title == "Test Book"
    assert response.user_id == user_id
    assert len(book_repo.created) == 1


@pytest.mark.asyncio
async def test_update_book(book_repo):
    user_id = uuid.uuid4()
    book_id = uuid.uuid4()
    book = Book(
        id=book_id,
        user_id=user_id,
        title="Old",
        author="Old",
        status=BookStatus.READING,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    book_repo.books[book_id] = book

    use_case = UpdateBook(book_repo)
    request = UpdateBookRequest(title="New", status=BookStatus.READ)
    response = await use_case.execute(user_id, book_id, request)

    assert response.title == "New"
    assert response.status == BookStatus.READ
    assert response.finished_reading_at is not None


@pytest.mark.asyncio
async def test_update_book_not_found(book_repo):
    use_case = UpdateBook(book_repo)
    from fastapi import HTTPException

    with pytest.raises(HTTPException):
        await use_case.execute(
            uuid.uuid4(), uuid.uuid4(), UpdateBookRequest(title="New")
        )


@pytest.mark.asyncio
async def test_update_book_forbidden(book_repo):
    user_id = uuid.uuid4()
    book_id = uuid.uuid4()
    book = Book(
        id=book_id,
        user_id=user_id,
        title="Old",
        author="Old",
        status=BookStatus.READING,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    book_repo.books[book_id] = book

    use_case = UpdateBook(book_repo)
    from fastapi import HTTPException

    with pytest.raises(HTTPException):
        await use_case.execute(uuid.uuid4(), book_id, UpdateBookRequest(title="New"))


@pytest.mark.asyncio
async def test_update_book_revert_read(book_repo):
    user_id = uuid.uuid4()
    book_id = uuid.uuid4()
    book = Book(
        id=book_id,
        user_id=user_id,
        title="Old",
        author="Old",
        status=BookStatus.READ,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    book_repo.books[book_id] = book

    use_case = UpdateBook(book_repo)
    with pytest.raises(ConflictError):
        await use_case.execute(
            user_id, book_id, UpdateBookRequest(status=BookStatus.READING)
        )


@pytest.mark.asyncio
async def test_list_books(book_repo):
    user_id = uuid.uuid4()
    book = Book(
        id=uuid.uuid4(),
        user_id=user_id,
        title="A",
        author="B",
        status=BookStatus.READING,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    book_repo.books[book.id] = book

    use_case = ListUserBooks(book_repo)
    response = await use_case.execute(user_id, page=1, size=10)
    assert response.total == 1
    assert len(response.items) == 1


@pytest.mark.asyncio
async def test_search_open_library(open_library):
    use_case = SearchOpenLibrary(open_library)
    res = await use_case.execute("query")
    assert len(res) == 1
    assert res[0]["title"] == "Mock Book"


@pytest.mark.asyncio
async def test_remove_book(book_repo):
    user_id = uuid.uuid4()
    book_id = uuid.uuid4()
    book = Book(
        id=book_id,
        user_id=user_id,
        title="A",
        author="B",
        status=BookStatus.READING,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    book_repo.books[book_id] = book

    use_case = RemoveBook(book_repo)
    await use_case.execute(user_id, book_id)
    assert len(book_repo.deleted) == 1


@pytest.mark.asyncio
async def test_remove_book_not_found(book_repo):
    use_case = RemoveBook(book_repo)
    from fastapi import HTTPException

    with pytest.raises(HTTPException):
        await use_case.execute(uuid.uuid4(), uuid.uuid4())


@pytest.mark.asyncio
async def test_remove_book_forbidden(book_repo):
    user_id = uuid.uuid4()
    book_id = uuid.uuid4()
    book = Book(
        id=book_id,
        user_id=user_id,
        title="A",
        author="B",
        status=BookStatus.READING,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    book_repo.books[book_id] = book

    use_case = RemoveBook(book_repo)
    from fastapi import HTTPException

    with pytest.raises(HTTPException):
        await use_case.execute(uuid.uuid4(), book_id)
