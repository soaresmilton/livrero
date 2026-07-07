import uuid
from dataclasses import dataclass
from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.book import BookStatus
from app.infrastructure.persistence.models.book_model import BookModel
from app.infrastructure.persistence.models.reading_session_model import (
    ReadingSessionModel,
)


@dataclass
class SessionStat:
    start_time: datetime
    minutes_read: int
    pages: int


@dataclass
class CurrentBookStat:
    id: uuid.UUID
    title: str
    author: str
    cover_url: str | None
    total_pages: int | None
    current_page: int


class SQLAlchemyStatsRepository:
    """Read-only aggregation queries for the dashboard."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_finished_sessions(self, user_id: uuid.UUID) -> list[SessionStat]:
        query = select(
            ReadingSessionModel.start_time,
            ReadingSessionModel.minutes_read,
            ReadingSessionModel.starting_page,
            ReadingSessionModel.ending_page,
        ).where(
            ReadingSessionModel.user_id == user_id,
            ReadingSessionModel.end_time.is_not(None),
        )
        result = await self.session.execute(query)

        stats: list[SessionStat] = []
        for start_time, minutes_read, starting_page, ending_page in result.all():
            pages = 0
            if starting_page is not None and ending_page is not None:
                pages = max(0, ending_page - starting_page)
            stats.append(
                SessionStat(
                    start_time=start_time,
                    minutes_read=minutes_read or 0,
                    pages=pages,
                )
            )
        return stats

    async def count_completed_books(self, user_id: uuid.UUID) -> int:
        query = select(func.count()).where(
            BookModel.user_id == user_id,
            ~BookModel.is_deleted,
            BookModel.status == BookStatus.READ,
        )
        result = await self.session.execute(query)
        return int(result.scalar_one())

    async def count_completed_books_in_year(self, user_id: uuid.UUID, year: int) -> int:
        query = select(func.count()).where(
            BookModel.user_id == user_id,
            ~BookModel.is_deleted,
            BookModel.status == BookStatus.READ,
            BookModel.finished_reading_at.is_not(None),
            func.extract("year", BookModel.finished_reading_at) == year,
        )
        result = await self.session.execute(query)
        return int(result.scalar_one())

    async def get_current_book(self, user_id: uuid.UUID) -> CurrentBookStat | None:
        # Prefer the book of an active (not yet ended) session
        active_query = (
            select(ReadingSessionModel.book_id)
            .where(
                ReadingSessionModel.user_id == user_id,
                ReadingSessionModel.end_time.is_(None),
            )
            .order_by(ReadingSessionModel.start_time.desc())
            .limit(1)
        )
        book_id = (await self.session.execute(active_query)).scalar_one_or_none()

        if book_id is None:
            # Fall back to the most recently updated READING book
            reading_query = (
                select(BookModel.id)
                .where(
                    BookModel.user_id == user_id,
                    ~BookModel.is_deleted,
                    BookModel.status == BookStatus.READING,
                )
                .order_by(BookModel.updated_at.desc())
                .limit(1)
            )
            book_id = (await self.session.execute(reading_query)).scalar_one_or_none()

        if book_id is None:
            return None

        book = (
            await self.session.execute(select(BookModel).where(BookModel.id == book_id))
        ).scalar_one_or_none()
        if book is None:
            return None

        current_page_query = select(
            func.coalesce(func.max(ReadingSessionModel.ending_page), 0)
        ).where(ReadingSessionModel.book_id == book_id)
        current_page = int(
            (await self.session.execute(current_page_query)).scalar_one()
        )

        return CurrentBookStat(
            id=book.id,
            title=book.title,
            author=book.author,
            cover_url=book.cover_url,
            total_pages=book.total_pages,
            current_page=current_page,
        )
