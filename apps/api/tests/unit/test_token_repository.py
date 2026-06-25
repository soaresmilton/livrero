from datetime import UTC, datetime, timedelta
from uuid import uuid4

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.token import PasswordResetToken, RefreshToken
from app.infrastructure.persistence.repositories.token_repository import (
    SQLAlchemyPasswordResetTokenRepository,
    SQLAlchemyRefreshTokenRepository,
)


@pytest.mark.asyncio
async def test_refresh_token_repository(db_session: AsyncSession):
    repo = SQLAlchemyRefreshTokenRepository(db_session)
    now = datetime.now(UTC)
    future = now + timedelta(days=1)

    token = RefreshToken(
        id=uuid4(),
        user_id=uuid4(),
        token_hash="hash123",
        expires_at=future,
        created_at=now,
    )

    saved = await repo.save(token)
    assert saved.id == token.id

    found = await repo.find_by_hash("hash123")
    assert found is not None
    assert found.user_id == token.user_id

    # Active count
    count = await repo.count_active_for_user(token.user_id)
    assert count == 1

    # Revoke
    await repo.revoke(token.id)
    found_revoked = await repo.find_by_hash("hash123")
    assert found_revoked.revoked_at is not None

    count_after_revoke = await repo.count_active_for_user(token.user_id)
    assert count_after_revoke == 0


@pytest.mark.asyncio
async def test_refresh_token_repository_revoke_all(db_session: AsyncSession):
    repo = SQLAlchemyRefreshTokenRepository(db_session)
    now = datetime.now(UTC)
    user_id = uuid4()

    for i in range(3):
        t = RefreshToken(
            id=uuid4(),
            user_id=user_id,
            token_hash=f"hash{i}",
            expires_at=now + timedelta(days=1),
            created_at=now,
        )
        await repo.save(t)

    count = await repo.count_active_for_user(user_id)
    assert count == 3

    await repo.revoke_all_for_user(user_id)
    count_after = await repo.count_active_for_user(user_id)
    assert count_after == 0


@pytest.mark.asyncio
async def test_password_reset_token_repository(db_session: AsyncSession):
    repo = SQLAlchemyPasswordResetTokenRepository(db_session)
    now = datetime.now(UTC)

    token = PasswordResetToken(
        id=uuid4(),
        user_id=uuid4(),
        token_hash="resethash123",
        expires_at=now + timedelta(hours=1),
        created_at=now,
    )

    saved = await repo.save(token)
    assert saved.id == token.id

    found = await repo.find_by_hash("resethash123")
    assert found is not None
    assert found.used_at is None

    await repo.mark_as_used(token.id)
    found_used = await repo.find_by_hash("resethash123")
    assert found_used.used_at is not None
