from datetime import UTC, datetime
from uuid import uuid4

from app.application.dto.auth_dto import RegisterRequest, UserResponse
from app.domain.entities.user import User
from app.domain.repositories.user_repository import UserRepository
from app.infrastructure.security.password_service import hash_password
from app.shared.exceptions import ConflictError


class RegisterUser:
    def __init__(self, user_repository: UserRepository) -> None:
        self._users = user_repository

    async def execute(self, request: RegisterRequest) -> UserResponse:
        email = request.email.lower()

        existing = await self._users.find_by_email(email)
        if existing:
            raise ConflictError("Email already registered")

        now = datetime.now(UTC)
        user = User(
            id=uuid4(),
            name=request.name,
            email=email,
            password_hash=hash_password(request.password),
            theme="light",
            created_at=now,
            updated_at=now,
        )

        saved = await self._users.save(user)
        return UserResponse.model_validate(saved)
