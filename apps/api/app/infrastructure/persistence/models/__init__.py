# Import all models so SQLAlchemy metadata is populated for Alembic
from app.infrastructure.persistence.models.book_model import BookModel  # noqa: F401
from app.infrastructure.persistence.models.reading_session_model import (
    ReadingSessionModel,
)  # noqa: F401
from app.infrastructure.persistence.models.token_model import (  # noqa: F401
    PasswordResetTokenModel,
    RefreshTokenModel,
)
from app.infrastructure.persistence.models.user_model import UserModel  # noqa: F401

__all__ = [
    "UserModel",
    "RefreshTokenModel",
    "PasswordResetTokenModel",
    "BookModel",
    "ReadingSessionModel",
]
