import uuid
from datetime import UTC, datetime

import pytest

from app.application.dto.reading_session_dto import (
    EndSessionRequest,
    StartSessionRequest,
)
from app.application.use_cases.manage_sessions import ManageSessionsUseCase
from app.domain.entities.book import Book, BookStatus
from app.domain.entities.reading_session import ReadingSession
from app.shared.exceptions import ConflictError
from tests.unit.test_manage_books import MockBookRepository


class MockReadingSessionRepository:
    def __init__(self):
        self.sessions = {}
        self.created = []
        self.updated = []
        self.deleted = []

    async def create(self, session: ReadingSession) -> ReadingSession:
        self.sessions[session.id] = session
        self.created.append(session)
        return session

    async def update(self, session: ReadingSession) -> ReadingSession:
        self.sessions[session.id] = session
        self.updated.append(session)
        return session

    async def get_by_id(self, session_id: uuid.UUID) -> ReadingSession | None:
        return self.sessions.get(session_id)

    async def get_active_session(self, user_id: uuid.UUID) -> ReadingSession | None:
        for s in self.sessions.values():
            if s.user_id == user_id and s.end_time is None:
                return s
        return None

    async def delete(self, session_id: uuid.UUID) -> None:
        if session_id in self.sessions:
            self.deleted.append(session_id)
            del self.sessions[session_id]

    async def list_by_book(self, book_id, limit, offset):
        book_sessions = [s for s in self.sessions.values() if s.book_id == book_id]
        return book_sessions[offset : offset + limit], len(book_sessions)


@pytest.fixture
def session_repo():
    return MockReadingSessionRepository()





@pytest.fixture
def book_repo():
    return MockBookRepository()


@pytest.mark.asyncio
async def test_start_session(session_repo, book_repo):
    user_id = uuid.uuid4()
    book_id = uuid.uuid4()
    book = Book(
        id=book_id,
        user_id=user_id,
        title="Test",
        author="Test",
        status=BookStatus.WANT_TO_READ,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    book_repo.books[book_id] = book

    use_case = ManageSessionsUseCase(session_repo, book_repo)
    request = StartSessionRequest(book_id=book_id)
    session = await use_case.start_session(user_id, request)

    assert session.book_id == book_id
    assert session.end_time is None
    assert book.status == BookStatus.READING


@pytest.mark.asyncio
async def test_start_session_conflict(session_repo, book_repo):
    user_id = uuid.uuid4()
    session = ReadingSession(
        id=uuid.uuid4(),
        user_id=user_id,
        book_id=uuid.uuid4(),
        start_time=datetime.now(UTC),
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    session_repo.sessions[session.id] = session

    use_case = ManageSessionsUseCase(session_repo, book_repo)
    with pytest.raises(ConflictError):
        await use_case.start_session(user_id, StartSessionRequest(book_id=uuid.uuid4()))


@pytest.mark.asyncio
async def test_end_session(session_repo, book_repo):
    user_id = uuid.uuid4()
    session_id = uuid.uuid4()
    session = ReadingSession(
        id=session_id,
        user_id=user_id,
        book_id=uuid.uuid4(),
        start_time=datetime.now(UTC),
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    session_repo.sessions[session_id] = session

    use_case = ManageSessionsUseCase(session_repo, book_repo)
    request = EndSessionRequest(starting_page=1, ending_page=10, notes="Good")
    ended_session = await use_case.end_session(user_id, session_id, request)

    assert ended_session.end_time is not None
    assert ended_session.starting_page == 1
    assert ended_session.ending_page == 10
    assert ended_session.minutes_read is not None


@pytest.mark.asyncio
async def test_discard_session(session_repo, book_repo):
    user_id = uuid.uuid4()
    session_id = uuid.uuid4()
    session = ReadingSession(
        id=session_id,
        user_id=user_id,
        book_id=uuid.uuid4(),
        start_time=datetime.now(UTC),
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    session_repo.sessions[session_id] = session

    use_case = ManageSessionsUseCase(session_repo, book_repo)
    await use_case.discard_session(user_id, session_id)
    assert len(session_repo.deleted) == 1


@pytest.mark.asyncio
async def test_list_book_sessions(session_repo, book_repo):
    user_id = uuid.uuid4()
    book_id = uuid.uuid4()
    book = Book(
        id=book_id,
        user_id=user_id,
        title="A",
        author="B",
        status=BookStatus.READING,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    book_repo.books[book_id] = book

    session = ReadingSession(
        id=uuid.uuid4(),
        user_id=user_id,
        book_id=book_id,
        start_time=datetime.now(UTC),
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    session_repo.sessions[session.id] = session

    use_case = ManageSessionsUseCase(session_repo, book_repo)
    items, total = await use_case.list_book_sessions(user_id, book_id)
    assert total == 1
    assert len(items) == 1
