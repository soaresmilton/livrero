from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class StartSessionRequest(BaseModel):
    """Request payload for starting a new reading session."""

    book_id: UUID


class EndSessionRequest(BaseModel):
    """Request payload for ending an in-progress reading session."""

    starting_page: int | None = Field(None, ge=0)
    ending_page: int | None = Field(None, ge=0)
    notes: str | None = None


class UpdateSessionNotesRequest(BaseModel):
    """Request payload for updating the notes of a reading session."""

    notes: str | None = None


class ReadingSessionResponse(BaseModel):
    """API response representation of a reading session."""

    id: UUID
    user_id: UUID
    book_id: UUID
    start_time: datetime
    end_time: datetime | None = None
    starting_page: int | None = None
    ending_page: int | None = None
    minutes_read: int | None = None
    notes: str | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PaginatedReadingSessionResponse(BaseModel):
    """Paginated list of reading sessions."""

    items: list[ReadingSessionResponse]
    total: int
    page: int
    size: int
    pages: int
