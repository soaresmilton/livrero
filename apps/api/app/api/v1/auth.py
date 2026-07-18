from datetime import UTC, datetime

from fastapi import APIRouter, Cookie, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import get_current_user
from app.application.dto.auth_dto import (
    AccessTokenResponse,
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    UpdateThemeRequest,
    UserResponse,
)
from app.application.use_cases.forgot_password import ForgotPassword
from app.application.use_cases.login_user import LoginUser
from app.application.use_cases.logout_user import LogoutUser
from app.application.use_cases.refresh_token_use_case import RefreshTokenUseCase
from app.application.use_cases.register_user import RegisterUser
from app.application.use_cases.reset_password import ResetPassword
from app.domain.entities.user import User
from app.infrastructure.config.settings import get_settings
from app.infrastructure.persistence.database import get_session
from app.infrastructure.persistence.repositories.token_repository import (
    SQLAlchemyPasswordResetTokenRepository,
    SQLAlchemyRefreshTokenRepository,
)
from app.infrastructure.persistence.repositories.user_repository import (
    SQLAlchemyUserRepository,
)
from app.shared.exceptions import (
    ConflictError,
    LivreroError,
    UnauthorizedError,
    bad_request,
    conflict,
    unauthorized,
)

router = APIRouter(prefix="/auth", tags=["auth"])
_settings = get_settings()

REFRESH_COOKIE_NAME = "refresh_token"


def _set_refresh_cookie(response: Response, raw_token: str) -> None:
    """Set the HttpOnly refresh token cookie scoped to the auth routes."""
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=raw_token,
        httponly=True,
        samesite="lax",
        secure=_settings.environment != "development",
        path="/api/v1/auth",
        max_age=_settings.refresh_token_expire_days * 24 * 60 * 60,
    )


@router.post(
    "/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
async def register(
    body: RegisterRequest,
    session: AsyncSession = Depends(get_session),
) -> UserResponse:
    """Register a new user account."""
    use_case = RegisterUser(user_repository=SQLAlchemyUserRepository(session))
    try:
        return await use_case.execute(body)
    except ConflictError as e:
        raise conflict(e.message) from e


@router.post("/login", response_model=TokenResponse)
async def login(
    body: LoginRequest,
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> TokenResponse:
    """Authenticate a user and set the refresh token cookie."""
    use_case = LoginUser(
        user_repository=SQLAlchemyUserRepository(session),
        refresh_token_repository=SQLAlchemyRefreshTokenRepository(session),
    )
    try:
        token_response, raw_refresh = await use_case.execute(body)
    except UnauthorizedError as e:
        raise unauthorized(e.message) from e
    _set_refresh_cookie(response, raw_refresh)
    return token_response


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    response: Response,
    refresh_token: str | None = Cookie(default=None, alias=REFRESH_COOKIE_NAME),
    session: AsyncSession = Depends(get_session),
) -> None:
    """Revoke the refresh token (if present) and clear the refresh cookie."""
    if refresh_token:
        use_case = LogoutUser(
            refresh_token_repository=SQLAlchemyRefreshTokenRepository(session)
        )
        try:
            await use_case.execute(refresh_token)
        except UnauthorizedError:
            pass
    response.delete_cookie(key=REFRESH_COOKIE_NAME, path="/api/v1/auth")


@router.post("/refresh", response_model=AccessTokenResponse)
async def refresh(
    response: Response,
    refresh_token: str | None = Cookie(default=None, alias=REFRESH_COOKIE_NAME),
    session: AsyncSession = Depends(get_session),
) -> AccessTokenResponse:
    """Rotate the refresh token and issue a new access token."""
    if not refresh_token:
        raise unauthorized("No refresh token provided")
    use_case = RefreshTokenUseCase(
        refresh_token_repository=SQLAlchemyRefreshTokenRepository(session)
    )
    try:
        access_response, new_raw = await use_case.execute(refresh_token)
    except UnauthorizedError as e:
        response.delete_cookie(key=REFRESH_COOKIE_NAME, path="/api/v1/auth")
        raise unauthorized(e.message) from e
    _set_refresh_cookie(response, new_raw)
    return access_response


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)) -> UserResponse:
    """Return the currently authenticated user's profile."""
    return UserResponse.model_validate(current_user)


@router.patch("/me/theme", response_model=UserResponse)
async def update_theme(
    body: UpdateThemeRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> UserResponse:
    """Update the current user's UI theme preference."""
    current_user.theme = body.theme
    current_user.updated_at = datetime.now(UTC)
    updated = await SQLAlchemyUserRepository(session).update(current_user)
    return UserResponse.model_validate(updated)


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    body: ForgotPasswordRequest,
    session: AsyncSession = Depends(get_session),
) -> MessageResponse:
    """Initiate a password reset for the given email, if registered."""
    use_case = ForgotPassword(
        user_repository=SQLAlchemyUserRepository(session),
        reset_token_repository=SQLAlchemyPasswordResetTokenRepository(session),
    )
    return await use_case.execute(body.email)


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    body: ResetPasswordRequest,
    session: AsyncSession = Depends(get_session),
) -> MessageResponse:
    """Complete a password reset using a valid reset token."""
    use_case = ResetPassword(
        user_repository=SQLAlchemyUserRepository(session),
        reset_token_repository=SQLAlchemyPasswordResetTokenRepository(session),
    )
    try:
        return await use_case.execute(body)
    except LivreroError as e:
        raise bad_request(e.message) from e
