from typing import Protocol
from uuid import UUID

from app.domain.entities.token import PasswordResetToken, RefreshToken


class RefreshTokenRepository(Protocol):
    """Repository protocol for persisting and querying refresh tokens."""

    async def save(self, token: RefreshToken) -> RefreshToken:
        """Persist a new refresh token."""
        ...

    async def find_by_hash(self, token_hash: str) -> RefreshToken | None:
        """Fetch a refresh token by its hash, or None if not found."""
        ...

    async def revoke(self, token_id: UUID) -> None:
        """Mark a refresh token as revoked."""
        ...

    async def revoke_all_for_user(self, user_id: UUID) -> None:
        """Revoke all active refresh tokens belonging to a user."""
        ...

    async def count_active_for_user(self, user_id: UUID) -> int:
        """Count the number of active (non-revoked, unexpired) tokens for a user."""
        ...


class PasswordResetTokenRepository(Protocol):
    """Repository protocol for persisting and querying password reset tokens."""

    async def save(self, token: PasswordResetToken) -> PasswordResetToken:
        """Persist a new password reset token."""
        ...

    async def find_by_hash(self, token_hash: str) -> PasswordResetToken | None:
        """Fetch a password reset token by its hash, or None if not found."""
        ...

    async def mark_as_used(self, token_id: UUID) -> None:
        """Mark a password reset token as used."""
        ...
