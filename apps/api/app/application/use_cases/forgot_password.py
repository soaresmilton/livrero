import hashlib
import logging
import secrets
from datetime import UTC, datetime, timedelta
from uuid import uuid4

from app.application.dto.auth_dto import MessageResponse
from app.domain.entities.token import PasswordResetToken
from app.domain.repositories.token_repository import PasswordResetTokenRepository
from app.domain.repositories.user_repository import UserRepository

logger = logging.getLogger(__name__)


class ForgotPassword:
    """Use case for initiating a password reset by issuing a reset token."""

    def __init__(
        self,
        user_repository: UserRepository,
        reset_token_repository: PasswordResetTokenRepository,
    ) -> None:
        self._users = user_repository
        self._reset_tokens = reset_token_repository

    async def execute(self, email: str) -> MessageResponse:
        """Issue a password reset token for the email if a matching user exists.

        Always returns the same generic message regardless of whether the
        email is registered, to avoid leaking account existence.
        """
        user = await self._users.find_by_email(email.lower())

        if user:
            raw_token = secrets.token_urlsafe(32)
            token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
            now = datetime.now(UTC)

            reset_token = PasswordResetToken(
                id=uuid4(),
                user_id=user.id,
                token_hash=token_hash,
                expires_at=now + timedelta(minutes=15),
                created_at=now,
            )
            await self._reset_tokens.save(reset_token)

            # DEV MODE: log token — replace with real email service in future
            logger.info(
                "[DEV] Password reset token for %s: %s",
                user.email,
                raw_token,
            )

        return MessageResponse(
            message="If this email is registered, you will receive instructions shortly."
        )
