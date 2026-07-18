import uuid

from app.application.dto.reading_goal_dto import UpsertGoalRequest
from app.domain.entities.reading_goal import ReadingGoal
from app.domain.repositories.reading_goal_repository import ReadingGoalRepository


class ManageGoalsUseCase:
    """Use case for fetching and upserting a user's annual reading goals."""

    def __init__(self, goal_repo: ReadingGoalRepository):
        self.goal_repo = goal_repo

    async def get_goal(self, user_id: uuid.UUID, year: int) -> ReadingGoal:
        """Fetch the user's goal for a year, or an empty unsaved one if none exists."""
        goal = await self.goal_repo.get_by_user_year(user_id, year)
        if goal:
            return goal
        # Return an empty (unsaved) goal for the requested year
        return ReadingGoal(
            id=uuid.uuid4(),
            user_id=user_id,
            year=year,
        )

    async def upsert_goal(
        self, user_id: uuid.UUID, year: int, request: UpsertGoalRequest
    ) -> ReadingGoal:
        """Create or replace the user's reading goal for the given year."""
        existing = await self.goal_repo.get_by_user_year(user_id, year)
        goal = ReadingGoal(
            id=existing.id if existing else uuid.uuid4(),
            user_id=user_id,
            year=year,
            books_goal=request.books_goal,
            pages_goal=request.pages_goal,
            minutes_goal=request.minutes_goal,
        )
        return await self.goal_repo.upsert(goal)
