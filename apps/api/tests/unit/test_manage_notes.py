from uuid import uuid4

import pytest

from app.application.use_cases.manage_notes import ManageNotesUseCase, SaveNoteRequest
from app.domain.entities.reading_note import ReadingNote


class MockNoteRepository:
    def __init__(self):
        self.notes = {}

    async def save(self, note: ReadingNote) -> ReadingNote:
        self.notes[note.book_id] = note
        return note

    async def get_by_book_id(self, book_id) -> ReadingNote | None:
        return self.notes.get(book_id)

    async def list_recent(self, user_id, limit=10):
        return [n for n in self.notes.values() if n.user_id == user_id][:limit]


@pytest.fixture
def note_repo():
    return MockNoteRepository()


@pytest.mark.asyncio
async def test_save_new_note(note_repo):
    user_id = uuid4()
    book_id = uuid4()
    use_case = ManageNotesUseCase(note_repo)

    req = SaveNoteRequest(content_markdown="Test")
    note = await use_case.save_note(user_id, book_id, req)

    assert note.book_id == book_id
    assert note.content_markdown == "Test"
    assert note_repo.notes[book_id] == note


@pytest.mark.asyncio
async def test_update_existing_note(note_repo):
    user_id = uuid4()
    book_id = uuid4()
    existing = ReadingNote(
        id=uuid4(),
        user_id=user_id,
        book_id=book_id,
        content_markdown="Old",
    )
    note_repo.notes[book_id] = existing

    use_case = ManageNotesUseCase(note_repo)
    req = SaveNoteRequest(content_markdown="New")
    note = await use_case.save_note(user_id, book_id, req)

    assert note.content_markdown == "New"


@pytest.mark.asyncio
async def test_cannot_edit_others_note(note_repo):
    user_id = uuid4()
    other_user = uuid4()
    book_id = uuid4()
    existing = ReadingNote(
        id=uuid4(),
        user_id=other_user,
        book_id=book_id,
        content_markdown="Old",
    )
    note_repo.notes[book_id] = existing

    use_case = ManageNotesUseCase(note_repo)
    req = SaveNoteRequest(content_markdown="New")

    from fastapi import HTTPException

    with pytest.raises(HTTPException):
        await use_case.save_note(user_id, book_id, req)


@pytest.mark.asyncio
async def test_get_empty_note(note_repo):
    use_case = ManageNotesUseCase(note_repo)
    note = await use_case.get_note(uuid4(), uuid4())
    assert note.content_markdown == ""
