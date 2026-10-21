from datetime import datetime, timedelta
from app.database import SessionLocal, engine, Base
from app.models import InventoryItem, User, ActivityLog

SAMPLE_ITEMS = [
    # --- NGO Relief Supplies ---
    {
        "name": "Paracetamol 500mg Tablets (Box of 100)",
        "sku": "MED-PARA-500",
        "category": "Medical Relief",
        "context_tag": "ngo",
        "quantity": 8,
        "reorder_level": 20,
        "unit_price": 12.50,
    },
    {
        "name": "Sterile Gauze & Bandage Rolls (Pack of 20)",
        "sku": "MED-GAUZ-020",
        "category": "Medical Relief",
        "context_tag": "ngo",
        "quantity": 14,
        "reorder_level": 25,
        "unit_price": 18.00,
    },
    {
        "name": "Water Purification Chlorine Tablets (1000 Tabs)",
        "sku": "SAN-WTR-1000",
        "category": "Sanitation & Water",
        "context_tag": "ngo",
        "quantity": 42,
        "reorder_level": 15,
        "unit_price": 32.00,
    },
    {
        "name": "Emergency Thermal Foil Blankets (Pack of 10)",
        "sku": "LOG-BLNK-010",
        "category": "Disaster Logistics",
        "context_tag": "ngo",
        "quantity": 6,
        "reorder_level": 15,
        "unit_price": 24.00,
    },
    {
        "name": "Oral Rehydration Salts (ORS) Sachets (Pack of 50)",
        "sku": "MED-ORS-050",
        "category": "Medical Relief",
        "context_tag": "ngo",
        "quantity": 75,
        "reorder_level": 30,
        "unit_price": 9.50,
    },
    {
        "name": "Fortified Wheat Flour 25kg Sack",
        "sku": "FOD-WHT-025",
        "category": "Emergency Rations",
        "context_tag": "ngo",
        "quantity": 38,
        "reorder_level": 20,
        "unit_price": 28.00,
    },
    {
        "name": "Fortified Long Grain Rice 25kg Sack",
        "sku": "FOD-RCE-025",
        "category": "Emergency Rations",
        "context_tag": "ngo",
        "quantity": 45,
        "reorder_level": 20,
        "unit_price": 31.50,
    },
    {
        "name": "High-Energy Protein Nutri-Biscuits (Carton of 48)",
        "sku": "FOD-ENB-048",
        "category": "Emergency Rations",
        "context_tag": "ngo",
        "quantity": 12,
        "reorder_level": 15,
        "unit_price": 44.00,
    },
    {
        "name": "Heavy-Duty Tarpaulin Ground Sheets (12x15ft)",
        "sku": "LOG-TARP-012",
        "category": "Disaster Logistics",
        "context_tag": "ngo",
        "quantity": 4,
        "reorder_level": 10,
        "unit_price": 35.00,
    },
    {
        "name": "Antiseptic Disinfectant Solution 1L",
        "sku": "SAN-ANTI-001",
        "category": "Sanitation & Water",
        "context_tag": "ngo",
        "quantity": 28,
        "reorder_level": 12,
        "unit_price": 14.50,
    },
    {
        "name": "Solar Rechargeable Relief Lanterns 5W",
        "sku": "LOG-SOLR-005",
        "category": "Disaster Logistics",
        "context_tag": "ngo",
        "quantity": 19,
        "reorder_level": 10,
        "unit_price": 22.00,
    },
    {
        "name": "Infant Nutritional Milk Formula 500g",
        "sku": "FOD-INF-500",
        "category": "Emergency Rations",
        "context_tag": "ngo",
        "quantity": 0,
        "reorder_level": 15,
        "unit_price": 16.00,
    },

    # --- Small Shopkeeper / Retail Goods ---
    {
        "name": "Refined Sunflower Cooking Oil 1L Pouch",
        "sku": "RTL-OIL-001",
        "category": "Grocery & Staples",
        "context_tag": "retail",
        "quantity": 55,
        "reorder_level": 20,
        "unit_price": 3.80,
    },
    {
        "name": "Premium Traditional Basmati Rice 5kg Bag",
        "sku": "RTL-RCE-005",
        "category": "Grocery & Staples",
        "context_tag": "retail",
        "quantity": 9,
        "reorder_level": 15,
        "unit_price": 11.50,
    },
    {
        "name": "Instant Hand Sanitizer 500ml Pump Bottle",
        "sku": "RTL-SNT-500",
        "category": "Daily Essentials",
        "context_tag": "retail",
        "quantity": 34,
        "reorder_level": 15,
        "unit_price": 4.50,
    },
    {
        "name": "Warm White LED Bulb 9W (Pack of 4)",
        "sku": "RTL-LEDB-009",
        "category": "Hardware & Electric",
        "context_tag": "retail",
        "quantity": 18,
        "reorder_level": 10,
        "unit_price": 8.00,
    },
    {
        "name": "Hardcover Student Notebooks (Bundle of 6)",
        "sku": "RTL-NOTE-006",
        "category": "Stationery",
        "context_tag": "retail",
        "quantity": 40,
        "reorder_level": 15,
        "unit_price": 7.20,
    },
    {
        "name": "Surface Disinfectant Floral Floor Cleaner 1L",
        "sku": "RTL-BLCH-001",
        "category": "Daily Essentials",
        "context_tag": "retail",
        "quantity": 22,
        "reorder_level": 10,
        "unit_price": 3.90,
    },
    {
        "name": "Pure White Refined Cane Sugar 2kg Bag",
        "sku": "RTL-SUG-002",
        "category": "Grocery & Staples",
        "context_tag": "retail",
        "quantity": 30,
        "reorder_level": 12,
        "unit_price": 2.60,
    },
    {
        "name": "Iodized Pure Table Salt 1kg Pouch",
        "sku": "RTL-SALT-001",
        "category": "Grocery & Staples",
        "context_tag": "retail",
        "quantity": 60,
        "reorder_level": 25,
        "unit_price": 0.80,
    },
    {
        "name": "Chakki Fresh Whole Wheat Flour 10kg Bag",
        "sku": "RTL-ATTA-010",
        "category": "Grocery & Staples",
        "context_tag": "retail",
        "quantity": 7,
        "reorder_level": 12,
        "unit_price": 9.20,
    },
    {
        "name": "Aromatic Assam Black Tea Leaves 500g",
        "sku": "RTL-TEA-500",
        "category": "Grocery & Staples",
        "context_tag": "retail",
        "quantity": 26,
        "reorder_level": 10,
        "unit_price": 5.40,
    },
    {
        "name": "Antibacterial Bathing Soap Bar (Pack of 4)",
        "sku": "RTL-SOAP-004",
        "category": "Daily Essentials",
        "context_tag": "retail",
        "quantity": 45,
        "reorder_level": 18,
        "unit_price": 3.20,
    },
    {
        "name": "Heavy-Duty AA Alkaline Batteries (Pack of 10)",
        "sku": "RTL-BATT-010",
        "category": "Hardware & Electric",
        "context_tag": "retail",
        "quantity": 5,
        "reorder_level": 10,
        "unit_price": 6.50,
    },
    {
        "name": "Multi-Purpose Adhesive Tape Rolls 2-Inch (Pack of 3)",
        "sku": "RTL-TAPE-003",
        "category": "Hardware & Electric",
        "context_tag": "retail",
        "quantity": 25,
        "reorder_level": 10,
        "unit_price": 4.10,
    }
]

SAMPLE_USERS = [
    {"name": "Saurabh Sharma", "email": "admin@resourceone.org", "role": "Admin"},
    {"name": "Priya Verma", "email": "manager@resourceone.org", "role": "Manager"},
    {"name": "Rohan Patel", "email": "volunteer@resourceone.org", "role": "Volunteer"}
]

SAMPLE_LOGS = [
    {
        "action_type": "RESTOCK",
        "item_name": "Paracetamol 500mg Tablets (Box of 100)",
        "quantity_change": 50,
        "note": "State Health Department Relief Grant donation",
        "performed_by": "Manager",
        "hours_ago": 140
    },
    {
        "action_type": "SALE",
        "item_name": "Refined Sunflower Cooking Oil 1L Pouch",
        "quantity_change": -12,
        "note": "Wholesale grocery order invoice #1021",
        "performed_by": "Manager",
        "hours_ago": 118
    },
    {
        "action_type": "RELIEF_DISTRIBUTION",
        "item_name": "Fortified Wheat Flour 25kg Sack",
        "quantity_change": -15,
        "note": "Community flood relief center distribution",
        "performed_by": "Volunteer",
        "hours_ago": 96
    },
    {
        "action_type": "RESTOCK",
        "item_name": "Premium Traditional Basmati Rice 5kg Bag",
        "quantity_change": 40,
        "note": "Vendor delivery shipment #RTL-402",
        "performed_by": "Manager",
        "hours_ago": 74
    },
    {
        "action_type": "RELIEF_DISTRIBUTION",
        "item_name": "Emergency Thermal Foil Blankets (Pack of 10)",
        "quantity_change": -8,
        "note": "Dispatched to Sector 4 Night Shelter Relief",
        "performed_by": "Volunteer",
        "hours_ago": 52
    },
    {
        "action_type": "RESTOCK",
        "item_name": "Water Purification Chlorine Tablets (1000 Tabs)",
        "quantity_change": 30,
        "note": "UNICEF water sanitation partner replenishment",
        "performed_by": "Manager",
        "hours_ago": 38
    },
    {
        "action_type": "SALE",
        "item_name": "Warm White LED Bulb 9W (Pack of 4)",
        "quantity_change": -6,
        "note": "Retail counter sales batch",
        "performed_by": "Manager",
        "hours_ago": 26
    },
    {
        "action_type": "RELIEF_DISTRIBUTION",
        "item_name": "Oral Rehydration Salts (ORS) Sachets (Pack of 50)",
        "quantity_change": -20,
        "note": "Mobile clinic community deployment",
        "performed_by": "Volunteer",
        "hours_ago": 18
    },
    {
        "action_type": "SALE",
        "item_name": "Refined Sunflower Cooking Oil 1L Pouch",
        "quantity_change": -5,
        "note": "Walk-in Retail Customer Order #1042",
        "performed_by": "Manager",
        "hours_ago": 8
    },
    {
        "action_type": "RELIEF_DISTRIBUTION",
        "item_name": "Paracetamol 500mg Tablets (Box of 100)",
        "quantity_change": -14,
        "note": "Distributed at Rural Community Health Camp",
        "performed_by": "Volunteer",
        "hours_ago": 3
    }
]


def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if already seeded
        existing_count = db.query(InventoryItem).count()
        if existing_count > 0:
            print(f"Database already contains {existing_count} items. Skipping seeding.")
            return existing_count

        # Seed Users
        for u in SAMPLE_USERS:
            existing_user = db.query(User).filter(User.email == u["email"]).first()
            if not existing_user:
                user = User(name=u["name"], email=u["email"], role=u["role"])
                db.add(user)

        # Seed Inventory Items
        for item_data in SAMPLE_ITEMS:
            item = InventoryItem(**item_data)
            item.status = item.calculate_status()
            db.add(item)

        # Seed initial Activity Logs
        now = datetime.utcnow()
        for log_data in SAMPLE_LOGS:
            log = ActivityLog(
                action_type=log_data["action_type"],
                item_name=log_data["item_name"],
                quantity_change=log_data["quantity_change"],
                note=log_data["note"],
                performed_by=log_data["performed_by"],
                timestamp=now - timedelta(hours=log_data["hours_ago"])
            )
            db.add(log)

        db.commit()
        total = db.query(InventoryItem).count()
        print(f"Successfully seeded database with {total} items and {len(SAMPLE_USERS)} users.")
        return total
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
