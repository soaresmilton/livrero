import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class UpsertGoalRequest(BaseModel):
    """Request payload for creating or updating a reading goal."""

    books_goal: int = Field(default=0, ge=0)
    pages_goal: int = Field(default=0, ge=0)
    minutes_goal: int = Field(default=0, ge=0)


class ReadingGoalResponse(BaseModel):
    """API response representation of a reading goal."""

    id: uuid.UUID
    year: int
    books_goal: int
    pages_goal: int
    minutes_goal: int
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
