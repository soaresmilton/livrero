import uuid
from datetime import UTC, datetime

from app.application.dto.reading_session_dto import (
    EndSessionRequest,
    StartSessionRequest,
)
from app.domain.entities.reading_session import ReadingSession
from app.domain.repositories.book_repository import BookRepository
from app.domain.repositories.reading_session_repository import ReadingSessionRepository
from app.shared.exceptions import ConflictError, NotFoundError


class ManageSessionsUseCase:
    def __init__(
        self,
        session_repo: ReadingSessionRepository,
        book_repo: BookRepository,
    ) -> None:
        self._session_repo = session_repo
        self._book_repo = book_repo

    async def start_session(
        self, user_id: uuid.UUID, request: StartSessionRequest
    ) -> ReadingSession:
        # 1. Check if user already has an active session
        active = await self._session_repo.get_active_session(user_id)
        if active:
            raise ConflictError("User already has an active reading session")

        # 2. Check if book exists and belongs to user
        book = await self._book_repo.get_by_id(request.book_id)
        if not book or book.user_id != user_id or book.is_deleted:
            raise NotFoundError("Book not found")

        now = datetime.now(UTC)

        session = ReadingSession(
            id=uuid.uuid4(),
            user_id=user_id,
            book_id=request.book_id,
            start_time=now,
            created_at=now,
            updated_at=now,
        )

        from app.domain.entities.book import BookStatus

        if book.status == BookStatus.WANT_TO_READ:
            book.status = BookStatus.READING
            book.updated_at = now
            await self._book_repo.update(book)

        return await self._session_repo.create(session)

    async def end_session(
        self, user_id: uuid.UUID, session_id: uuid.UUID, request: EndSessionRequest
    ) -> ReadingSession:
        session = await self._session_repo.get_by_id(session_id)

        if not session or session.user_id != user_id:
            raise NotFoundError("Reading session not found")

        if session.end_time is not None:
            raise ConflictError("Session is already ended")

        now = datetime.now(UTC)
        start_time = session.start_time
        if start_time.tzinfo is None:
            start_time = start_time.replace(tzinfo=UTC)

        # Calculate minutes read
        delta = now - start_time
        minutes = int(delta.total_seconds() / 60)

        session.end_time = now
        session.starting_page = request.starting_page
        session.ending_page = request.ending_page
        session.notes = request.notes
        session.minutes_read = minutes
        session.updated_at = now

        return await self._session_repo.update(session)

    async def get_active_session(self, user_id: uuid.UUID) -> ReadingSession | None:
        return await self._session_repo.get_active_session(user_id)

    async def discard_session(self, user_id: uuid.UUID, session_id: uuid.UUID) -> None:
        session = await self._session_repo.get_by_id(session_id)
        if not session or session.user_id != user_id:
            raise NotFoundError("Reading session not found")

        await self._session_repo.delete(session_id)

    async def list_book_sessions(
        self, user_id: uuid.UUID, book_id: uuid.UUID, page: int = 1, size: int = 20
    ) -> tuple[list[ReadingSession], int]:
        # Validate book
        book = await self._book_repo.get_by_id(book_id)
        if not book or book.user_id != user_id or book.is_deleted:
            raise NotFoundError("Book not found")

        offset = (page - 1) * size
        return await self._session_repo.list_by_book(book_id, limit=size, offset=offset)
