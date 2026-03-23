"""Add radius column to users table

Revision ID: add_radius_to_users
Revises: add_location_fields
Create Date: 2026-03-23

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_radius_to_users'
down_revision = 'add_location_fields'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('users', sa.Column('radius', sa.Float(), nullable=True))

def downgrade():
    op.drop_column('users', 'radius')
