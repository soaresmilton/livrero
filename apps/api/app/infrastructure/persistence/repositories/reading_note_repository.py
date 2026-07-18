import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.reading_note import ReadingNote
from app.domain.repositories.reading_note_repository import ReadingNoteRepository
from app.infrastructure.persistence.models.reading_note_model import ReadingNoteModel


class SQLAlchemyReadingNoteRepository(ReadingNoteRepository):
    """SQLAlchemy implementation of the ReadingNoteRepository interface."""

    def __init__(self, session: AsyncSession):
        self.session = session

    def _to_entity(self, model: ReadingNoteModel) -> ReadingNote:
        """Map an ORM ReadingNoteModel to a ReadingNote domain entity."""
        return ReadingNote(
            id=model.id,
            user_id=model.user_id,
            book_id=model.book_id,
            content_markdown=model.content_markdown,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _to_model(self, entity: ReadingNote) -> ReadingNoteModel:
        """Map a ReadingNote domain entity to an ORM ReadingNoteModel."""
        return ReadingNoteModel(
            id=entity.id,
            user_id=entity.user_id,
            book_id=entity.book_id,
            content_markdown=entity.content_markdown,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )

    async def save(self, note: ReadingNote) -> ReadingNote:
        """Insert or update a reading note (merged by primary key)."""
        model = self._to_model(note)
        merged = await self.session.merge(model)
        await self.session.flush()
        return self._to_entity(merged)

    async def get_by_book_id(self, book_id: uuid.UUID) -> ReadingNote | None:
        """Fetch the note for a book, or None if it has none."""
        query = select(ReadingNoteModel).where(ReadingNoteModel.book_id == book_id)
        result = await self.session.execute(query)
        model = result.scalar_one_or_none()
        if model:
            return self._to_entity(model)
        return None

    async def list_recent(
        self, user_id: uuid.UUID, limit: int = 10
    ) -> list[ReadingNote]:
        """List a user's most recently updated notes."""
        query = (
            select(ReadingNoteModel)
            .where(ReadingNoteModel.user_id == user_id)
            .order_by(ReadingNoteModel.updated_at.desc())
            .limit(limit)
        )
        result = await self.session.execute(query)
        models = result.scalars().all()
        return [self._to_entity(m) for m in models]
