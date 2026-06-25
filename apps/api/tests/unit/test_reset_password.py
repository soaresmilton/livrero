from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, patch
from uuid import uuid4

import pytest

from app.application.dto.auth_dto import ResetPasswordRequest
from app.application.use_cases.reset_password import ResetPassword
from app.domain.entities.token import PasswordResetToken
from app.domain.entities.user import User
from app.shared.exceptions import LivreroError


@pytest.mark.asyncio
async def test_reset_password_success():
    user_repo = AsyncMock()
    token_repo = AsyncMock()

    mock_user = User(
        id=uuid4(),
        email="test@example.com",
        name="Test",
        password_hash="hashed",
        theme="light",
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    user_repo.find_by_id.return_value = mock_user

    future_date = datetime.now(UTC) + timedelta(hours=1)
    mock_token = PasswordResetToken(
        id=uuid4(),
        user_id=mock_user.id,
        token_hash="valid_token",
        expires_at=future_date,
        created_at=datetime.now(UTC),
        used_at=None,
    )
    token_repo.find_by_hash.return_value = mock_token

    use_case = ResetPassword(
        user_repository=user_repo, reset_token_repository=token_repo
    )
    req = ResetPasswordRequest(token="valid_token", new_password="new_password123")

    with patch(
        "app.application.use_cases.reset_password.hash_password",
        return_value="new_hash",
    ):
        res = await use_case.execute(req)
        assert res.message == "Password updated successfully."
        user_repo.update.assert_called_once()
        token_repo.mark_as_used.assert_called_once()


@pytest.mark.asyncio
async def test_reset_password_invalid_token():
    user_repo = AsyncMock()
    token_repo = AsyncMock()

    token_repo.find_by_hash.return_value = None
    use_case = ResetPassword(
        user_repository=user_repo, reset_token_repository=token_repo
    )
    req = ResetPasswordRequest(token="invalid_token", new_password="new_password123")

    with pytest.raises(LivreroError):
        await use_case.execute(req)
