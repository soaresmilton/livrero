import uuid

from pydantic import BaseModel


class GoalProgress(BaseModel):
    target: int
    current: int
    percent: float


class CurrentBookResponse(BaseModel):
    id: uuid.UUID
    title: str
    author: str
    cover_url: str | None = None
    total_pages: int | None = None
    current_page: int = 0


class DashboardGoals(BaseModel):
    books: GoalProgress
    pages: GoalProgress
    minutes: GoalProgress


class DashboardSummaryResponse(BaseModel):
    year: int
    completed_books_total: int
    completed_books_year: int
    pages_read: int
    minutes_read: int
    current_streak: int
    current_book: CurrentBookResponse | None = None
    goals: DashboardGoals


class HeatmapDay(BaseModel):
    date: str  # ISO date (YYYY-MM-DD)
    count: int


class HeatmapResponse(BaseModel):
    year: int
    days: list[HeatmapDay]
