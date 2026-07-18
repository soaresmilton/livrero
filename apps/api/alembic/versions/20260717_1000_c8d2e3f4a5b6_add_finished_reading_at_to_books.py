"""add finished_reading_at to books

Revision ID: c8d2e3f4a5b6
Revises: b7c1e2d3f4a5
Create Date: 2026-07-17 10:00:00.000000+00:00

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "c8d2e3f4a5b6"
down_revision: str | None = "b7c1e2d3f4a5"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "books",
        sa.Column("finished_reading_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("books", "finished_reading_at")
