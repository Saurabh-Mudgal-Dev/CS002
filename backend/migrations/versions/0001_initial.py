"""initial migration

Revision ID: 0001_initial
Revises: 
Create Date: 2026-10-27 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Organizations
    op.create_table(
        'organizations',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('name', sa.String(150), nullable=False),
        sa.Column('org_type', sa.String(20), nullable=False),
        sa.Column('currency', sa.String(10), nullable=False, server_default='INR'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )

    # 2. Users
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('org_id', sa.Integer(), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('full_name', sa.String(100), nullable=False),
        sa.Column('email', sa.String(120), nullable=False, unique=True, index=True),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('role', sa.String(30), nullable=False, server_default='volunteer'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )

    # 3. Inventory Items
    op.create_table(
        'inventory_items',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('org_id', sa.Integer(), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('name', sa.String(200), nullable=False, index=True),
        sa.Column('sku', sa.String(50), nullable=False),
        sa.Column('category', sa.String(100), nullable=False, index=True),
        sa.Column('unit', sa.String(30), nullable=False, server_default='Unit'),
        sa.Column('quantity_on_hand', sa.Numeric(12, 2), nullable=False, server_default='0.00'),
        sa.Column('reorder_level', sa.Integer(), nullable=False, server_default='10'),
        sa.Column('unit_cost', sa.Numeric(12, 2), nullable=False, server_default='0.00'),
        sa.Column('unit_price', sa.Numeric(12, 2), nullable=False, server_default='0.00'),
        sa.Column('expiry_date', sa.Date(), nullable=True),
        sa.Column('is_archived', sa.Boolean(), nullable=False, server_default=sa.false(), index=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint('org_id', 'sku', name='uq_inventory_org_sku'),
        sa.CheckConstraint('quantity_on_hand >= 0', name='chk_inventory_quantity_non_negative'),
    )
    op.create_index('ix_inventory_org_name', 'inventory_items', ['org_id', 'name'])
    op.create_index('ix_inventory_org_category', 'inventory_items', ['org_id', 'category'])

    # 4. Stock Movements
    op.create_table(
        'stock_movements',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('org_id', sa.Integer(), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('item_id', sa.Integer(), sa.ForeignKey('inventory_items.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('movement_type', sa.String(30), nullable=False),
        sa.Column('quantity_delta', sa.Numeric(12, 2), nullable=False),
        sa.Column('unit_value', sa.Numeric(12, 2), nullable=False, server_default='0.00'),
        sa.Column('total_value', sa.Numeric(12, 2), nullable=False, server_default='0.00'),
        sa.Column('reference_type', sa.String(50), nullable=True),
        sa.Column('reference_id', sa.Integer(), nullable=True),
        sa.Column('note', sa.String(255), nullable=True),
        sa.Column('actor_user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_movements_org_created_at', 'stock_movements', ['org_id', 'created_at'])

    # 5. Purchases
    op.create_table(
        'purchases',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('org_id', sa.Integer(), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('item_id', sa.Integer(), sa.ForeignKey('inventory_items.id', ondelete='RESTRICT'), nullable=False, index=True),
        sa.Column('invoice_no', sa.String(100), nullable=False),
        sa.Column('supplier_name', sa.String(150), nullable=False),
        sa.Column('quantity', sa.Numeric(12, 2), nullable=False),
        sa.Column('unit_cost', sa.Numeric(12, 2), nullable=False),
        sa.Column('total_amount', sa.Numeric(12, 2), nullable=False),
        sa.Column('payment_status', sa.String(20), nullable=False, server_default='unpaid'),
        sa.Column('purchase_date', sa.Date(), nullable=False),
        sa.Column('created_by', sa.Integer(), sa.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False, index=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )

    # 6. Donations
    op.create_table(
        'donations',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('org_id', sa.Integer(), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('donor_name', sa.String(150), nullable=False),
        sa.Column('donation_type', sa.String(20), nullable=False),
        sa.Column('amount', sa.Numeric(12, 2), nullable=False, server_default='0.00'),
        sa.Column('item_id', sa.Integer(), sa.ForeignKey('inventory_items.id', ondelete='SET NULL'), nullable=True, index=True),
        sa.Column('quantity', sa.Numeric(12, 2), nullable=True),
        sa.Column('declared_value', sa.Numeric(12, 2), nullable=False, server_default='0.00'),
        sa.Column('purpose', sa.String(255), nullable=True),
        sa.Column('receipt_no', sa.String(100), nullable=False),
        sa.Column('donation_date', sa.Date(), nullable=False),
        sa.Column('recorded_by', sa.Integer(), sa.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False, index=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint('org_id', 'receipt_no', name='uq_donations_org_receipt'),
    )

    # 7. Expenses
    op.create_table(
        'expenses',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('org_id', sa.Integer(), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('category', sa.String(50), nullable=False),
        sa.Column('amount', sa.Numeric(12, 2), nullable=False),
        sa.Column('description', sa.String(255), nullable=False),
        sa.Column('expense_date', sa.Date(), nullable=False),
        sa.Column('receipt_no', sa.String(100), nullable=True),
        sa.Column('recorded_by', sa.Integer(), sa.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False, index=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint('amount >= 0', name='chk_expenses_amount_non_negative'),
    )

    # 8. Activity Logs
    op.create_table(
        'activity_logs',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('org_id', sa.Integer(), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('actor_user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True),
        sa.Column('action', sa.String(50), nullable=False),
        sa.Column('entity_type', sa.String(50), nullable=False),
        sa.Column('entity_id', sa.Integer(), nullable=True),
        sa.Column('summary', sa.String(255), nullable=False),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_audit_logs_org_created_at', 'activity_logs', ['org_id', 'created_at'])


def downgrade() -> None:
    op.drop_table('activity_logs')
    op.drop_table('expenses')
    op.drop_table('donations')
    op.drop_table('purchases')
    op.drop_table('stock_movements')
    op.drop_table('inventory_items')
    op.drop_table('users')
    op.drop_table('organizations')
