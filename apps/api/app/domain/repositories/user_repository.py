from typing import Protocol
from uuid import UUID

from app.domain.entities.user import User


class UserRepository(Protocol):
    """Repository protocol for persisting and querying users."""

    async def find_by_id(self, user_id: UUID) -> User | None:
        """Fetch a user by their id, or None if not found."""
        ...

    async def find_by_email(self, email: str) -> User | None:
        """Fetch a user by their email, or None if not found."""
        ...

    async def save(self, user: User) -> User:
        """Persist a new user."""
        ...

    async def update(self, user: User) -> User:
        """Persist changes to an existing user."""
        ...
