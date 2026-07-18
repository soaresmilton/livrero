from pwdlib import PasswordHash
from pwdlib.hashers.bcrypt import BcryptHasher

_pwd_context = PasswordHash((BcryptHasher(),))


def hash_password(plain: str) -> str:
    """Hash a plaintext password using bcrypt."""
    return _pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Check whether a plaintext password matches a bcrypt hash."""
    return _pwd_context.verify(plain, hashed)
