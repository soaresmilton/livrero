from dataclasses import dataclass
from datetime import datetime
from enum import StrEnum
from uuid import UUID


class BookStatus(StrEnum):
    WANT_TO_READ = "WANT_TO_READ"
    READING = "READING"
    READ = "READ"
    ABANDONED = "ABANDONED"


@dataclass
class Book:
    id: UUID
    user_id: UUID
    title: str
    author: str
    status: BookStatus
    created_at: datetime
    updated_at: datetime
    current_page: int = 0
    started_reading_at: datetime | None = None
    total_reading_time: int = 0
    finished_reading_at: datetime | None = None
    publisher: str | None = None
    published_year: int | None = None
    total_pages: int | None = None
    cover_url: str | None = None
    isbn: str | None = None
    genres: list[str] | None = None
    rating: float | None = None
    is_deleted: bool = False
    deleted_at: datetime | None = None
