from datetime import datetime, timezone
from decimal import Decimal
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.finance import Purchase, Donation, Expense
from app.models.inventory import InventoryItem
from app.models.audit import ActivityLog
from app.schemas.finance import PurchaseCreate, DonationCreate, ExpenseCreate, FinanceSummary
from app.services.stock import record_movement


def create_purchase_record(
    db: Session,
    org_id: int,
    user_id: int,
    data: PurchaseCreate,
    ip_address: str = "127.0.0.1"
) -> Purchase:
    """
    Creates a purchase record:
      - Validates item belongs to org
      - Calculates total_amount = quantity * unit_cost
      - Immediately restocks via record_movement (reference_type='purchase')
      - Updates item unit_cost (last cost)
      - Logs audit entry
    """
    item = db.query(InventoryItem).filter(
        InventoryItem.id == data.item_id,
        InventoryItem.org_id == org_id
    ).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found in this organization."
        )

    total_amount = (data.quantity * data.unit_cost).quantize(Decimal("0.01"))

    # Update item's last cost
    item.unit_cost = data.unit_cost

    purchase = Purchase(
        org_id=org_id,
        item_id=data.item_id,
        invoice_no=data.invoice_no.strip(),
        supplier_name=data.supplier_name.strip(),
        quantity=data.quantity,
        unit_cost=data.unit_cost,
        total_amount=total_amount,
        payment_status=data.payment_status.lower(),
        purchase_date=data.purchase_date or datetime.now(timezone.utc).date(),
        created_by=user_id
    )
    db.add(purchase)
    db.flush()

    # Restock immediately
    record_movement(
        db=db,
        org_id=org_id,
        item_id=data.item_id,
        movement_type="RESTOCK",
        quantity=data.quantity,
        actor_user_id=user_id,
        note=f"Purchase from {data.supplier_name} (Invoice #{data.invoice_no})",
        reference_type="purchase",
        reference_id=purchase.id,
        ip_address=ip_address
    )

    activity = ActivityLog(
        org_id=org_id,
        actor_user_id=user_id,
        action="create",
        entity_type="purchase",
        entity_id=purchase.id,
        summary=f"Recorded purchase of {data.quantity} {item.unit} {item.name} for ₹{total_amount} (Inv #{data.invoice_no})",
        ip_address=ip_address
    )
    db.add(activity)

    return purchase


def create_donation_record(
    db: Session,
    org_id: int,
    user_id: int,
    data: DonationCreate,
    ip_address: str = "127.0.0.1"
) -> Donation:
    """
    Creates a donation record:
      - Validates unique receipt_no per org
      - If goods donation, validates item and restocks via record_movement
      - If cash donation, updates financial records
      - Logs audit entry
    """
    existing = db.query(Donation).filter(
        Donation.org_id == org_id,
        Donation.receipt_no == data.receipt_no.strip()
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Donation receipt number '{data.receipt_no}' already exists in this organization."
        )

    d_type = data.donation_type.lower().strip()
    if d_type not in ["cash", "goods"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Donation type must be 'cash' or 'goods'."
        )

    if d_type == "goods":
        if not data.item_id or not data.quantity or data.quantity <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Goods donation requires a valid item_id and quantity > 0."
            )
        item = db.query(InventoryItem).filter(
            InventoryItem.id == data.item_id,
            InventoryItem.org_id == org_id
        ).first()
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item not found for goods donation."
            )

    donation = Donation(
        org_id=org_id,
        donor_name=data.donor_name.strip(),
        donation_type=d_type,
        amount=data.amount if d_type == "cash" else Decimal("0.00"),
        item_id=data.item_id if d_type == "goods" else None,
        quantity=data.quantity if d_type == "goods" else None,
        declared_value=data.declared_value,
        purpose=data.purpose.strip() if data.purpose else None,
        receipt_no=data.receipt_no.strip(),
        donation_date=data.donation_date or datetime.now(timezone.utc).date(),
        recorded_by=user_id
    )
    db.add(donation)
    db.flush()

    if d_type == "goods":
        record_movement(
            db=db,
            org_id=org_id,
            item_id=data.item_id,
            movement_type="RESTOCK",
            quantity=data.quantity,
            actor_user_id=user_id,
            note=f"In-kind goods donation from {data.donor_name} (Receipt #{data.receipt_no})",
            reference_type="donation",
            reference_id=donation.id,
            ip_address=ip_address
        )

    summary_text = (
        f"Recorded cash donation of ₹{data.amount} from {data.donor_name} (Receipt #{data.receipt_no})"
        if d_type == "cash"
        else f"Recorded goods donation of {data.quantity} units from {data.donor_name} (Receipt #{data.receipt_no})"
    )
    activity = ActivityLog(
        org_id=org_id,
        actor_user_id=user_id,
        action="create",
        entity_type="donation",
        entity_id=donation.id,
        summary=summary_text,
        ip_address=ip_address
    )
    db.add(activity)

    return donation


def create_expense_record(
    db: Session,
    org_id: int,
    user_id: int,
    data: ExpenseCreate,
    ip_address: str = "127.0.0.1"
) -> Expense:
    """
    Creates an expense record:
      - Validates category
      - Logs audit entry
    """
    valid_categories = ["rent", "utilities", "salaries", "transport", "supplies", "maintenance", "other"]
    cat = data.category.lower().strip()
    if cat not in valid_categories:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid expense category '{data.category}'. Allowed: {', '.join(valid_categories)}"
        )

    expense = Expense(
        org_id=org_id,
        category=cat,
        amount=data.amount,
        description=data.description.strip(),
        expense_date=data.expense_date or datetime.now(timezone.utc).date(),
        receipt_no=data.receipt_no.strip() if data.receipt_no else None,
        recorded_by=user_id
    )
    db.add(expense)
    db.flush()

    activity = ActivityLog(
        org_id=org_id,
        actor_user_id=user_id,
        action="create",
        entity_type="expense",
        entity_id=expense.id,
        summary=f"Recorded expense of ₹{data.amount} for {cat}: {data.description}",
        ip_address=ip_address
    )
    db.add(activity)

    return expense


def get_finance_summary(db: Session, org_id: int) -> FinanceSummary:
    """
    Computes finance KPIs as defined in §9.3:
      cash_income     = Σ cash donations + Σ sale revenue
      expenses        = Σ expenses + Σ paid purchases
      net_position    = cash_income − expenses
      inventory_value = Σ (quantity_on_hand × unit_cost)
    """
    from sqlalchemy import func
    from app.models.movement import StockMovement

    # Cash donations
    cash_donations = db.query(func.coalesce(func.sum(Donation.amount), 0)).filter(
        Donation.org_id == org_id,
        Donation.donation_type == "cash"
    ).scalar() or Decimal("0.00")

    # Sales revenue from movements
    sales_rev = db.query(func.coalesce(func.sum(StockMovement.total_value), 0)).filter(
        StockMovement.org_id == org_id,
        StockMovement.movement_type == "SALE"
    ).scalar() or Decimal("0.00")

    cash_income = (Decimal(str(cash_donations)) + Decimal(str(sales_rev))).quantize(Decimal("0.01"))

    # Direct expenses
    direct_expenses = db.query(func.coalesce(func.sum(Expense.amount), 0)).filter(
        Expense.org_id == org_id
    ).scalar() or Decimal("0.00")

    # Paid purchases
    paid_purchases = db.query(func.coalesce(func.sum(Purchase.total_amount), 0)).filter(
        Purchase.org_id == org_id,
        Purchase.payment_status == "paid"
    ).scalar() or Decimal("0.00")

    total_purchases_all = db.query(func.coalesce(func.sum(Purchase.total_amount), 0)).filter(
        Purchase.org_id == org_id
    ).scalar() or Decimal("0.00")

    total_expenses = (Decimal(str(direct_expenses)) + Decimal(str(paid_purchases))).quantize(Decimal("0.01"))
    net_position = (cash_income - total_expenses).quantize(Decimal("0.01"))

    # Inventory Valuation
    items = db.query(InventoryItem).filter(
        InventoryItem.org_id == org_id,
        InventoryItem.is_archived == False
    ).all()
    inventory_value = sum((i.quantity_on_hand * i.unit_cost for i in items), Decimal("0.00")).quantize(Decimal("0.01"))

    total_donations_val = db.query(func.coalesce(func.sum(Donation.amount), 0)).filter(
        Donation.org_id == org_id
    ).scalar() or Decimal("0.00")

    return FinanceSummary(
        cash_income=cash_income,
        expenses=total_expenses,
        net_position=net_position,
        inventory_value=inventory_value,
        total_purchases=Decimal(str(total_purchases_all)),
        total_donations=Decimal(str(total_donations_val)),
        total_expenses=Decimal(str(direct_expenses))
    )
