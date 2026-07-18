from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.entities.reading_session import ReadingSession


class ReadingSessionRepository(ABC):
    """Repository interface for persisting and querying reading sessions."""

    @abstractmethod
    async def create(self, session: ReadingSession) -> ReadingSession:
        """Persist a new reading session."""
        pass

    @abstractmethod
    async def update(self, session: ReadingSession) -> ReadingSession:
        """Persist changes to an existing reading session."""
        pass

    @abstractmethod
    async def get_by_id(self, session_id: UUID) -> ReadingSession | None:
        """Fetch a reading session by its id, or None if it doesn't exist."""
        pass

    @abstractmethod
    async def list_by_book(
        self, book_id: UUID, limit: int, offset: int
    ) -> tuple[list[ReadingSession], int]:
        """List reading sessions for a book with pagination.

        Returns a tuple of (sessions, total_count).
        """
        pass

    @abstractmethod
    async def get_active_session(self, user_id: UUID) -> ReadingSession | None:
        """Fetch the user's currently in-progress session (no end_time), if any."""
        pass

    @abstractmethod
    async def delete(self, session_id: UUID) -> None:
        """Delete a reading session by its id."""
        pass
