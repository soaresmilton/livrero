from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass
class RefreshToken:
    """Domain entity representing a hashed JWT refresh token issued to a user."""

    id: UUID
    user_id: UUID
    token_hash: str
    expires_at: datetime
    created_at: datetime
    revoked_at: datetime | None = None


@dataclass
class PasswordResetToken:
    """Domain entity representing a hashed, time-limited password reset token."""

    id: UUID
    user_id: UUID
    token_hash: str
    expires_at: datetime
    created_at: datetime
    used_at: datetime | None = None
