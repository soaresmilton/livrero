from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.token import PasswordResetToken, RefreshToken
from app.infrastructure.persistence.models.token_model import (
    PasswordResetTokenModel,
    RefreshTokenModel,
)


class SQLAlchemyRefreshTokenRepository:
    """SQLAlchemy implementation of the RefreshTokenRepository protocol."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def save(self, token: RefreshToken) -> RefreshToken:
        """Insert a new refresh token row and return the domain entity."""
        model = RefreshTokenModel(
            id=token.id,
            user_id=token.user_id,
            token_hash=token.token_hash,
            expires_at=token.expires_at,
            created_at=token.created_at,
            revoked_at=token.revoked_at,
        )
        self._session.add(model)
        await self._session.flush()
        return token

    async def find_by_hash(self, token_hash: str) -> RefreshToken | None:
        """Fetch a refresh token by its hash, or None if not found."""
        result = await self._session.execute(
            select(RefreshTokenModel).where(RefreshTokenModel.token_hash == token_hash)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def revoke(self, token_id: UUID) -> None:
        """Mark a single refresh token as revoked."""
        result = await self._session.execute(
            select(RefreshTokenModel).where(RefreshTokenModel.id == token_id)
        )
        model = result.scalar_one_or_none()
        if model:
            model.revoked_at = datetime.now(UTC)
            await self._session.flush()

    async def revoke_all_for_user(self, user_id: UUID) -> None:
        """Revoke every currently active refresh token belonging to a user."""
        result = await self._session.execute(
            select(RefreshTokenModel).where(
                RefreshTokenModel.user_id == user_id,
                RefreshTokenModel.revoked_at.is_(None),
            )
        )
        now = datetime.now(UTC)
        for model in result.scalars().all():
            model.revoked_at = now
        await self._session.flush()

    async def count_active_for_user(self, user_id: UUID) -> int:
        """Count a user's non-revoked, unexpired refresh tokens."""
        result = await self._session.execute(
            select(func.count()).where(
                RefreshTokenModel.user_id == user_id,
                RefreshTokenModel.revoked_at.is_(None),
                RefreshTokenModel.expires_at > datetime.now(UTC),
            )
        )
        return result.scalar_one()

    @staticmethod
    def _to_entity(model: RefreshTokenModel) -> RefreshToken:
        """Map an ORM RefreshTokenModel to a RefreshToken domain entity."""
        return RefreshToken(
            id=model.id,
            user_id=model.user_id,
            token_hash=model.token_hash,
            expires_at=model.expires_at,
            created_at=model.created_at,
            revoked_at=model.revoked_at,
        )


class SQLAlchemyPasswordResetTokenRepository:
    """SQLAlchemy implementation of the PasswordResetTokenRepository protocol."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def save(self, token: PasswordResetToken) -> PasswordResetToken:
        """Insert a new password reset token row and return the domain entity."""
        model = PasswordResetTokenModel(
            id=token.id,
            user_id=token.user_id,
            token_hash=token.token_hash,
            expires_at=token.expires_at,
            used_at=token.used_at,
            created_at=token.created_at,
        )
        self._session.add(model)
        await self._session.flush()
        return token

    async def find_by_hash(self, token_hash: str) -> PasswordResetToken | None:
        """Fetch a password reset token by its hash, or None if not found."""
        result = await self._session.execute(
            select(PasswordResetTokenModel).where(
                PasswordResetTokenModel.token_hash == token_hash
            )
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def mark_as_used(self, token_id: UUID) -> None:
        """Mark a password reset token as used."""
        result = await self._session.execute(
            select(PasswordResetTokenModel).where(
                PasswordResetTokenModel.id == token_id
            )
        )
        model = result.scalar_one_or_none()
        if model:
            model.used_at = datetime.now(UTC)
            await self._session.flush()

    @staticmethod
    def _to_entity(model: PasswordResetTokenModel) -> PasswordResetToken:
        """Map an ORM PasswordResetTokenModel to a PasswordResetToken domain entity."""
        return PasswordResetToken(
            id=model.id,
            user_id=model.user_id,
            token_hash=model.token_hash,
            expires_at=model.expires_at,
            created_at=model.created_at,
            used_at=model.used_at,
        )
