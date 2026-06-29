from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.entities.reading_session import ReadingSession


class ReadingSessionRepository(ABC):
    @abstractmethod
    async def create(self, session: ReadingSession) -> ReadingSession:
        pass

    @abstractmethod
    async def update(self, session: ReadingSession) -> ReadingSession:
        pass

    @abstractmethod
    async def get_by_id(self, session_id: UUID) -> ReadingSession | None:
        pass

    @abstractmethod
    async def list_by_book(
        self, book_id: UUID, limit: int, offset: int
    ) -> tuple[list[ReadingSession], int]:
        pass

    @abstractmethod
    async def get_active_session(self, user_id: UUID) -> ReadingSession | None:
        pass

    @abstractmethod
    async def delete(self, session_id: UUID) -> None:
        pass
