"""merge heads

Revision ID: d9604645f374
Revises: add_device_registrations, add_radius_to_users
Create Date: 2026-03-23 16:25:56.072091

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd9604645f374'
down_revision = ('add_device_registrations', 'add_radius_to_users')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
