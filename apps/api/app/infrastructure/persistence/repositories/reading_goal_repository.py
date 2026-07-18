import uuid
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.reading_goal import ReadingGoal
from app.domain.repositories.reading_goal_repository import ReadingGoalRepository
from app.infrastructure.persistence.models.reading_goal_model import ReadingGoalModel


class SQLAlchemyReadingGoalRepository(ReadingGoalRepository):
    """SQLAlchemy implementation of the ReadingGoalRepository interface."""

    def __init__(self, session: AsyncSession):
        self.session = session

    def _to_entity(self, model: ReadingGoalModel) -> ReadingGoal:
        """Map an ORM ReadingGoalModel to a ReadingGoal domain entity."""
        return ReadingGoal(
            id=model.id,
            user_id=model.user_id,
            year=model.year,
            books_goal=model.books_goal,
            pages_goal=model.pages_goal,
            minutes_goal=model.minutes_goal,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    async def get_by_user_year(
        self, user_id: uuid.UUID, year: int
    ) -> ReadingGoal | None:
        """Fetch a user's reading goal for a specific year, or None if unset."""
        query = select(ReadingGoalModel).where(
            ReadingGoalModel.user_id == user_id,
            ReadingGoalModel.year == year,
        )
        result = await self.session.execute(query)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def upsert(self, goal: ReadingGoal) -> ReadingGoal:
        """Create the (user, year) goal if absent, otherwise update its targets."""
        query = select(ReadingGoalModel).where(
            ReadingGoalModel.user_id == goal.user_id,
            ReadingGoalModel.year == goal.year,
        )
        result = await self.session.execute(query)
        model = result.scalar_one_or_none()

        if model:
            model.books_goal = goal.books_goal
            model.pages_goal = goal.pages_goal
            model.minutes_goal = goal.minutes_goal
            model.updated_at = datetime.now(UTC)
        else:
            model = ReadingGoalModel(
                id=goal.id,
                user_id=goal.user_id,
                year=goal.year,
                books_goal=goal.books_goal,
                pages_goal=goal.pages_goal,
                minutes_goal=goal.minutes_goal,
            )
            self.session.add(model)

        await self.session.flush()
        await self.session.refresh(model)
        return self._to_entity(model)

    async def list_by_user(self, user_id: uuid.UUID) -> list[ReadingGoal]:
        """List all reading goals for a user, most recent year first."""
        query = (
            select(ReadingGoalModel)
            .where(ReadingGoalModel.user_id == user_id)
            .order_by(ReadingGoalModel.year.desc())
        )
        result = await self.session.execute(query)
        models = result.scalars().all()
        return [self._to_entity(m) for m in models]
