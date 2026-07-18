from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass
class ReadingNote:
    """Domain entity representing a markdown note attached to a book."""

    id: UUID
    user_id: UUID
    book_id: UUID
    content_markdown: str
    created_at: datetime | None = None
    updated_at: datetime | None = None
