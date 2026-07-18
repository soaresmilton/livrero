from datetime import UTC, datetime, timedelta
from uuid import UUID

from jose import JWTError, jwt

from app.infrastructure.config.settings import get_settings


def create_access_token(user_id: UUID) -> str:
    """Create a signed JWT access token for the given user, with an expiry."""
    settings = get_settings()
    expire = datetime.now(UTC) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {
        "sub": str(user_id),
        "exp": expire,
        "type": "access",
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def decode_access_token(token: str) -> dict:
    """Decode and validate a JWT access token, raising ValueError if invalid."""
    settings = get_settings()
    try:
        payload = jwt.decode(
            token, settings.secret_key, algorithms=[settings.algorithm]
        )
        if payload.get("type") != "access":
            raise ValueError("Invalid token type")
        return payload
    except JWTError as e:
        raise ValueError("Invalid token") from e
