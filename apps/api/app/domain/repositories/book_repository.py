from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.entities.book import Book, BookStatus


class BookRepository(ABC):
    """Repository interface for persisting and querying books."""

    @abstractmethod
    async def create(self, book: Book) -> Book:
        """Persist a new book."""
        pass

    @abstractmethod
    async def get_by_id(self, book_id: UUID) -> Book | None:
        """Fetch a book by its id, or None if it doesn't exist."""
        pass

    @abstractmethod
    async def update(self, book: Book) -> Book:
        """Persist changes to an existing book."""
        pass

    @abstractmethod
    async def delete(self, book_id: UUID) -> None:
        """Delete a book by its id."""
        pass

    @abstractmethod
    async def list_by_user(
        self,
        user_id: UUID,
        limit: int,
        offset: int,
        status: BookStatus | None = None,
        search_query: str | None = None,
    ) -> tuple[list[Book], int]:
        """List a user's books with pagination, optional status and search filters.

        Returns a tuple of (books, total_count).
        """
        pass
