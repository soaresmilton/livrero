from sqlalchemy import JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.types import TypeDecorator


class StringArray(TypeDecorator):
    """jsonb on PostgreSQL, JSON on other dialects (e.g. SQLite in tests)."""

    impl = JSON
    cache_ok = True

    def load_dialect_impl(self, dialect):
        """Pick JSONB on PostgreSQL, plain JSON on any other dialect."""
        if dialect.name == "postgresql":
            return dialect.type_descriptor(JSONB())
        return dialect.type_descriptor(JSON())

    def process_bind_param(self, value, dialect):
        """Normalize None to an empty list before writing to the database."""
        return value if value is not None else []

    def process_result_value(self, value, dialect):
        """Normalize a NULL column value to an empty list when reading."""
        return value if value is not None else []
