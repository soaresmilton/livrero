import abc
import uuid

from app.domain.entities.reading_goal import ReadingGoal


class ReadingGoalRepository(abc.ABC):
    @abc.abstractmethod
    async def get_by_user_year(
        self, user_id: uuid.UUID, year: int
    ) -> ReadingGoal | None:
        """Get the reading goal of a user for a specific year"""
        pass

    @abc.abstractmethod
    async def upsert(self, goal: ReadingGoal) -> ReadingGoal:
        """Create or update the reading goal for a (user, year)"""
        pass

    @abc.abstractmethod
    async def list_by_user(self, user_id: uuid.UUID) -> list[ReadingGoal]:
        """List all reading goals of a user, most recent year first"""
        pass
