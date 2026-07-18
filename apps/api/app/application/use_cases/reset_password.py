import hashlib
from datetime import UTC, datetime

from app.application.dto.auth_dto import MessageResponse, ResetPasswordRequest
from app.domain.repositories.token_repository import PasswordResetTokenRepository
from app.domain.repositories.user_repository import UserRepository
from app.infrastructure.security.password_service import hash_password
from app.shared.exceptions import LivreroError


class ResetPassword:
    """Use case for completing a password reset using a valid reset token."""

    def __init__(
        self,
        user_repository: UserRepository,
        reset_token_repository: PasswordResetTokenRepository,
    ) -> None:
        self._users = user_repository
        self._reset_tokens = reset_token_repository

    async def execute(self, request: ResetPasswordRequest) -> MessageResponse:
        """Validate the reset token and set the user's new password."""
        token_hash = hashlib.sha256(request.token.encode()).hexdigest()
        token = await self._reset_tokens.find_by_hash(token_hash)

        now = datetime.now(UTC)
        if not token or token.used_at is not None or token.expires_at < now:
            raise LivreroError("Invalid or expired reset token")

        user = await self._users.find_by_id(token.user_id)
        if not user:
            raise LivreroError("Invalid or expired reset token")

        user.password_hash = hash_password(request.new_password)
        user.updated_at = now
        await self._users.update(user)
        await self._reset_tokens.mark_as_used(token.id)

        return MessageResponse(message="Password updated successfully.")
