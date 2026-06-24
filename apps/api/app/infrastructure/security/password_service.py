from pwdlib import PasswordHash
from pwdlib.hashers.bcrypt import BcryptHasher

_pwd_context = PasswordHash((BcryptHasher(),))


def hash_password(plain: str) -> str:
    return _pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return _pwd_context.verify(plain, hashed)
