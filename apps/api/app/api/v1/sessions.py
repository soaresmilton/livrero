import math
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import get_current_user
from app.application.dto.reading_session_dto import (
    EndSessionRequest,
    PaginatedReadingSessionResponse,
    ReadingSessionResponse,
    StartSessionRequest,
    UpdateSessionNotesRequest,
)
from app.application.use_cases.manage_sessions import ManageSessionsUseCase
from app.domain.entities.user import User
from app.infrastructure.persistence.database import get_session
from app.infrastructure.persistence.repositories.book_repository import (
    SQLAlchemyBookRepository,
)
from app.infrastructure.persistence.repositories.reading_session_repository import (
    SQLAlchemyReadingSessionRepository,
)

router = APIRouter(prefix="/sessions", tags=["Sessions"])


def get_manage_sessions_use_case(
    session: Annotated[AsyncSession, Depends(get_session)],
) -> ManageSessionsUseCase:
    """Provide a ManageSessionsUseCase wired with its repositories for dependency injection."""
    return ManageSessionsUseCase(
        session_repo=SQLAlchemyReadingSessionRepository(session),
        book_repo=SQLAlchemyBookRepository(session),
    )


@router.post(
    "", response_model=ReadingSessionResponse, status_code=status.HTTP_201_CREATED
)
async def start_session(
    request: StartSessionRequest,
    user: Annotated[User, Depends(get_current_user)],
    use_case: Annotated[ManageSessionsUseCase, Depends(get_manage_sessions_use_case)],
):
    """Start a new reading session."""
    return await use_case.start_session(user.id, request)


@router.post("/{session_id}/end", response_model=ReadingSessionResponse)
async def end_session(
    session_id: UUID,
    request: EndSessionRequest,
    user: Annotated[User, Depends(get_current_user)],
    use_case: Annotated[ManageSessionsUseCase, Depends(get_manage_sessions_use_case)],
):
    """End an active reading session."""
    return await use_case.end_session(user.id, session_id, request)


@router.get("/active", response_model=ReadingSessionResponse | None)
async def get_active_session(
    user: Annotated[User, Depends(get_current_user)],
    use_case: Annotated[ManageSessionsUseCase, Depends(get_manage_sessions_use_case)],
):
    """Get the user's currently active reading session, if any."""
    return await use_case.get_active_session(user.id)


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def discard_session(
    session_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    use_case: Annotated[ManageSessionsUseCase, Depends(get_manage_sessions_use_case)],
):
    """Discard a reading session."""
    await use_case.discard_session(user.id, session_id)


@router.get("/book/{book_id}", response_model=PaginatedReadingSessionResponse)
async def list_book_sessions(
    book_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    use_case: Annotated[ManageSessionsUseCase, Depends(get_manage_sessions_use_case)],
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
):
    """List reading sessions for a specific book."""
    sessions, total = await use_case.list_book_sessions(
        user_id=user.id, book_id=book_id, page=page, size=size
    )

    pages = math.ceil(total / size) if total > 0 else 0

    return PaginatedReadingSessionResponse(
        items=[ReadingSessionResponse.model_validate(session) for session in sessions],
        total=total,
        page=page,
        size=size,
        pages=pages,
    )


@router.patch("/{session_id}/notes", response_model=ReadingSessionResponse)
async def update_session_notes(
    session_id: UUID,
    request: UpdateSessionNotesRequest,
    user: Annotated[User, Depends(get_current_user)],
    use_case: Annotated[ManageSessionsUseCase, Depends(get_manage_sessions_use_case)],
):
    """Update notes of an existing reading session."""
    session = await use_case.update_session_notes(user.id, session_id, request)
    return ReadingSessionResponse.model_validate(session)
