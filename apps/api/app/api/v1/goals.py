from datetime import UTC, datetime

from fastapi import APIRouter, Depends, Query

from app.api.v1.deps import get_current_user, get_goal_repository
from app.application.dto.reading_goal_dto import ReadingGoalResponse, UpsertGoalRequest
from app.application.use_cases.manage_goals import ManageGoalsUseCase
from app.domain.entities.user import User
from app.domain.repositories.reading_goal_repository import ReadingGoalRepository

router = APIRouter(prefix="/goals", tags=["Goals"])


def _current_year() -> int:
    """Return the current UTC calendar year."""
    return datetime.now(UTC).year


@router.get("", response_model=ReadingGoalResponse)
async def get_goal(
    year: int | None = Query(default=None, ge=1970, le=3000),
    user: User = Depends(get_current_user),
    repo: ReadingGoalRepository = Depends(get_goal_repository),
) -> ReadingGoalResponse:
    """Get the reading goal for a given year (defaults to the current year)."""
    use_case = ManageGoalsUseCase(repo)
    goal = await use_case.get_goal(user.id, year or _current_year())
    return ReadingGoalResponse.model_validate(goal)


@router.put("/{year}", response_model=ReadingGoalResponse)
async def upsert_goal(
    year: int,
    request: UpsertGoalRequest,
    user: User = Depends(get_current_user),
    repo: ReadingGoalRepository = Depends(get_goal_repository),
) -> ReadingGoalResponse:
    """Create or update the reading goal for a given year."""
    use_case = ManageGoalsUseCase(repo)
    goal = await use_case.upsert_goal(user.id, year, request)
    return ReadingGoalResponse.model_validate(goal)
