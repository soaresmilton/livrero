from unittest.mock import AsyncMock

import pytest

from app.application.use_cases.logout_user import LogoutUser
from app.domain.entities.token import RefreshToken


@pytest.mark.asyncio
async def test_logout_user_success():
    repo = AsyncMock()
    mock_token = RefreshToken(
        id="1",
        user_id="user1",
        token_hash="old",
        expires_at=None,
        revoked_at=None,
        created_at=None,
    )
    repo.find_by_hash.return_value = mock_token
    use_case = LogoutUser(refresh_token_repository=repo)
    await use_case.execute("valid_token")
    repo.revoke.assert_called_once_with("1")
