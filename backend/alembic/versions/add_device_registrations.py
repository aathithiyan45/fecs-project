"""Add device_registrations table

Revision ID: add_device_registrations
Revises: add_user_fields
Create Date: 2024-01-15

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_device_registrations'
down_revision = 'add_user_fields'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'device_registrations',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('device_id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('phone_number', sa.String(), nullable=False),
        sa.Column('registered_by_emp_id', sa.String(), nullable=False),
        sa.Column('registered_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('is_active', sa.Integer(), server_default='1', nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('device_id')
    )
    op.create_index('ix_device_registrations_id', 'device_registrations', ['id'])
    op.create_index('ix_device_registrations_device_id', 'device_registrations', ['device_id'])


def downgrade():
    op.drop_index('ix_device_registrations_device_id', 'device_registrations')
    op.drop_index('ix_device_registrations_id', 'device_registrations')
    op.drop_table('device_registrations')
