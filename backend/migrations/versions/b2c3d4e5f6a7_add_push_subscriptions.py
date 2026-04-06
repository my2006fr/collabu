"""add push_subscriptions table

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-04-06
"""
from alembic import op
import sqlalchemy as sa

revision = 'b2c3d4e5f6a7'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'push_subscriptions',
        sa.Column('id',                sa.Integer(),     nullable=False),
        sa.Column('user_id',           sa.Integer(),     nullable=False),
        sa.Column('subscription_json', sa.Text(),        nullable=False),
        sa.Column('endpoint',          sa.String(500),   nullable=False),
        sa.Column('created_at',        sa.DateTime(),    nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('endpoint'),
    )


def downgrade():
    op.drop_table('push_subscriptions')
