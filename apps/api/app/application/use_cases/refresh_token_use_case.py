import hashlib
import secrets
from datetime import UTC, datetime, timedelta
from uuid import uuid4

from app.application.dto.auth_dto import AccessTokenResponse
from app.domain.entities.token import RefreshToken
from app.domain.repositories.token_repository import RefreshTokenRepository
from app.infrastructure.config.settings import get_settings
from app.infrastructure.security.jwt_service import create_access_token
from app.shared.exceptions import UnauthorizedError


class RefreshTokenUseCase:
    def __init__(self, refresh_token_repository: RefreshTokenRepository) -> None:
        self._tokens = refresh_token_repository
        self._settings = get_settings()

    async def execute(self, raw_refresh_token: str) -> tuple[AccessTokenResponse, str]:
        """Returns (AccessTokenResponse, new_raw_refresh_token)."""
        token_hash = hashlib.sha256(raw_refresh_token.encode()).hexdigest()
        token = await self._tokens.find_by_hash(token_hash)

        now = datetime.now(UTC)
        if not token or token.revoked_at is not None:
            raise UnauthorizedError("Invalid or expired refresh token")

        expires_at = token.expires_at
        if expires_at and expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=UTC)

        if expires_at < now:
            raise UnauthorizedError("Invalid or expired refresh token")

        await self._tokens.revoke(token.id)

        new_raw = secrets.token_urlsafe(32)
        new_hash = hashlib.sha256(new_raw.encode()).hexdigest()

        new_token = RefreshToken(
            id=uuid4(),
            user_id=token.user_id,
            token_hash=new_hash,
            expires_at=now + timedelta(days=self._settings.refresh_token_expire_days),
            created_at=now,
        )
        await self._tokens.save(new_token)

        access_token = create_access_token(token.user_id)
        return AccessTokenResponse(access_token=access_token), new_raw
