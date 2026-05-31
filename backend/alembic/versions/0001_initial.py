"""initial tables: users, bookings, passports

Revision ID: 0001
Revises:
Create Date: 2026-05-30
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── users ──────────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("nickname", sa.String(100), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # ── bookings ───────────────────────────────────────────────────────────
    op.create_table(
        "bookings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("flight_id", sa.String(100), nullable=False),
        sa.Column("flight_data", postgresql.JSON(), nullable=False),
        sa.Column("passengers", postgresql.JSON(), nullable=False),
        sa.Column("seats", postgresql.JSON(), nullable=False, server_default="[]"),
        sa.Column("total_price", sa.Numeric(12, 2), nullable=False),
        sa.Column("currency", sa.String(3), nullable=False, server_default="KGS"),
        sa.Column("status", sa.String(20), nullable=False, server_default="confirmed"),
        sa.Column("external_order_id", sa.String(200), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.create_index("ix_bookings_user_id", "bookings", ["user_id"])

    # ── passports ──────────────────────────────────────────────────────────
    op.create_table(
        "passports",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("surname", sa.String(100), nullable=False),
        sa.Column("names", sa.String(100), nullable=False),
        sa.Column("doc_num", sa.String(20), nullable=False),
        sa.Column("country", sa.String(5), nullable=False),
        sa.Column("dob", sa.String(10), nullable=False),
        sa.Column("sex", sa.String(1), nullable=False),
        sa.Column("expiry", sa.String(10), nullable=False),
        sa.Column("label", sa.String(100), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.create_index("ix_passports_user_id", "passports", ["user_id"])


def downgrade() -> None:
    op.drop_table("passports")
    op.drop_table("bookings")
    op.drop_table("users")
