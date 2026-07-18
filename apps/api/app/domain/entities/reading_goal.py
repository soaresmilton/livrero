from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass
class ReadingGoal:
    """Domain entity representing a user's annual reading goal."""

    id: UUID
    user_id: UUID
    year: int
    books_goal: int = 0
    pages_goal: int = 0
    minutes_goal: int = 0
    created_at: datetime | None = None
    updated_at: datetime | None = None
