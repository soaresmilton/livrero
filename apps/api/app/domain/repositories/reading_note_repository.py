import abc
import uuid

from app.domain.entities.reading_note import ReadingNote


class ReadingNoteRepository(abc.ABC):
    """Repository interface for persisting and querying reading notes."""

    @abc.abstractmethod
    async def save(self, note: ReadingNote) -> ReadingNote:
        """Create or update a note"""
        pass

    @abc.abstractmethod
    async def get_by_book_id(self, book_id: uuid.UUID) -> ReadingNote | None:
        """Get the main note for a book"""
        pass

    @abc.abstractmethod
    async def list_recent(
        self, user_id: uuid.UUID, limit: int = 10
    ) -> list[ReadingNote]:
        """List recently updated notes for a user"""
        pass
