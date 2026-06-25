from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.reading_session import ReadingSession
from app.domain.repositories.reading_session_repository import ReadingSessionRepository
from app.infrastructure.persistence.models.reading_session_model import ReadingSessionModel


class SQLAlchemyReadingSessionRepository(ReadingSessionRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, session: ReadingSession) -> ReadingSession:
        model = ReadingSessionModel(
            id=session.id,
            user_id=session.user_id,
            book_id=session.book_id,
            start_time=session.start_time,
            end_time=session.end_time,
            starting_page=session.starting_page,
            ending_page=session.ending_page,
            minutes_read=session.minutes_read,
            notes=session.notes,
            created_at=session.created_at,
            updated_at=session.updated_at,
        )
        self._session.add(model)
        await self._session.flush()
        return session

    async def update(self, session: ReadingSession) -> ReadingSession:
        result = await self._session.execute(
            select(ReadingSessionModel).where(ReadingSessionModel.id == session.id)
        )
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError(f"Reading session {session.id} not found")

        model.end_time = session.end_time
        model.starting_page = session.starting_page
        model.ending_page = session.ending_page
        model.minutes_read = session.minutes_read
        model.notes = session.notes
        model.updated_at = session.updated_at

        await self._session.flush()
        return session

    async def get_by_id(self, session_id: UUID) -> ReadingSession | None:
        result = await self._session.execute(
            select(ReadingSessionModel).where(ReadingSessionModel.id == session_id)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def list_by_book(
        self, book_id: UUID, limit: int, offset: int
    ) -> tuple[list[ReadingSession], int]:
        query = select(ReadingSessionModel).where(ReadingSessionModel.book_id == book_id)

        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self._session.execute(count_query)
        total = total_result.scalar_one()

        query = query.order_by(ReadingSessionModel.created_at.desc()).limit(limit).offset(offset)
        result = await self._session.execute(query)
        models = result.scalars().all()

        return [self._to_entity(model) for model in models], total

    async def get_active_session(self, user_id: UUID) -> ReadingSession | None:
        result = await self._session.execute(
            select(ReadingSessionModel).where(
                ReadingSessionModel.user_id == user_id,
                ReadingSessionModel.end_time.is_(None)
            )
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def delete(self, session_id: UUID) -> None:
        result = await self._session.execute(
            select(ReadingSessionModel).where(ReadingSessionModel.id == session_id)
        )
        model = result.scalar_one_or_none()
        if model:
            await self._session.delete(model)
            await self._session.flush()

    @staticmethod
    def _to_entity(model: ReadingSessionModel) -> ReadingSession:
        return ReadingSession(
            id=model.id,
            user_id=model.user_id,
            book_id=model.book_id,
            start_time=model.start_time,
            end_time=model.end_time,
            starting_page=model.starting_page,
            ending_page=model.ending_page,
            minutes_read=model.minutes_read,
            notes=model.notes,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )
