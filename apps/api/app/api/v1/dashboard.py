from datetime import UTC, datetime

from fastapi import APIRouter, Depends, Query

from app.api.v1.deps import get_current_user, get_goal_repository, get_stats_repository
from app.application.dto.dashboard_dto import (
    DashboardSummaryResponse,
    HeatmapResponse,
)
from app.application.use_cases.get_dashboard import GetDashboardUseCase
from app.domain.entities.user import User
from app.domain.repositories.reading_goal_repository import ReadingGoalRepository
from app.infrastructure.persistence.repositories.stats_repository import (
    SQLAlchemyStatsRepository,
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def _current_year() -> int:
    """Return the current UTC calendar year."""
    return datetime.now(UTC).year


def _use_case(
    stats_repo: SQLAlchemyStatsRepository,
    goal_repo: ReadingGoalRepository,
) -> GetDashboardUseCase:
    """Build a GetDashboardUseCase from the given repositories."""
    return GetDashboardUseCase(stats_repo=stats_repo, goal_repo=goal_repo)


@router.get("/summary", response_model=DashboardSummaryResponse)
async def get_summary(
    year: int | None = Query(default=None, ge=1970, le=3000),
    user: User = Depends(get_current_user),
    stats_repo: SQLAlchemyStatsRepository = Depends(get_stats_repository),
    goal_repo: ReadingGoalRepository = Depends(get_goal_repository),
) -> DashboardSummaryResponse:
    """Aggregated reading metrics and goal progress for a year."""
    use_case = _use_case(stats_repo, goal_repo)
    return await use_case.get_summary(user.id, year or _current_year())


@router.get("/heatmap", response_model=HeatmapResponse)
async def get_heatmap(
    year: int | None = Query(default=None, ge=1970, le=3000),
    user: User = Depends(get_current_user),
    stats_repo: SQLAlchemyStatsRepository = Depends(get_stats_repository),
    goal_repo: ReadingGoalRepository = Depends(get_goal_repository),
) -> HeatmapResponse:
    """GitHub-style per-day reading activity for a year."""
    use_case = _use_case(stats_repo, goal_repo)
    return await use_case.get_heatmap(user.id, year or _current_year())
