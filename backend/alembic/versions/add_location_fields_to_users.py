"""Add latitude and longitude fields to users table

Revision ID: add_location_fields
Revises: add_user_fields
Create Date: 2026-03-23

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_location_fields'
down_revision = 'add_user_fields'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('users', sa.Column('latitude', sa.Float(), nullable=True))
    op.add_column('users', sa.Column('longitude', sa.Float(), nullable=True))


def downgrade():
    op.drop_column('users', 'longitude')
    op.drop_column('users', 'latitude')
