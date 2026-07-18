"""Guard the dialect-specific impl of the StringArray TypeDecorator.

The test suite runs on SQLite, which only exercises the JSON fallback branch.
The genres column is jsonb on PostgreSQL (migration c3d4e5f6a7b8), so the
PostgreSQL branch must resolve to JSONB — binding a text[] array to a jsonb
column raises a runtime error that SQLite tests never catch.
"""

from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql.asyncpg import PGDialect_asyncpg
from sqlalchemy.dialects.sqlite import dialect as sqlite_dialect
from sqlalchemy.types import JSON

from app.infrastructure.persistence.types import StringArray


def test_postgresql_impl_is_jsonb() -> None:
    impl = StringArray().load_dialect_impl(PGDialect_asyncpg())
    assert isinstance(impl, JSONB)


def test_non_postgresql_impl_is_json() -> None:
    impl = StringArray().load_dialect_impl(sqlite_dialect())
    assert isinstance(impl, JSON)


def test_none_binds_as_empty_list() -> None:
    assert StringArray().process_bind_param(None, sqlite_dialect()) == []


def test_none_result_coalesces_to_empty_list() -> None:
    assert StringArray().process_result_value(None, sqlite_dialect()) == []
