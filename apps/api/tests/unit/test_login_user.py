from datetime import UTC, datetime
from unittest.mock import AsyncMock, patch
from uuid import uuid4

import pytest

from app.application.dto.auth_dto import LoginRequest
from app.application.use_cases.login_user import LoginUser
from app.domain.entities.user import User
from app.shared.exceptions import UnauthorizedError


@pytest.mark.asyncio
async def test_login_user_success():
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

    use_case = LoginUser(user_repository=user_repo, refresh_token_repository=token_repo)
    req = LoginRequest(email="test@example.com", password="password123")

    with patch(
        "app.application.use_cases.login_user.verify_password", return_value=True
    ):
        res, raw_refresh = await use_case.execute(req)
        assert isinstance(res.access_token, str)
        assert isinstance(raw_refresh, str)
        token_repo.save.assert_called_once()


@pytest.mark.asyncio
async def test_login_user_not_found():
    user_repo = AsyncMock()
    token_repo = AsyncMock()
    user_repo.find_by_email.return_value = None

    use_case = LoginUser(user_repository=user_repo, refresh_token_repository=token_repo)
    req = LoginRequest(email="test@example.com", password="password123")

    with pytest.raises(UnauthorizedError):
        await use_case.execute(req)


@pytest.mark.asyncio
async def test_login_user_wrong_password():
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

    use_case = LoginUser(user_repository=user_repo, refresh_token_repository=token_repo)
    req = LoginRequest(email="test@example.com", password="wrong")

    with patch(
        "app.application.use_cases.login_user.verify_password", return_value=False
    ):
        with pytest.raises(UnauthorizedError):
            await use_case.execute(req)
