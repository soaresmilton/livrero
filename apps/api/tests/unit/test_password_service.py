from app.infrastructure.security.password_service import hash_password, verify_password


def test_hash_password_returns_bcrypt_hash():
    hashed = hash_password("mysecretpassword")
    assert hashed.startswith("$2b$")
    assert hashed != "mysecretpassword"


def test_verify_password_correct():
    hashed = hash_password("correctpassword")
    assert verify_password("correctpassword", hashed) is True


def test_verify_password_wrong():
    hashed = hash_password("correctpassword")
    assert verify_password("wrongpassword", hashed) is False


def test_hash_is_unique_per_call():
    hashed1 = hash_password("samepassword")
    hashed2 = hash_password("samepassword")
    assert hashed1 != hashed2  # bcrypt uses random salt
