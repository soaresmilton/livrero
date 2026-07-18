import hashlib

from app.domain.repositories.token_repository import RefreshTokenRepository
from app.shared.exceptions import UnauthorizedError


class LogoutUser:
    """Use case for logging out a user by revoking their refresh token."""

    def __init__(self, refresh_token_repository: RefreshTokenRepository) -> None:
        self._tokens = refresh_token_repository

    async def execute(self, raw_refresh_token: str) -> None:
        """Revoke the given refresh token, invalidating the user's session."""
        token_hash = hashlib.sha256(raw_refresh_token.encode()).hexdigest()
        token = await self._tokens.find_by_hash(token_hash)

        if not token or token.revoked_at is not None:
            raise UnauthorizedError("Invalid or expired session")

        await self._tokens.revoke(token.id)
