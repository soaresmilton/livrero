"""create reading_goals

Revision ID: b7c1e2d3f4a5
Revises: 2390d258881d
Create Date: 2026-07-06 12:00:00.000000+00:00

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "b7c1e2d3f4a5"
down_revision: str | None = "2390d258881d"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "reading_goals",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("books_goal", sa.Integer(), server_default="0", nullable=False),
        sa.Column("pages_goal", sa.Integer(), server_default="0", nullable=False),
        sa.Column("minutes_goal", sa.Integer(), server_default="0", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "year", name="uq_reading_goals_user_year"),
    )
    op.create_index(
        op.f("ix_reading_goals_user_id"),
        "reading_goals",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_reading_goals_user_id"), table_name="reading_goals")
    op.drop_table("reading_goals")
