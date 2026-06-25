from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domain.entities.book import Book, BookStatus
from app.domain.repositories.book_repository import BookRepository
from app.infrastructure.persistence.models.book_model import BookModel


class SQLAlchemyBookRepository(BookRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, book: Book) -> Book:
        model = BookModel(
            id=book.id,
            user_id=book.user_id,
            title=book.title,
            author=book.author,
            publisher=book.publisher,
            published_year=book.published_year,
            total_pages=book.total_pages,
            cover_url=book.cover_url,
            isbn=book.isbn,
            status=book.status,
            genres=book.genres,
            rating=book.rating,
            created_at=book.created_at,
            updated_at=book.updated_at,
            finished_reading_at=book.finished_reading_at,
        )
        self._session.add(model)
        await self._session.flush()
        return book

    async def get_by_id(self, book_id: UUID) -> Book | None:
        result = await self._session.execute(
            select(BookModel)
            .options(selectinload(BookModel.sessions))
            .where(BookModel.id == book_id)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def update(self, book: Book) -> Book:
        result = await self._session.execute(
            select(BookModel).where(BookModel.id == book.id)
        )
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError(f"Book {book.id} not found")

        model.title = book.title
        model.author = book.author
        model.publisher = book.publisher
        model.published_year = book.published_year
        model.total_pages = book.total_pages
        model.cover_url = book.cover_url
        model.isbn = book.isbn
        model.status = book.status
        model.genres = book.genres
        model.rating = book.rating
        model.updated_at = book.updated_at
        model.finished_reading_at = book.finished_reading_at

        await self._session.flush()
        return book

    async def delete(self, book_id: UUID) -> None:
        result = await self._session.execute(
            select(BookModel).where(BookModel.id == book_id)
        )
        model = result.scalar_one_or_none()
        if model:
            model.is_deleted = True
            model.deleted_at = func.now()
            await self._session.flush()

    async def list_by_user(
        self,
        user_id: UUID,
        limit: int,
        offset: int,
        status: BookStatus | None = None,
        search_query: str | None = None,
    ) -> tuple[list[Book], int]:
        query = (
            select(BookModel)
            .options(selectinload(BookModel.sessions))
            .where(BookModel.user_id == user_id, ~BookModel.is_deleted)
        )

        if status:
            query = query.where(BookModel.status == status)

        if search_query:
            search_term = f"%{search_query}%"
            query = query.where(
                or_(
                    BookModel.title.ilike(search_term),
                    BookModel.author.ilike(search_term),
                    BookModel.isbn.ilike(search_term),
                )
            )

        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self._session.execute(count_query)
        total = total_result.scalar_one()

        query = query.order_by(BookModel.created_at.desc()).limit(limit).offset(offset)
        result = await self._session.execute(query)
        models = result.scalars().all()

        return [self._to_entity(model) for model in models], total

    @staticmethod
    def _to_entity(model: BookModel) -> Book:
        current_page = 0
        started_reading_at = None
        total_reading_time = 0

        # If sessions are loaded
        if hasattr(model, "sessions") and model.sessions:
            current_page = max((s.ending_page or 0 for s in model.sessions), default=0)
            total_reading_time = sum(s.minutes_read or 0 for s in model.sessions)
            valid_sessions = [s for s in model.sessions if s.start_time]
            if valid_sessions:
                started_reading_at = min(s.start_time for s in valid_sessions)

        return Book(
            id=model.id,
            user_id=model.user_id,
            title=model.title,
            author=model.author,
            publisher=model.publisher,
            published_year=model.published_year,
            total_pages=model.total_pages,
            cover_url=model.cover_url,
            isbn=model.isbn,
            status=model.status,
            genres=model.genres,
            rating=model.rating,
            created_at=model.created_at,
            updated_at=model.updated_at,
            current_page=current_page,
            started_reading_at=started_reading_at,
            total_reading_time=total_reading_time,
            finished_reading_at=model.finished_reading_at,
        )
