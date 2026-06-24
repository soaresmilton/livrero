from fastapi import HTTPException, status


class LivreroError(Exception):
    """Base exception for all Livrero domain errors."""

    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(message)


class NotFoundError(LivreroError):
    """Raised when a requested resource is not found."""


class ConflictError(LivreroError):
    """Raised when a resource already exists."""


class UnauthorizedError(LivreroError):
    """Raised when an action is not authorized."""


class ForbiddenError(LivreroError):
    """Raised when an action is forbidden for the current user."""


# ── HTTP exception factories ──────────────────────────────────────────────────


def not_found(detail: str = "Resource not found") -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


def conflict(detail: str = "Resource already exists") -> HTTPException:
    return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)


def unauthorized(detail: str = "Not authenticated") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def forbidden(detail: str = "Permission denied") -> HTTPException:
    return HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


def bad_request(detail: str = "Bad request") -> HTTPException:
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)
