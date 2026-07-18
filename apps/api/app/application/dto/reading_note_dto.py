import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ReadingNoteResponse(BaseModel):
    """API response representation of a reading note."""

    id: uuid.UUID
    book_id: uuid.UUID
    content_markdown: str
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
