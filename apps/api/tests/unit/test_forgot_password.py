from datetime import UTC, datetime
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from app.application.use_cases.forgot_password import ForgotPassword
from app.domain.entities.user import User


@pytest.mark.asyncio
async def test_forgot_password_success():
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
    user_repo.find_by_email.return_value = mock_user

    use_case = ForgotPassword(
        user_repository=user_repo, reset_token_repository=token_repo
    )

    res = await use_case.execute("test@example.com")
    assert (
        res.message
        == "If this email is registered, you will receive instructions shortly."
    )
    token_repo.save.assert_called_once()


@pytest.mark.asyncio
async def test_forgot_password_not_found():
    user_repo = AsyncMock()
    token_repo = AsyncMock()
    user_repo.find_by_email.return_value = None

    use_case = ForgotPassword(
        user_repository=user_repo, reset_token_repository=token_repo
    )
    res = await use_case.execute("test@example.com")

    assert (
        res.message
        == "If this email is registered, you will receive instructions shortly."
    )
    token_repo.save.assert_not_called()
