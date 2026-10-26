from app.database import SessionLocal, engine
from app.models import (
    ActivityLog, Expense, Donation, Purchase,
    StockMovement, InventoryItem, User, Organization
)
from app.seed import seed_database


def reset_demo():
    print("Resetting database demo state...")
    db = SessionLocal()
    try:
        # Delete dependent tables first
        db.query(ActivityLog).delete()
        db.query(Expense).delete()
        db.query(Donation).delete()
        db.query(Purchase).delete()
        db.query(StockMovement).delete()
        db.query(InventoryItem).delete()
        db.query(User).delete()
        db.query(Organization).delete()
        db.commit()
        print("All tables cleared successfully.")
    except Exception as e:
        db.rollback()
        print(f"Failed to clear tables: {e}")
        raise
    finally:
        db.close()

    print("Re-seeding initial demo data...")
    seed_database()
    print("Demo database reset complete!")


if __name__ == "__main__":
    reset_demo()
