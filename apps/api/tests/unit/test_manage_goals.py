import uuid

import pytest

from app.application.dto.reading_goal_dto import UpsertGoalRequest
from app.application.use_cases.manage_goals import ManageGoalsUseCase
from app.domain.entities.reading_goal import ReadingGoal
from app.domain.repositories.reading_goal_repository import ReadingGoalRepository


class FakeGoalRepository(ReadingGoalRepository):
    def __init__(self):
        self._store: dict[tuple[uuid.UUID, int], ReadingGoal] = {}

    async def get_by_user_year(self, user_id, year):
        return self._store.get((user_id, year))

    async def upsert(self, goal):
        self._store[(goal.user_id, goal.year)] = goal
        return goal

    async def list_by_user(self, user_id):
        return [g for (uid, _), g in self._store.items() if uid == user_id]


@pytest.mark.asyncio
async def test_get_goal_returns_empty_when_missing():
    repo = FakeGoalRepository()
    use_case = ManageGoalsUseCase(repo)
    user_id = uuid.uuid4()

    goal = await use_case.get_goal(user_id, 2026)

    assert goal.year == 2026
    assert goal.user_id == user_id
    assert goal.books_goal == 0
    assert goal.pages_goal == 0
    assert goal.minutes_goal == 0


@pytest.mark.asyncio
async def test_upsert_creates_then_updates_same_row():
    repo = FakeGoalRepository()
    use_case = ManageGoalsUseCase(repo)
    user_id = uuid.uuid4()

    created = await use_case.upsert_goal(
        user_id, 2026, UpsertGoalRequest(books_goal=12, pages_goal=0, minutes_goal=0)
    )
    updated = await use_case.upsert_goal(
        user_id, 2026, UpsertGoalRequest(books_goal=20, pages_goal=500, minutes_goal=90)
    )

    assert created.id == updated.id
    assert updated.books_goal == 20
    assert updated.pages_goal == 500
