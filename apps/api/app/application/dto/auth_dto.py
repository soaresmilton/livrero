from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    """Request payload for registering a new user."""

    name: str = Field(min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    """Request payload for logging in with email and password."""

    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """API response representation of a user."""

    id: UUID
    name: str
    email: str
    theme: Literal["light", "dark"]
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """API response containing an access token and the authenticated user."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class AccessTokenResponse(BaseModel):
    """API response containing a freshly issued access token."""

    access_token: str
    token_type: str = "bearer"


class ForgotPasswordRequest(BaseModel):
    """Request payload for initiating a password reset."""

    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Request payload for completing a password reset."""

    token: str
    new_password: str = Field(min_length=8, max_length=128)


class UpdateThemeRequest(BaseModel):
    """Request payload for updating a user's UI theme preference."""

    theme: Literal["light", "dark"]


class MessageResponse(BaseModel):
    """Generic API response carrying a human-readable message."""

    message: str
