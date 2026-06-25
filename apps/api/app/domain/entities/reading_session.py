from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass
class ReadingSession:
    id: UUID
    user_id: UUID
    book_id: UUID
    start_time: datetime
    end_time: datetime | None = None
    starting_page: int | None = None
    ending_page: int | None = None
    minutes_read: int | None = None
    notes: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
