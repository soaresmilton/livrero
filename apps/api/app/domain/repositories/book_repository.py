from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.entities.book import Book, BookStatus


class BookRepository(ABC):
    @abstractmethod
    async def create(self, book: Book) -> Book:
        pass

    @abstractmethod
    async def get_by_id(self, book_id: UUID) -> Book | None:
        pass

    @abstractmethod
    async def update(self, book: Book) -> Book:
        pass

    @abstractmethod
    async def delete(self, book_id: UUID) -> None:
        pass

    @abstractmethod
    async def list_by_user(
        self, user_id: UUID, limit: int, offset: int, status: BookStatus | None = None, search_query: str | None = None
    ) -> tuple[list[Book], int]:
        pass
