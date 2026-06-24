import os
from uuid import uuid4

import pytest

os.environ.setdefault(
    "SECRET_KEY", "test-secret-key-that-is-at-least-32-characters-long"
)

from app.infrastructure.security.jwt_service import (
    create_access_token,
    decode_access_token,
)


def test_create_and_decode_access_token():
    user_id = uuid4()
    token = create_access_token(user_id)
    payload = decode_access_token(token)
    assert payload["sub"] == str(user_id)
    assert payload["type"] == "access"


def test_decode_invalid_token_raises():
    with pytest.raises(ValueError):
        decode_access_token("invalid.token.here")


def test_decode_wrong_type_raises():
    from datetime import UTC, datetime, timedelta

    from jose import jwt

    from app.infrastructure.config.settings import get_settings

    settings = get_settings()
    payload = {
        "sub": str(uuid4()),
        "exp": datetime.now(UTC) + timedelta(hours=1),
        "type": "refresh",
    }
    token = jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)
    with pytest.raises(ValueError):
        decode_access_token(token)
