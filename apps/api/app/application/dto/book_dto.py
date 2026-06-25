from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from app.domain.entities.book import BookStatus


class CreateBookRequest(BaseModel):
    title: str = Field(..., max_length=255)
    author: str = Field(..., max_length=255)
    publisher: str | None = Field(None, max_length=255)
    published_year: int | None = Field(None)
    total_pages: int | None = Field(None, ge=1)
    cover_url: str | None = Field(None, max_length=1024)
    status: BookStatus = Field(default=BookStatus.WANT_TO_READ)


class UpdateBookRequest(BaseModel):
    title: str | None = Field(None, max_length=255)
    author: str | None = Field(None, max_length=255)
    publisher: str | None = Field(None, max_length=255)
    published_year: int | None = Field(None)
    total_pages: int | None = Field(None, ge=1)
    cover_url: str | None = Field(None, max_length=1024)
    status: BookStatus | None = Field(None)


class BookResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    author: str
    publisher: str | None
    published_year: int | None
    total_pages: int | None
    cover_url: str | None
    status: BookStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PaginatedBookResponse(BaseModel):
    items: list[BookResponse]
    total: int
    page: int
    size: int
    pages: int


class OpenLibraryBookResponse(BaseModel):
    title: str
    author: str
    publisher: str | None = None
    published_year: int | None = None
    total_pages: int | None = None
    isbn: str | None = None
    cover_url: str | None
