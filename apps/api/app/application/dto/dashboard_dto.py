import uuid

from pydantic import BaseModel


class GoalProgress(BaseModel):
    """Progress of a single reading goal metric (books, pages, or minutes)."""

    target: int
    current: int
    percent: float


class CurrentBookResponse(BaseModel):
    """Summary of the book currently being read, for the dashboard."""

    id: uuid.UUID
    title: str
    author: str
    cover_url: str | None = None
    total_pages: int | None = None
    current_page: int = 0


class DashboardGoals(BaseModel):
    """Progress for all reading goal metrics for a given year."""

    books: GoalProgress
    pages: GoalProgress
    minutes: GoalProgress


class DashboardSummaryResponse(BaseModel):
    """API response summarizing a user's reading dashboard for a year."""

    year: int
    completed_books_total: int
    completed_books_year: int
    pages_read: int
    minutes_read: int
    current_streak: int
    current_book: CurrentBookResponse | None = None
    goals: DashboardGoals


class HeatmapDay(BaseModel):
    """Reading activity count for a single calendar day."""

    date: str  # ISO date (YYYY-MM-DD)
    count: int


class HeatmapResponse(BaseModel):
    """API response with per-day reading activity for a year (calendar heatmap)."""

    year: int
    days: list[HeatmapDay]
