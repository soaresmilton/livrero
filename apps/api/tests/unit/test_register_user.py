from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest

from app.application.dto.auth_dto import RegisterRequest
from app.application.use_cases.register_user import RegisterUser
from app.domain.entities.user import User
from app.shared.exceptions import ConflictError


@pytest.mark.asyncio
async def test_register_user_success():
    repo = AsyncMock()
    repo.find_by_email.return_value = None
    mock_user = User(
        id=uuid4(),
        email="test@example.com",
        name="Test",
        password_hash="hashed",
        theme="light",
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    repo.save.return_value = mock_user
    use_case = RegisterUser(user_repository=repo)
    req = RegisterRequest(email="test@example.com", password="password123", name="Test")
    res = await use_case.execute(req)
    assert res.email == "test@example.com"
    repo.save.assert_called_once()


@pytest.mark.asyncio
async def test_register_user_conflict():
    repo = AsyncMock()
    repo.find_by_email.return_value = MagicMock()
    use_case = RegisterUser(user_repository=repo)
    req = RegisterRequest(email="test@example.com", password="password123", name="Test")
    with pytest.raises(ConflictError):
        await use_case.execute(req)
