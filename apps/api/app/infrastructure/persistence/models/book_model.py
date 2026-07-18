import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.domain.entities.book import BookStatus
from app.infrastructure.persistence.database import Base
from app.infrastructure.persistence.types import StringArray


class BookModel(Base):
    """SQLAlchemy ORM model for the `books` table."""

    __tablename__ = "books"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    author: Mapped[str] = mapped_column(String(255), nullable=False)
    publisher: Mapped[str | None] = mapped_column(String(200), nullable=True)
    published_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    total_pages: Mapped[int | None] = mapped_column(Integer, nullable=True)
    cover_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    isbn: Mapped[str | None] = mapped_column(String(50), nullable=True)
    genres: Mapped[list] = mapped_column(StringArray, default=list)
    rating: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[BookStatus] = mapped_column(
        Enum(BookStatus, name="book_status_enum", create_type=False), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    is_deleted: Mapped[bool] = mapped_column(default=False)
    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    finished_reading_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    sessions = relationship(
        "ReadingSessionModel", back_populates="book", cascade="all, delete-orphan"
    )
    note = relationship(
        "ReadingNoteModel",
        back_populates="book",
        cascade="all, delete-orphan",
        uselist=False,
    )
