import uuid

from fastapi import APIRouter, Depends, Query, status

from app.api.v1.deps import get_current_user, get_note_repository
from app.application.dto.reading_note_dto import ReadingNoteResponse
from app.application.use_cases.manage_notes import ManageNotesUseCase, SaveNoteRequest
from app.domain.entities.user import User
from app.domain.repositories.reading_note_repository import ReadingNoteRepository

router = APIRouter(tags=["Notes"])


@router.get("/notes/recent", response_model=list[ReadingNoteResponse])
async def list_recent_notes(
    limit: int = Query(10, ge=1, le=50),
    user: User = Depends(get_current_user),
    repo: ReadingNoteRepository = Depends(get_note_repository),
) -> list[ReadingNoteResponse]:
    use_case = ManageNotesUseCase(repo)
    notes = await use_case.list_recent(user.id, limit)
    return [ReadingNoteResponse.model_validate(note) for note in notes]


@router.get("/books/{book_id}/note", response_model=ReadingNoteResponse)
async def get_book_note(
    book_id: str,
    user: User = Depends(get_current_user),
    repo: ReadingNoteRepository = Depends(get_note_repository),
) -> ReadingNoteResponse:
    try:
        parsed_uuid = uuid.UUID(book_id)
    except ValueError as e:
        from app.shared.exceptions import bad_request

        raise bad_request("Invalid book ID format") from e

    use_case = ManageNotesUseCase(repo)
    note = await use_case.get_note(user.id, parsed_uuid)
    return ReadingNoteResponse.model_validate(note)


@router.put("/books/{book_id}/note", response_model=ReadingNoteResponse)
async def save_book_note(
    book_id: str,
    request: SaveNoteRequest,
    user: User = Depends(get_current_user),
    repo: ReadingNoteRepository = Depends(get_note_repository),
) -> ReadingNoteResponse:
    try:
        parsed_uuid = uuid.UUID(book_id)
    except ValueError as e:
        from app.shared.exceptions import bad_request

        raise bad_request("Invalid book ID format") from e

    use_case = ManageNotesUseCase(repo)
    note = await use_case.save_note(user.id, parsed_uuid, request)
    return ReadingNoteResponse.model_validate(note)
