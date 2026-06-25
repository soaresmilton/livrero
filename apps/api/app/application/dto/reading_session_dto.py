from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class StartSessionRequest(BaseModel):
    book_id: UUID


class EndSessionRequest(BaseModel):
    starting_page: int | None = Field(None, ge=0)
    ending_page: int | None = Field(None, ge=0)
    notes: str | None = None


class ReadingSessionResponse(BaseModel):
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
    items: list[ReadingSessionResponse]
    total: int
    page: int
    size: int
    pages: int
