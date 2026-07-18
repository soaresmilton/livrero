from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from app.domain.entities.book import BookStatus


class CreateBookRequest(BaseModel):
    """Request payload for creating a new book."""

    title: str = Field(..., max_length=255)
    author: str = Field(..., max_length=255)
    publisher: str | None = Field(None, max_length=255)
    published_year: int | None = Field(None)
    total_pages: int | None = Field(None, ge=1)
    cover_url: str | None = Field(None, max_length=1024)
    status: BookStatus = Field(default=BookStatus.WANT_TO_READ)
    isbn: str | None = Field(None, max_length=13)
    genres: list[str] | None = Field(default_factory=list)
    rating: float | None = Field(None, ge=0, le=5)


class UpdateBookRequest(BaseModel):
    """Request payload for partially updating an existing book."""

    title: str | None = Field(None, max_length=255)
    author: str | None = Field(None, max_length=255)
    publisher: str | None = Field(None, max_length=255)
    published_year: int | None = Field(None)
    total_pages: int | None = Field(None, ge=1)
    cover_url: str | None = Field(None, max_length=1024)
    status: BookStatus | None = Field(None)
    isbn: str | None = Field(None, max_length=13)
    genres: list[str] | None = Field(None)
    rating: float | None = Field(None, ge=0, le=5)


class BookResponse(BaseModel):
    """API response representation of a book."""

    id: UUID
    user_id: UUID
    title: str
    author: str
    status: BookStatus
    created_at: datetime
    updated_at: datetime
    publisher: str | None = None
    published_year: int | None = None
    total_pages: int | None = None
    cover_url: str | None = None
    isbn: str | None = None
    current_page: int = 0
    started_reading_at: datetime | None = None
    total_reading_time: int = 0
    finished_reading_at: datetime | None = None
    genres: list[str] | None = Field(default_factory=list)
    rating: float | None = None

    class Config:
        from_attributes = True


class PaginatedBookResponse(BaseModel):
    """Paginated list of books."""

    items: list[BookResponse]
    total: int
    page: int
    size: int
    pages: int


class OpenLibraryBookResponse(BaseModel):
    """Book metadata retrieved from the Open Library API."""

    title: str
    author: str
    publisher: str | None = None
    published_year: int | None = None
    total_pages: int | None = None
    isbn: str | None = None
    cover_url: str | None
