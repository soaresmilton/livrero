from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.user import User
from app.infrastructure.persistence.models.user_model import UserModel


class SQLAlchemyUserRepository:
    """SQLAlchemy implementation of the UserRepository protocol."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def find_by_id(self, user_id: UUID) -> User | None:
        """Fetch a user by their id, or None if not found."""
        result = await self._session.execute(
            select(UserModel).where(UserModel.id == user_id)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def find_by_email(self, email: str) -> User | None:
        """Fetch a user by their email (case-insensitive), or None if not found."""
        result = await self._session.execute(
            select(UserModel).where(UserModel.email == email.lower())
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def save(self, user: User) -> User:
        """Insert a new user row and return the domain entity."""
        model = UserModel(
            id=user.id,
            name=user.name,
            email=user.email,
            password_hash=user.password_hash,
            theme=user.theme,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )
        self._session.add(model)
        await self._session.flush()
        return user

    async def update(self, user: User) -> User:
        """Persist changes from the domain entity onto the existing row."""
        result = await self._session.execute(
            select(UserModel).where(UserModel.id == user.id)
        )
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError(f"User {user.id} not found")
        model.name = user.name
        model.email = user.email
        model.password_hash = user.password_hash
        model.theme = user.theme
        model.updated_at = user.updated_at
        await self._session.flush()
        return user

    @staticmethod
    def _to_entity(model: UserModel) -> User:
        """Map an ORM UserModel to a User domain entity."""
        return User(
            id=model.id,
            name=model.name,
            email=model.email,
            password_hash=model.password_hash,
            theme=model.theme,  # type: ignore[arg-type]
            created_at=model.created_at,
            updated_at=model.updated_at,
        )
