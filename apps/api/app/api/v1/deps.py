from uuid import UUID

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.user import User
from app.domain.repositories.book_repository import BookRepository
from app.infrastructure.integrations.open_library import OpenLibraryIntegration
from app.infrastructure.persistence.database import get_session
from app.infrastructure.persistence.repositories.book_repository import (
    SQLAlchemyBookRepository,
)
from app.infrastructure.persistence.repositories.user_repository import (
    SQLAlchemyUserRepository,
)
from app.infrastructure.security.jwt_service import decode_access_token
from app.shared.exceptions import unauthorized

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: AsyncSession = Depends(get_session),
) -> User:
    try:
        payload = decode_access_token(credentials.credentials)
        user_id = UUID(payload["sub"])
    except (ValueError, KeyError) as e:
        raise unauthorized("Invalid access token") from e

    user_repo = SQLAlchemyUserRepository(session)
    user = await user_repo.find_by_id(user_id)

    if not user:
        raise unauthorized("User not found")

    return user


def get_book_repository(session: AsyncSession = Depends(get_session)) -> BookRepository:
    return SQLAlchemyBookRepository(session)


def get_open_library() -> OpenLibraryIntegration:
    return OpenLibraryIntegration()
