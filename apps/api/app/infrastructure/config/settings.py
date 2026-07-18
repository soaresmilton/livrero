from functools import lru_cache
from typing import Literal

from pydantic import Field, PostgresDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration, loaded from environment variables / .env."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Application
    app_name: str = "Livrero API"
    debug: bool = False
    environment: Literal["development", "staging", "production"] = "development"

    # Database
    database_url: PostgresDsn = Field(
        default="postgresql+asyncpg://livrero:livrero@localhost:5432/livrero"
    )

    # Security
    secret_key: str = Field(min_length=32)
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 30
    algorithm: str = "HS256"

    # CORS
    cors_origins: list[str] = ["http://localhost:5173"]


@lru_cache
def get_settings() -> Settings:
    """Return the cached application Settings instance."""
    return Settings()
