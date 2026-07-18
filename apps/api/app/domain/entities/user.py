from dataclasses import dataclass
from datetime import datetime
from typing import Literal
from uuid import UUID


@dataclass
class User:
    """Domain entity representing an application user."""

    id: UUID
    name: str
    email: str
    password_hash: str
    theme: Literal["light", "dark"]
    created_at: datetime
    updated_at: datetime
