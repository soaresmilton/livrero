from datetime import UTC, datetime

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class HealthResponse(BaseModel):
    """API response reporting service health status."""

    status: str
    timestamp: str
    version: str


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Return a simple liveness check with current timestamp and API version."""
    return HealthResponse(
        status="ok",
        timestamp=datetime.now(UTC).isoformat(),
        version="0.1.0",
    )
