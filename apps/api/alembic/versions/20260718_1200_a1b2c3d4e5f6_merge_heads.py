"""merge finished_reading_at and genres jsonb branches

Revision ID: a1b2c3d4e5f6
Revises: c3d4e5f6a7b8, c8d2e3f4a5b6
Create Date: 2026-07-18 12:00:00.000000+00:00

Reconciles the two divergent heads that both descended from b7c1e2d3f4a5:
- c3d4e5f6a7b8 (convert genres to jsonb)
- c8d2e3f4a5b6 (add finished_reading_at)

No schema changes; this is a no-op merge revision.
"""

from collections.abc import Sequence

# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6"
down_revision: str | Sequence[str] | None = ("c3d4e5f6a7b8", "c8d2e3f4a5b6")
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
