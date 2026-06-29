from datetime import UTC, datetime
from uuid import uuid4

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.user import User
from app.infrastructure.persistence.repositories.user_repository import (
    SQLAlchemyUserRepository,
)


@pytest.mark.asyncio
async def test_user_repository_save_and_find(db_session: AsyncSession):
    repo = SQLAlchemyUserRepository(db_session)
    now = datetime.now(UTC)
    user = User(
        id=uuid4(),
        name="Test Repo",
        email="repo@example.com",
        password_hash="hashed",
        theme="light",
        created_at=now,
        updated_at=now,
    )

    saved = await repo.save(user)
    assert saved.id == user.id

    found_by_id = await repo.find_by_id(user.id)
    assert found_by_id is not None
    assert found_by_id.email == "repo@example.com"

    found_by_email = await repo.find_by_email("repo@example.com")
    assert found_by_email is not None
    assert found_by_email.id == user.id


@pytest.mark.asyncio
async def test_user_repository_find_not_found(db_session: AsyncSession):
    repo = SQLAlchemyUserRepository(db_session)
    assert await repo.find_by_id(uuid4()) is None
    assert await repo.find_by_email("unknown@example.com") is None


@pytest.mark.asyncio
async def test_user_repository_update(db_session: AsyncSession):
    repo = SQLAlchemyUserRepository(db_session)
    now = datetime.now(UTC)
    user = User(
        id=uuid4(),
        name="Update Test",
        email="update@example.com",
        password_hash="hashed",
        theme="light",
        created_at=now,
        updated_at=now,
    )

    await repo.save(user)

    user.name = "Updated Name"
    user.theme = "dark"
    updated = await repo.update(user)

    assert updated.name == "Updated Name"
    assert updated.theme == "dark"

    found = await repo.find_by_id(user.id)
    assert found.name == "Updated Name"
    assert found.theme == "dark"


@pytest.mark.asyncio
async def test_user_repository_update_not_found(db_session: AsyncSession):
    repo = SQLAlchemyUserRepository(db_session)
    now = datetime.now(UTC)
    user = User(
        id=uuid4(),
        name="Missing",
        email="missing@example.com",
        password_hash="hashed",
        theme="light",
        created_at=now,
        updated_at=now,
    )
    with pytest.raises(ValueError):
        await repo.update(user)
