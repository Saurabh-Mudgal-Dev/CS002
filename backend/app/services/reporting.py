import csv
import io
from datetime import datetime, timezone
from typing import Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.inventory import InventoryItem
from app.models.finance import Purchase, Donation, Expense
from app.models.organization import Organization


def generate_inventory_csv(db: Session, org_id: int) -> Tuple[str, str]:
    """
    Generates UTF-8 BOM encoded inventory CSV with headers and formatted values.
    Returns (csv_string, filename).
    """
    org = db.query(Organization).filter(Organization.id == org_id).first()
    org_slug = (org.name if org else "Org").replace(" ", "_")

    items = db.query(InventoryItem).filter(
        InventoryItem.org_id == org_id,
        InventoryItem.is_archived == False
    ).order_by(InventoryItem.id.asc()).all()

    output = io.StringIO()
    # Add UTF-8 BOM so Excel opens Hindi/special symbols smoothly
    output.write("\ufeff")
    writer = csv.writer(output)
    writer.writerow([
        "Item ID", "SKU", "Item Name", "Category", "Quantity On Hand",
        "Unit", "Reorder Level", "Unit Cost (INR)", "Unit Price (INR)",
        "Total Valuation (INR)", "Expiry Date", "Stock Status", "Expiry Status"
    ])

    for i in items:
        writer.writerow([
            i.id,
            i.sku,
            i.name,
            i.category,
            f"{i.quantity_on_hand:.2f}",
            i.unit,
            i.reorder_level,
            f"{i.unit_cost:.2f}",
            f"{i.unit_price:.2f}",
            f"{i.total_value:.2f}",
            i.expiry_date.strftime("%Y-%m-%d") if i.expiry_date else "N/A",
            i.calculate_status(),
            i.calculate_expiry_status()
        ])

    today_str = datetime.now(timezone.utc).strftime("%Y%m%d")
    filename = f"Inventory_Report_{org_slug}_{today_str}.csv"
    return output.getvalue(), filename


def generate_finance_csv(db: Session, org_id: int) -> Tuple[str, str]:
    """
    Generates UTF-8 BOM encoded combined finance CSV (Purchases, Donations, Expenses).
    Returns (csv_string, filename).
    """
    org = db.query(Organization).filter(Organization.id == org_id).first()
    org_slug = (org.name if org else "Org").replace(" ", "_")

    output = io.StringIO()
    output.write("\ufeff")
    writer = csv.writer(output)

    # 1. Purchases Section
    writer.writerow(["=== PURCHASES ==="])
    writer.writerow(["ID", "Date", "Invoice No", "Supplier", "Item ID", "Quantity", "Unit Cost", "Total Amount", "Status"])
    purchases = db.query(Purchase).filter(Purchase.org_id == org_id).order_by(desc(Purchase.purchase_date)).all()
    for p in purchases:
        writer.writerow([
            p.id, p.purchase_date.strftime("%Y-%m-%d"), p.invoice_no, p.supplier_name,
            p.item_id, f"{p.quantity:.2f}", f"{p.unit_cost:.2f}", f"{p.total_amount:.2f}", p.payment_status
        ])

    writer.writerow([])
    # 2. Donations Section
    writer.writerow(["=== DONATIONS ==="])
    writer.writerow(["ID", "Date", "Receipt No", "Donor Name", "Type", "Amount", "Item ID", "Quantity", "Declared Value", "Purpose"])
    donations = db.query(Donation).filter(Donation.org_id == org_id).order_by(desc(Donation.donation_date)).all()
    for d in donations:
        writer.writerow([
            d.id, d.donation_date.strftime("%Y-%m-%d"), d.receipt_no, d.donor_name, d.donation_type,
            f"{d.amount:.2f}", d.item_id or "", f"{d.quantity:.2f}" if d.quantity else "",
            f"{d.declared_value:.2f}", d.purpose or ""
        ])

    writer.writerow([])
    # 3. Expenses Section
    writer.writerow(["=== EXPENSES ==="])
    writer.writerow(["ID", "Date", "Receipt No", "Category", "Amount", "Description"])
    expenses = db.query(Expense).filter(Expense.org_id == org_id).order_by(desc(Expense.expense_date)).all()
    for e in expenses:
        writer.writerow([
            e.id, e.expense_date.strftime("%Y-%m-%d"), e.receipt_no or "", e.category,
            f"{e.amount:.2f}", e.description
        ])

    today_str = datetime.now(timezone.utc).strftime("%Y%m%d")
    filename = f"Finance_Report_{org_slug}_{today_str}.csv"
    return output.getvalue(), filename
