"""Add employee_id and assigned_station to users

Revision ID: add_user_fields
Revises: 
Create Date: 2024-01-15

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_user_fields'
down_revision = 'e00e0fa66f91'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('users', sa.Column('employee_id', sa.String(), nullable=True))
    op.add_column('users', sa.Column('assigned_station', sa.String(), nullable=True))
    op.create_unique_constraint('uq_users_employee_id', 'users', ['employee_id'])


def downgrade():
    op.drop_constraint('uq_users_employee_id', 'users', type_='unique')
    op.drop_column('users', 'assigned_station')
    op.drop_column('users', 'employee_id')
