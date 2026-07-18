"""fix books schema: convert genres to jsonb

Revision ID: c3d4e5f6a7b8
Revises: b7c1e2d3f4a5
Create Date: 2026-07-09 12:00:00.000000+00:00

finished_reading_at was already present in the DB before this migration
(added manually); only the genres type conversion is applied here.
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "c3d4e5f6a7b8"
down_revision: str | None = "b7c1e2d3f4a5"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Convert genres from character varying[] (ARRAY) to jsonb.
    # Must drop the ARRAY default first — PostgreSQL can't auto-cast it.
    op.alter_column("books", "genres", server_default=None)
    op.execute(
        "ALTER TABLE books ALTER COLUMN genres TYPE jsonb USING to_jsonb(genres)"
    )
    op.alter_column("books", "genres", server_default=sa.text("'[]'::jsonb"))


def downgrade() -> None:
    op.alter_column("books", "genres", server_default=None)
    op.execute(
        "ALTER TABLE books ALTER COLUMN genres TYPE text[] USING ARRAY(SELECT jsonb_array_elements_text(genres))"
    )
    op.alter_column("books", "genres", server_default=sa.text("'{}'::text[]"))
