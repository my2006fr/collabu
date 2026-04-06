"""add notifications table

Revision ID: a1b2c3d4e5f6
Revises: ee9fea4b4c83
Create Date: 2026-04-06 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = 'ee9fea4b4c83'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'notifications',
        sa.Column('id',         sa.Integer(),     nullable=False),
        sa.Column('user_id',    sa.Integer(),     nullable=False),
        sa.Column('actor_id',   sa.Integer(),     nullable=True),
        sa.Column('type',       sa.String(40),    nullable=False),
        sa.Column('title',      sa.String(200),   nullable=False),
        sa.Column('body',       sa.Text(),        nullable=True),
        sa.Column('link',       sa.String(300),   nullable=True),
        sa.Column('is_read',    sa.Boolean(),     nullable=True, default=False),
        sa.Column('created_at', sa.DateTime(),    nullable=True),
        sa.ForeignKeyConstraint(['user_id'],  ['users.id']),
        sa.ForeignKeyConstraint(['actor_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_notifications_user_id',  'notifications', ['user_id'],  unique=False)
    op.create_index('ix_notifications_is_read',  'notifications', ['is_read'],  unique=False)
    op.create_index('ix_notifications_created_at','notifications', ['created_at'], unique=False)


def downgrade():
    op.drop_index('ix_notifications_created_at', table_name='notifications')
    op.drop_index('ix_notifications_is_read',    table_name='notifications')
    op.drop_index('ix_notifications_user_id',    table_name='notifications')
    op.drop_table('notifications')
