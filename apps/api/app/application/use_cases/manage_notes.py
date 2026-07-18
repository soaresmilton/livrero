import uuid
from datetime import UTC, datetime

from pydantic import BaseModel

from app.domain.entities.reading_note import ReadingNote
from app.domain.repositories.reading_note_repository import ReadingNoteRepository


class SaveNoteRequest(BaseModel):
    """Request payload for creating or updating a book's reading note."""

    content_markdown: str


class ManageNotesUseCase:
    """Use case for creating, fetching, and listing reading notes."""

    def __init__(self, note_repo: ReadingNoteRepository):
        self.note_repo = note_repo

    async def save_note(
        self, user_id: uuid.UUID, book_id: uuid.UUID, request: SaveNoteRequest
    ) -> ReadingNote:
        """Create the note for a book, or update it if one already exists."""
        existing_note = await self.note_repo.get_by_book_id(book_id)

        if existing_note:
            if existing_note.user_id != user_id:
                from app.shared.exceptions import unauthorized

                raise unauthorized("Cannot edit note of another user")

            existing_note.content_markdown = request.content_markdown
            existing_note.updated_at = datetime.now(UTC)
            return await self.note_repo.save(existing_note)

        # Create new
        new_note = ReadingNote(
            id=uuid.uuid4(),
            user_id=user_id,
            book_id=book_id,
            content_markdown=request.content_markdown,
        )
        return await self.note_repo.save(new_note)

    async def get_note(self, user_id: uuid.UUID, book_id: uuid.UUID) -> ReadingNote:
        """Fetch a book's note, returning an empty unsaved note if none exists."""
        note = await self.note_repo.get_by_book_id(book_id)
        if note and note.user_id != user_id:
            from app.shared.exceptions import unauthorized

            raise unauthorized("Cannot access note of another user")
        if not note:
            # Return empty note
            return ReadingNote(
                id=uuid.uuid4(),
                user_id=user_id,
                book_id=book_id,
                content_markdown="",
            )
        return note

    async def list_recent(
        self, user_id: uuid.UUID, limit: int = 10
    ) -> list[ReadingNote]:
        """List the user's most recently updated notes."""
        return await self.note_repo.list_recent(user_id, limit)
