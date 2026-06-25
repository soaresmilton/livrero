from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from app.application.use_cases.refresh_token_use_case import RefreshTokenUseCase
from app.domain.entities.token import RefreshToken
from app.shared.exceptions import UnauthorizedError


@pytest.mark.asyncio
async def test_refresh_token_success():
    repo = AsyncMock()
    future_date = datetime.now(UTC) + timedelta(hours=1)
    mock_token = RefreshToken(
        id=uuid4(),
        user_id=uuid4(),
        token_hash="old",
        expires_at=future_date,
        revoked_at=None,
        created_at=datetime.now(UTC),
    )
    repo.find_by_hash.return_value = mock_token

    use_case = RefreshTokenUseCase(refresh_token_repository=repo)

    res, raw_refresh = await use_case.execute("old_token")
    assert isinstance(res.access_token, str)
    assert isinstance(raw_refresh, str)
    repo.revoke.assert_called_once()
    repo.save.assert_called_once()


@pytest.mark.asyncio
async def test_refresh_token_revoked():
    repo = AsyncMock()
    mock_token = RefreshToken(
        id=uuid4(),
        user_id=uuid4(),
        token_hash="old",
        expires_at=None,
        revoked_at=datetime.now(UTC),
        created_at=datetime.now(UTC),
    )
    repo.find_by_hash.return_value = mock_token

    use_case = RefreshTokenUseCase(refresh_token_repository=repo)

    with pytest.raises(UnauthorizedError):
        await use_case.execute("old_token")


@pytest.mark.asyncio
async def test_refresh_token_not_found():
    repo = AsyncMock()
    repo.find_by_hash.return_value = None
    use_case = RefreshTokenUseCase(refresh_token_repository=repo)

    with pytest.raises(UnauthorizedError):
        await use_case.execute("old_token")
