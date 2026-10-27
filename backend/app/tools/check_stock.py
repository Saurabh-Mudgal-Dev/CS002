from decimal import Decimal
from app.database import SessionLocal
from app.models.inventory import InventoryItem
from app.models.movement import StockMovement
from sqlalchemy import func


def check_stock_drift():
    db = SessionLocal()
    try:
        items = db.query(InventoryItem).all()
        drift_count = 0
        print(f"Checking stock consistency across {len(items)} items...")

        for item in items:
            movement_sum = db.query(func.coalesce(func.sum(StockMovement.quantity_delta), 0)).filter(
                StockMovement.item_id == item.id
            ).scalar()

            calc_qty = Decimal(str(movement_sum))
            # Note: in seeds or adjustments, if all movements are recorded, drift should be 0
            if item.quantity_on_hand != calc_qty:
                drift_count += 1
                print(f"[DRIFT] Item #{item.id} '{item.name}' (SKU: {item.sku}): Recorded={item.quantity_on_hand}, MovementsSum={calc_qty}")

        if drift_count == 0:
            print("Stock reconciliation successful: ZERO drift detected across all inventory items.")
        else:
            print(f"Found {drift_count} items with discrepancies between movements and quantity_on_hand.")
    finally:
        db.close()


if __name__ == "__main__":
    check_stock_drift()
