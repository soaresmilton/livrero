import uuid
from collections.abc import Iterable
from datetime import UTC, date, datetime, timedelta

from app.application.dto.dashboard_dto import (
    CurrentBookResponse,
    DashboardGoals,
    DashboardSummaryResponse,
    GoalProgress,
    HeatmapDay,
    HeatmapResponse,
)
from app.domain.repositories.reading_goal_repository import ReadingGoalRepository
from app.infrastructure.persistence.repositories.stats_repository import (
    SessionStat,
    SQLAlchemyStatsRepository,
)


def compute_streak(session_dates: set[date], today: date) -> int:
    """Count consecutive days with reading activity ending today or yesterday."""
    if today in session_dates:
        cursor = today
    elif (today - timedelta(days=1)) in session_dates:
        cursor = today - timedelta(days=1)
    else:
        return 0

    streak = 0
    while cursor in session_dates:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


def build_heatmap_counts(sessions: Iterable[SessionStat], year: int) -> dict[date, int]:
    """Sum minutes read per calendar day within the given year."""
    counts: dict[date, int] = {}
    for s in sessions:
        day = s.start_time.date()
        if day.year != year:
            continue
        counts[day] = counts.get(day, 0) + s.minutes_read
    return counts


def _progress(current: int, target: int) -> GoalProgress:
    percent = round(current / target * 100, 1) if target > 0 else 0.0
    return GoalProgress(target=target, current=current, percent=percent)


class GetDashboardUseCase:
    def __init__(
        self,
        stats_repo: SQLAlchemyStatsRepository,
        goal_repo: ReadingGoalRepository,
    ):
        self.stats_repo = stats_repo
        self.goal_repo = goal_repo

    async def get_summary(
        self, user_id: uuid.UUID, year: int
    ) -> DashboardSummaryResponse:
        sessions = await self.stats_repo.get_finished_sessions(user_id)
        year_sessions = [s for s in sessions if s.start_time.year == year]

        pages_read = sum(s.pages for s in year_sessions)
        minutes_read = sum(s.minutes_read for s in year_sessions)

        completed_total = await self.stats_repo.count_completed_books(user_id)
        completed_year = await self.stats_repo.count_completed_books_in_year(
            user_id, year
        )

        streak = compute_streak(
            {s.start_time.date() for s in sessions}, datetime.now(UTC).date()
        )

        current_book_stat = await self.stats_repo.get_current_book(user_id)
        current_book = (
            CurrentBookResponse(
                id=current_book_stat.id,
                title=current_book_stat.title,
                author=current_book_stat.author,
                cover_url=current_book_stat.cover_url,
                total_pages=current_book_stat.total_pages,
                current_page=current_book_stat.current_page,
            )
            if current_book_stat
            else None
        )

        goal = await self.goal_repo.get_by_user_year(user_id, year)
        books_target = goal.books_goal if goal else 0
        pages_target = goal.pages_goal if goal else 0
        minutes_target = goal.minutes_goal if goal else 0

        return DashboardSummaryResponse(
            year=year,
            completed_books_total=completed_total,
            completed_books_year=completed_year,
            pages_read=pages_read,
            minutes_read=minutes_read,
            current_streak=streak,
            current_book=current_book,
            goals=DashboardGoals(
                books=_progress(completed_year, books_target),
                pages=_progress(pages_read, pages_target),
                minutes=_progress(minutes_read, minutes_target),
            ),
        )

    async def get_heatmap(self, user_id: uuid.UUID, year: int) -> HeatmapResponse:
        sessions = await self.stats_repo.get_finished_sessions(user_id)
        counts = build_heatmap_counts(sessions, year)
        days = [
            HeatmapDay(date=day.isoformat(), count=count)
            for day, count in sorted(counts.items())
        ]
        return HeatmapResponse(year=year, days=days)
