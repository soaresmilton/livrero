import uuid
from datetime import UTC, datetime

from app.application.dto.book_dto import (
    BookResponse,
    CreateBookRequest,
    OpenLibraryBookResponse,
    PaginatedBookResponse,
    UpdateBookRequest,
)
from app.domain.entities.book import Book, BookStatus
from app.domain.repositories.book_repository import BookRepository
from app.infrastructure.integrations.open_library import OpenLibraryIntegration


class AddBook:
    def __init__(self, book_repository: BookRepository):
        self._book_repository = book_repository

    async def execute(
        self, user_id: uuid.UUID, request: CreateBookRequest
    ) -> BookResponse:
        now = datetime.now(UTC)
        book = Book(
            id=uuid.uuid4(),
            user_id=user_id,
            title=request.title,
            author=request.author,
            publisher=request.publisher,
            published_year=request.published_year,
            total_pages=request.total_pages,
            cover_url=request.cover_url,
            isbn=request.isbn,
            status=request.status,
            created_at=now,
            updated_at=now,
        )
        saved_book = await self._book_repository.create(book)
        return BookResponse.model_validate(saved_book)


class UpdateBook:
    def __init__(self, book_repository: BookRepository):
        self._book_repository = book_repository

    async def execute(
        self, user_id: uuid.UUID, book_id: uuid.UUID, request: UpdateBookRequest
    ) -> BookResponse:
        book = await self._book_repository.get_by_id(book_id)
        if not book:
            from app.shared.exceptions import not_found

            raise not_found("Book not found")

        if book.user_id != user_id:
            from app.shared.exceptions import forbidden

            raise forbidden("You don't have permission to update this book")

        if request.title is not None:
            book.title = request.title
        if request.author is not None:
            book.author = request.author
        if request.publisher is not None:
            book.publisher = request.publisher
        if request.published_year is not None:
            book.published_year = request.published_year
        if request.total_pages is not None:
            book.total_pages = request.total_pages
        if request.cover_url is not None:
            book.cover_url = request.cover_url
        if request.isbn is not None:
            book.isbn = request.isbn
        if request.status is not None:
            if book.status == BookStatus.READ and request.status in (
                BookStatus.WANT_TO_READ,
                BookStatus.READING,
            ):
                from app.shared.exceptions import ConflictError

                raise ConflictError(
                    "Cannot revert a completed book to reading or want to read"
                )

            if request.status == BookStatus.READ and book.status != BookStatus.READ:
                book.finished_reading_at = datetime.now(UTC)
            elif request.status != BookStatus.READ:
                book.finished_reading_at = None

            book.status = request.status
        book.updated_at = datetime.now(UTC)

        updated_book = await self._book_repository.update(book)
        return BookResponse.model_validate(updated_book)


class ListUserBooks:
    def __init__(self, book_repository: BookRepository):
        self._book_repository = book_repository

    async def execute(
        self,
        user_id: uuid.UUID,
        page: int,
        size: int,
        status: BookStatus | None = None,
        search_query: str | None = None,
    ) -> PaginatedBookResponse:
        offset = (page - 1) * size
        books, total = await self._book_repository.list_by_user(
            user_id, size, offset, status, search_query
        )

        pages = (total + size - 1) // size if size > 0 else 0

        return PaginatedBookResponse(
            items=[BookResponse.model_validate(book) for book in books],
            total=total,
            page=page,
            size=size,
            pages=pages,
        )


class SearchOpenLibrary:
    def __init__(self, open_library: OpenLibraryIntegration):
        self._open_library = open_library

    async def execute(
        self, query: str, limit: int = 5
    ) -> list[OpenLibraryBookResponse]:
        return await self._open_library.search(query, limit)


class RemoveBook:
    def __init__(self, book_repository: BookRepository):
        self._book_repository = book_repository

    async def execute(self, user_id: uuid.UUID, book_id: uuid.UUID) -> None:
        book = await self._book_repository.get_by_id(book_id)
        if not book:
            from app.shared.exceptions import not_found

            raise not_found("Book not found")

        if book.user_id != user_id:
            from app.shared.exceptions import forbidden

            raise forbidden("You don't have permission to delete this book")

        await self._book_repository.delete(book_id)
