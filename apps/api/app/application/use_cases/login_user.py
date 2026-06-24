import hashlib
import secrets
from datetime import UTC, datetime, timedelta
from uuid import uuid4

from app.application.dto.auth_dto import LoginRequest, TokenResponse, UserResponse
from app.domain.entities.token import RefreshToken
from app.domain.repositories.token_repository import RefreshTokenRepository
from app.domain.repositories.user_repository import UserRepository
from app.infrastructure.config.settings import get_settings
from app.infrastructure.security.jwt_service import create_access_token
from app.infrastructure.security.password_service import verify_password
from app.shared.exceptions import UnauthorizedError


class LoginUser:
    def __init__(
        self,
        user_repository: UserRepository,
        refresh_token_repository: RefreshTokenRepository,
    ) -> None:
        self._users = user_repository
        self._tokens = refresh_token_repository
        self._settings = get_settings()

    async def execute(self, request: LoginRequest) -> tuple[TokenResponse, str]:
        """Returns (TokenResponse, raw_refresh_token)."""
        email = request.email.lower()
        user = await self._users.find_by_email(email)

        if not user or not verify_password(request.password, user.password_hash):
            raise UnauthorizedError("Invalid email or password")

        raw_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()

        now = datetime.now(UTC)
        refresh_token = RefreshToken(
            id=uuid4(),
            user_id=user.id,
            token_hash=token_hash,
            expires_at=now + timedelta(days=self._settings.refresh_token_expire_days),
            created_at=now,
        )
        await self._tokens.save(refresh_token)

        access_token = create_access_token(user.id)
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        ), raw_token
