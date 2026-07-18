import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.persistence.database import Base


class ReadingGoalModel(Base):
    """SQLAlchemy ORM model for the `reading_goals` table."""

    __tablename__ = "reading_goals"
    __table_args__ = (
        UniqueConstraint("user_id", "year", name="uq_reading_goals_user_year"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    year: Mapped[int] = mapped_column(Integer)
    books_goal: Mapped[int] = mapped_column(Integer, default=0)
    pages_goal: Mapped[int] = mapped_column(Integer, default=0)
    minutes_goal: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )
