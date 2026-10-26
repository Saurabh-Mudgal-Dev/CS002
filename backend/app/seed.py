from datetime import datetime, date, timedelta, timezone
from decimal import Decimal
from sqlalchemy.orm import Session
from app.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models import (
    Organization, User, InventoryItem, StockMovement,
    Purchase, Donation, Expense, ActivityLog
)


def seed_database(db: Session = None):
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True

    try:
        # Check if already seeded (idempotency)
        existing_org = db.query(Organization).first()
        if existing_org:
            print("Database already contains data. Seed skipped (idempotent).")
            return

        print("Seeding organizations and demo users...")
        now = datetime.now(timezone.utc)
        today = date.today()
        demo_password_hash = get_password_hash("Demo@12345")

        # 1. Organizations
        org_asha = Organization(
            name="Asha Relief Foundation",
            org_type="ngo",
            currency="INR",
            created_at=now - timedelta(days=90),
        )
        org_sunrise = Organization(
            name="Sunrise Kirana Store",
            org_type="retail",
            currency="INR",
            created_at=now - timedelta(days=90),
        )
        db.add_all([org_asha, org_sunrise])
        db.flush()

        # 2. Users (5 demo users)
        users = [
            User(
                org_id=org_asha.id,
                full_name="Asha Administrator",
                email="admin@asha.org",
                password_hash=demo_password_hash,
                role="admin",
                is_active=True,
                created_at=now - timedelta(days=85),
            ),
            User(
                org_id=org_asha.id,
                full_name="Asha Inventory Manager",
                email="manager@asha.org",
                password_hash=demo_password_hash,
                role="manager",
                is_active=True,
                created_at=now - timedelta(days=85),
            ),
            User(
                org_id=org_asha.id,
                full_name="Asha Accountant",
                email="accounts@asha.org",
                password_hash=demo_password_hash,
                role="accountant",
                is_active=True,
                created_at=now - timedelta(days=85),
            ),
            User(
                org_id=org_asha.id,
                full_name="Asha Field Volunteer",
                email="volunteer@asha.org",
                password_hash=demo_password_hash,
                role="volunteer",
                is_active=True,
                created_at=now - timedelta(days=85),
            ),
            User(
                org_id=org_sunrise.id,
                full_name="Sunrise Store Owner",
                email="owner@sunrise.store",
                password_hash=demo_password_hash,
                role="admin",
                is_active=True,
                created_at=now - timedelta(days=85),
            ),
        ]
        db.add_all(users)
        db.flush()

        admin_asha = users[0]
        manager_asha = users[1]
        accounts_asha = users[2]
        volunteer_asha = users[3]
        owner_sunrise = users[4]

        # 3. Inventory Items (~20 for Asha NGO, ~20 for Sunrise Retail)
        # We define target opening inventory, purchases, and outflows so movements reconcile exactly!
        asha_items_data = [
            # Medical Relief
            {"name": "Paracetamol 500mg (100 Tabs)", "sku": "MED-PARA-500", "cat": "Medical Relief", "unit": "Box", "qty": Decimal("8.00"), "reorder": 20, "cost": Decimal("120.00"), "price": Decimal("0.00"), "exp": today + timedelta(days=180)},
            {"name": "Sterile Gauze Bandage (Pack of 20)", "sku": "MED-GAUZ-020", "cat": "Medical Relief", "unit": "Pack", "qty": Decimal("14.00"), "reorder": 25, "cost": Decimal("180.00"), "price": Decimal("0.00"), "exp": today + timedelta(days=360)},
            {"name": "ORS Electrolyte Sachets (Box of 50)", "sku": "MED-ORS-050", "cat": "Medical Relief", "unit": "Box", "qty": Decimal("75.00"), "reorder": 30, "cost": Decimal("250.00"), "price": Decimal("0.00"), "exp": today + timedelta(days=20)}, # expiring soon
            {"name": "Povidone Iodine Antiseptic 500ml", "sku": "MED-IOD-500", "cat": "Medical Relief", "unit": "Bottle", "qty": Decimal("3.00"), "reorder": 15, "cost": Decimal("140.00"), "price": Decimal("0.00"), "exp": today + timedelta(days=200)}, # low
            {"name": "First Aid Medical Triage Kit", "sku": "MED-KIT-001", "cat": "Medical Relief", "unit": "Kit", "qty": Decimal("0.00"), "reorder": 10, "cost": Decimal("950.00"), "price": Decimal("0.00"), "exp": today + timedelta(days=400)}, # out of stock
            # Sanitation & Water
            {"name": "Water Purification Chlorine Tablets (1000s)", "sku": "SAN-WTR-1000", "cat": "Sanitation & Water", "unit": "Box", "qty": Decimal("42.00"), "reorder": 15, "cost": Decimal("450.00"), "price": Decimal("0.00"), "exp": today + timedelta(days=500)},
            {"name": "Carbolic Disinfectant Soap (Pack of 12)", "sku": "SAN-SOAP-012", "cat": "Sanitation & Water", "unit": "Pack", "qty": Decimal("6.00"), "reorder": 20, "cost": Decimal("180.00"), "price": Decimal("0.00"), "exp": today + timedelta(days=300)}, # low
            {"name": "Biodegradable Sanitary Pads (Pack of 30)", "sku": "SAN-PADS-030", "cat": "Sanitation & Water", "unit": "Pack", "qty": Decimal("85.00"), "reorder": 30, "cost": Decimal("120.00"), "price": Decimal("0.00"), "exp": today + timedelta(days=600)},
            {"name": "Surface Disinfectant Concentrate 5L", "sku": "SAN-DIS-005", "cat": "Sanitation & Water", "unit": "Can", "qty": Decimal("18.00"), "reorder": 10, "cost": Decimal("650.00"), "price": Decimal("0.00"), "exp": today - timedelta(days=5)}, # expired
            # Disaster Logistics & Shelter
            {"name": "Emergency Thermal Foil Blankets (Pack of 10)", "sku": "LOG-BLNK-010", "cat": "Disaster Logistics", "unit": "Pack", "qty": Decimal("6.00"), "reorder": 15, "cost": Decimal("450.00"), "price": Decimal("0.00"), "exp": None}, # low
            {"name": "Heavy-Duty Tarpaulin (12x15 ft)", "sku": "LOG-TARP-012", "cat": "Disaster Logistics", "unit": "Sheet", "qty": Decimal("0.00"), "reorder": 10, "cost": Decimal("680.00"), "price": Decimal("0.00"), "exp": None}, # out of stock
            {"name": "Solar Rechargeable Relief Lantern 5W", "sku": "LOG-SOLR-005", "cat": "Disaster Logistics", "unit": "Piece", "qty": Decimal("22.00"), "reorder": 10, "cost": Decimal("520.00"), "price": Decimal("0.00"), "exp": None},
            {"name": "High-Decibel Emergency Whistles (Box of 50)", "sku": "LOG-WHS-050", "cat": "Disaster Logistics", "unit": "Box", "qty": Decimal("15.00"), "reorder": 8, "cost": Decimal("350.00"), "price": Decimal("0.00"), "exp": None},
            {"name": "Foldable Rescue Stretcher", "sku": "LOG-STR-001", "cat": "Disaster Logistics", "unit": "Piece", "qty": Decimal("4.00"), "reorder": 5, "cost": Decimal("2200.00"), "price": Decimal("0.00"), "exp": None}, # low
            # Emergency Rations
            {"name": "Fortified Wheat Flour 25kg Sack", "sku": "FOD-WHT-025", "cat": "Emergency Rations", "unit": "Sack", "qty": Decimal("38.00"), "reorder": 20, "cost": Decimal("850.00"), "price": Decimal("0.00"), "exp": today + timedelta(days=90)},
            {"name": "Fortified Long Grain Rice 25kg Sack", "sku": "FOD-RCE-025", "cat": "Emergency Rations", "unit": "Sack", "qty": Decimal("45.00"), "reorder": 20, "cost": Decimal("1100.00"), "price": Decimal("0.00"), "exp": today + timedelta(days=120)},
            {"name": "High-Energy Protein Nutri-Biscuits (Carton of 48)", "sku": "FOD-ENB-048", "cat": "Emergency Rations", "unit": "Carton", "qty": Decimal("12.00"), "reorder": 15, "cost": Decimal("720.00"), "price": Decimal("0.00"), "exp": today + timedelta(days=15)}, # expiring soon
            {"name": "Iodized Salt 1kg Pack (Carton of 25)", "sku": "FOD-SLT-025", "cat": "Emergency Rations", "unit": "Carton", "qty": Decimal("50.00"), "reorder": 15, "cost": Decimal("450.00"), "price": Decimal("0.00"), "exp": today + timedelta(days=400)},
            {"name": "Refined Mustard Cooking Oil 5L Jar", "sku": "FOD-OIL-005", "cat": "Emergency Rations", "unit": "Jar", "qty": Decimal("30.00"), "reorder": 15, "cost": Decimal("680.00"), "price": Decimal("0.00"), "exp": today + timedelta(days=240)},
            {"name": "Split Red Lentils (Masoor Dal) 30kg Sack", "sku": "FOD-DAL-030", "cat": "Emergency Rations", "unit": "Sack", "qty": Decimal("24.00"), "reorder": 12, "cost": Decimal("2400.00"), "price": Decimal("0.00"), "exp": today + timedelta(days=180)},
        ]

        sunrise_items_data = [
            # Grains & Pulses
            {"name": "Aashirvaad Shudh Chakki Atta 10kg", "sku": "RET-ATTA-010", "cat": "Grains & Pulses", "unit": "Bag", "qty": Decimal("28.00"), "reorder": 10, "cost": Decimal("380.00"), "price": Decimal("440.00"), "exp": today + timedelta(days=120)},
            {"name": "India Gate Basmati Rice Feast 5kg", "sku": "RET-RCE-005", "cat": "Grains & Pulses", "unit": "Bag", "qty": Decimal("18.00"), "reorder": 8, "cost": Decimal("420.00"), "price": Decimal("520.00"), "exp": today + timedelta(days=300)},
            {"name": "Tata Sampann Toor Dal 1kg", "sku": "RET-TOOR-001", "cat": "Grains & Pulses", "unit": "Pkt", "qty": Decimal("5.00"), "reorder": 15, "cost": Decimal("145.00"), "price": Decimal("175.00"), "exp": today + timedelta(days=180)}, # low
            {"name": "Rajdhani Chana Dal 1kg", "sku": "RET-CHNA-001", "cat": "Grains & Pulses", "unit": "Pkt", "qty": Decimal("35.00"), "reorder": 12, "cost": Decimal("85.00"), "price": Decimal("105.00"), "exp": today + timedelta(days=210)},
            {"name": "Fortune Besan Gram Flour 1kg", "sku": "RET-BSN-001", "cat": "Grains & Pulses", "unit": "Pkt", "qty": Decimal("0.00"), "reorder": 10, "cost": Decimal("82.00"), "price": Decimal("98.00"), "exp": today + timedelta(days=150)}, # out of stock
            # Cooking Oils & Ghee
            {"name": "Fortune Sunlite Refined Sunflower Oil 1L", "sku": "RET-SFO-001", "cat": "Cooking Oils & Ghee", "unit": "Pouch", "qty": Decimal("40.00"), "reorder": 15, "cost": Decimal("118.00"), "price": Decimal("138.00"), "exp": today + timedelta(days=240)},
            {"name": "Dhara Kachi Ghani Mustard Oil 1L Bottle", "sku": "RET-MST-001", "cat": "Cooking Oils & Ghee", "unit": "Bottle", "qty": Decimal("22.00"), "reorder": 10, "cost": Decimal("142.00"), "price": Decimal("165.00"), "exp": today + timedelta(days=180)},
            {"name": "Amul Pure Ghee 1L Tin", "sku": "RET-GHE-001", "cat": "Cooking Oils & Ghee", "unit": "Tin", "qty": Decimal("4.00"), "reorder": 8, "cost": Decimal("560.00"), "price": Decimal("640.00"), "exp": today + timedelta(days=25)}, # low & expiring soon
            # Spices & Seasonings
            {"name": "Tata Salt Vacuum Evaporated 1kg", "sku": "RET-SLT-001", "cat": "Spices & Seasonings", "unit": "Pkt", "qty": Decimal("65.00"), "reorder": 20, "cost": Decimal("22.00"), "price": Decimal("28.00"), "exp": today + timedelta(days=700)},
            {"name": "MDH Deggi Mirch Powder 100g", "sku": "RET-MRCH-100", "cat": "Spices & Seasonings", "unit": "Box", "qty": Decimal("28.00"), "reorder": 10, "cost": Decimal("72.00"), "price": Decimal("88.00"), "exp": today + timedelta(days=360)},
            {"name": "Catch Turmeric Powder 200g", "sku": "RET-HALD-200", "cat": "Spices & Seasonings", "unit": "Pkt", "qty": Decimal("30.00"), "reorder": 10, "cost": Decimal("48.00"), "price": Decimal("60.00"), "exp": today + timedelta(days=300)},
            {"name": "Catch Coriander Powder 200g", "sku": "RET-DHAN-200", "cat": "Spices & Seasonings", "unit": "Pkt", "qty": Decimal("7.00"), "reorder": 12, "cost": Decimal("52.00"), "price": Decimal("65.00"), "exp": today + timedelta(days=10)}, # low & expiring soon
            # Snacks & Beverages
            {"name": "Tata Tea Gold 500g Pack", "sku": "RET-TEA-500", "cat": "Snacks & Beverages", "unit": "Pkt", "qty": Decimal("24.00"), "reorder": 10, "cost": Decimal("260.00"), "price": Decimal("310.00"), "exp": today + timedelta(days=365)},
            {"name": "Nescafe Classic Coffee Jar 100g", "sku": "RET-COF-100", "cat": "Snacks & Beverages", "unit": "Jar", "qty": Decimal("14.00"), "reorder": 8, "cost": Decimal("290.00"), "price": Decimal("345.00"), "exp": today + timedelta(days=400)},
            {"name": "Parle-G Gold Biscuits (Pack of 12)", "sku": "RET-PRLG-012", "cat": "Snacks & Beverages", "unit": "Pack", "qty": Decimal("48.00"), "reorder": 15, "cost": Decimal("110.00"), "price": Decimal("132.00"), "exp": today + timedelta(days=90)},
            {"name": "Haldiram Bhujia Sev 400g Pouch", "sku": "RET-BHUJ-400", "cat": "Snacks & Beverages", "unit": "Pouch", "qty": Decimal("0.00"), "reorder": 10, "cost": Decimal("95.00"), "price": Decimal("115.00"), "exp": today - timedelta(days=10)}, # out of stock & expired
            {"name": "Madhur Pure & Hygienic Sugar 5kg", "sku": "RET-SUG-005", "cat": "Snacks & Beverages", "unit": "Bag", "qty": Decimal("16.00"), "reorder": 8, "cost": Decimal("215.00"), "price": Decimal("255.00"), "exp": today + timedelta(days=500)},
            # Personal & Home Care
            {"name": "Dettol Antiseptic Liquid 550ml", "sku": "RET-DET-550", "cat": "Personal & Home Care", "unit": "Bottle", "qty": Decimal("18.00"), "reorder": 6, "cost": Decimal("175.00"), "price": Decimal("210.00"), "exp": today + timedelta(days=700)},
            {"name": "Surf Excel Quick Wash Detergent 2kg", "sku": "RET-SURF-002", "cat": "Personal & Home Care", "unit": "Pack", "qty": Decimal("20.00"), "reorder": 8, "cost": Decimal("295.00"), "price": Decimal("350.00"), "exp": None},
            {"name": "Colgate Strong Teeth Toothpaste 200g (Pack of 2)", "sku": "RET-COLG-200", "cat": "Personal & Home Care", "unit": "Pack", "qty": Decimal("5.00"), "reorder": 12, "cost": Decimal("160.00"), "price": Decimal("195.00"), "exp": today + timedelta(days=450)}, # low
        ]

        asha_items = []
        for it in asha_items_data:
            item = InventoryItem(
                org_id=org_asha.id,
                name=it["name"],
                sku=it["sku"],
                category=it["cat"],
                unit=it["unit"],
                quantity_on_hand=it["qty"],
                reorder_level=it["reorder"],
                unit_cost=it["cost"],
                unit_price=it["price"],
                expiry_date=it["exp"],
                is_archived=False,
                created_at=now - timedelta(days=60),
                updated_at=now - timedelta(days=1),
            )
            asha_items.append(item)
            db.add(item)

        sunrise_items = []
        for it in sunrise_items_data:
            item = InventoryItem(
                org_id=org_sunrise.id,
                name=it["name"],
                sku=it["sku"],
                category=it["cat"],
                unit=it["unit"],
                quantity_on_hand=it["qty"],
                reorder_level=it["reorder"],
                unit_cost=it["cost"],
                unit_price=it["price"],
                expiry_date=it["exp"],
                is_archived=False,
                created_at=now - timedelta(days=60),
                updated_at=now - timedelta(days=1),
            )
            sunrise_items.append(item)
            db.add(item)

        db.flush()

        print("Seeding stock movements reconciling with quantity_on_hand...")
        # To strictly reconcile stock:
        # Each item has an initial RESTOCK movement for qty + some extra, followed by a relief/sale movement
        # delta = total movements = item.quantity_on_hand
        for item in asha_items:
            final_qty = item.quantity_on_hand
            # Simulate initial intake (final_qty + 10) and relief distribution (10)
            intake_qty = final_qty + Decimal("10.00")
            outflow_qty = Decimal("10.00")

            m1 = StockMovement(
                org_id=org_asha.id,
                item_id=item.id,
                movement_type="RESTOCK",
                quantity_delta=intake_qty,
                unit_value=item.unit_cost,
                total_value=intake_qty * item.unit_cost,
                reference_type="purchase",
                note="Initial batch intake from humanitarian supplier",
                actor_user_id=manager_asha.id,
                created_at=now - timedelta(days=45),
            )
            m2 = StockMovement(
                org_id=org_asha.id,
                item_id=item.id,
                movement_type="RELIEF",
                quantity_delta=-outflow_qty,
                unit_value=item.unit_cost,
                total_value=Decimal("0.00"),  # Relief revenue is 0
                reference_type="manual",
                note="Dispatched to district emergency relief camp",
                actor_user_id=volunteer_asha.id,
                created_at=now - timedelta(days=15),
            )
            db.add_all([m1, m2])

        for item in sunrise_items:
            final_qty = item.quantity_on_hand
            intake_qty = final_qty + Decimal("15.00")
            outflow_qty = Decimal("15.00")

            m1 = StockMovement(
                org_id=org_sunrise.id,
                item_id=item.id,
                movement_type="RESTOCK",
                quantity_delta=intake_qty,
                unit_value=item.unit_cost,
                total_value=intake_qty * item.unit_cost,
                reference_type="purchase",
                note="Stock procurement from wholesale mandi distributor",
                actor_user_id=owner_sunrise.id,
                created_at=now - timedelta(days=50),
            )
            m2 = StockMovement(
                org_id=org_sunrise.id,
                item_id=item.id,
                movement_type="SALE",
                quantity_delta=-outflow_qty,
                unit_value=item.unit_price,
                total_value=outflow_qty * item.unit_price,
                reference_type="manual",
                note="Walk-in retail customer sales ledger",
                actor_user_id=owner_sunrise.id,
                created_at=now - timedelta(days=10),
            )
            db.add_all([m1, m2])

        db.flush()

        print("Seeding purchases, donations, and expenses...")
        # 4. Purchases (Asha & Sunrise)
        purchases = [
            Purchase(
                org_id=org_asha.id,
                item_id=asha_items[0].id,
                invoice_no="INV-ASHA-2026-001",
                supplier_name="National Pharma Relief Depot",
                quantity=Decimal("18.00"),
                unit_cost=asha_items[0].unit_cost,
                total_amount=Decimal("18.00") * asha_items[0].unit_cost,
                payment_status="paid",
                purchase_date=today - timedelta(days=45),
                created_by=manager_asha.id,
                created_at=now - timedelta(days=45),
            ),
            Purchase(
                org_id=org_asha.id,
                item_id=asha_items[14].id,
                invoice_no="INV-ASHA-2026-002",
                supplier_name="Kisan Food Agro Cooperative",
                quantity=Decimal("48.00"),
                unit_cost=asha_items[14].unit_cost,
                total_amount=Decimal("48.00") * asha_items[14].unit_cost,
                payment_status="paid",
                purchase_date=today - timedelta(days=35),
                created_by=manager_asha.id,
                created_at=now - timedelta(days=35),
            ),
            Purchase(
                org_id=org_sunrise.id,
                item_id=sunrise_items[0].id,
                invoice_no="INV-SUN-2026-001",
                supplier_name="ITC Wholesale Distribution Hub",
                quantity=Decimal("43.00"),
                unit_cost=sunrise_items[0].unit_cost,
                total_amount=Decimal("43.00") * sunrise_items[0].unit_cost,
                payment_status="paid",
                purchase_date=today - timedelta(days=50),
                created_by=owner_sunrise.id,
                created_at=now - timedelta(days=50),
            ),
            Purchase(
                org_id=org_sunrise.id,
                item_id=sunrise_items[5].id,
                invoice_no="INV-SUN-2026-002",
                supplier_name="Adani Wilmar Regional Depot",
                quantity=Decimal("55.00"),
                unit_cost=sunrise_items[5].unit_cost,
                total_amount=Decimal("55.00") * sunrise_items[5].unit_cost,
                payment_status="unpaid",
                purchase_date=today - timedelta(days=5),
                created_by=owner_sunrise.id,
                created_at=now - timedelta(days=5),
            ),
        ]
        db.add_all(purchases)

        # 5. Donations (Asha NGO)
        donations = [
            Donation(
                org_id=org_asha.id,
                donor_name="Azim Premji Philanthropic Initiatives",
                donation_type="cash",
                amount=Decimal("250000.00"),
                item_id=None,
                quantity=None,
                declared_value=Decimal("250000.00"),
                purpose="Monsoon flood disaster emergency medical fund",
                receipt_no="DON-ASHA-2026-001",
                donation_date=today - timedelta(days=55),
                recorded_by=accounts_asha.id,
                created_at=now - timedelta(days=55),
            ),
            Donation(
                org_id=org_asha.id,
                donor_name="Rotary Club Gurugram North",
                donation_type="goods",
                amount=Decimal("0.00"),
                item_id=asha_items[5].id, # Water purification tabs
                quantity=Decimal("20.00"),
                declared_value=Decimal("9000.00"),
                purpose="Clean drinking water supply for flood shelter",
                receipt_no="DON-ASHA-2026-002",
                donation_date=today - timedelta(days=25),
                recorded_by=volunteer_asha.id,
                created_at=now - timedelta(days=25),
            ),
            Donation(
                org_id=org_asha.id,
                donor_name="HDFC Parivartan CSR",
                donation_type="cash",
                amount=Decimal("150000.00"),
                item_id=None,
                quantity=None,
                declared_value=Decimal("150000.00"),
                purpose="Nutritional rations relief for rural migrant workers",
                receipt_no="DON-ASHA-2026-003",
                donation_date=today - timedelta(days=12),
                recorded_by=accounts_asha.id,
                created_at=now - timedelta(days=12),
            ),
        ]
        db.add_all(donations)

        # 6. Expenses (Asha & Sunrise)
        expenses = [
            Expense(
                org_id=org_asha.id,
                category="transport",
                amount=Decimal("14500.00"),
                description="Relief supply diesel truck transport to Nuh district",
                expense_date=today - timedelta(days=40),
                receipt_no="EXP-ASHA-001",
                recorded_by=accounts_asha.id,
                created_at=now - timedelta(days=40),
            ),
            Expense(
                org_id=org_asha.id,
                category="rent",
                amount=Decimal("35000.00"),
                description="Warehouse storage hub monthly lease rental",
                expense_date=today - timedelta(days=30),
                receipt_no="EXP-ASHA-002",
                recorded_by=accounts_asha.id,
                created_at=now - timedelta(days=30),
            ),
            Expense(
                org_id=org_asha.id,
                category="supplies",
                amount=Decimal("4200.00"),
                description="Corrugated packing cartons and sealing tapes",
                expense_date=today - timedelta(days=18),
                receipt_no="EXP-ASHA-003",
                recorded_by=accounts_asha.id,
                created_at=now - timedelta(days=18),
            ),
            Expense(
                org_id=org_sunrise.id,
                category="rent",
                amount=Decimal("22000.00"),
                description="Commercial shop space rent for October",
                expense_date=today - timedelta(days=25),
                receipt_no="EXP-SUN-001",
                recorded_by=owner_sunrise.id,
                created_at=now - timedelta(days=25),
            ),
            Expense(
                org_id=org_sunrise.id,
                category="utilities",
                amount=Decimal("6850.00"),
                description="DHBVN commercial electricity power bill",
                expense_date=today - timedelta(days=14),
                receipt_no="EXP-SUN-002",
                recorded_by=owner_sunrise.id,
                created_at=now - timedelta(days=14),
            ),
        ]
        db.add_all(expenses)

        # 7. Activity Logs
        logs = [
            ActivityLog(
                org_id=org_asha.id,
                actor_user_id=admin_asha.id,
                action="login",
                entity_type="auth",
                entity_id=admin_asha.id,
                summary="Admin user authenticated securely",
                ip_address="127.0.0.1",
                created_at=now - timedelta(days=60),
            ),
            ActivityLog(
                org_id=org_asha.id,
                actor_user_id=manager_asha.id,
                action="create",
                entity_type="inventory_item",
                entity_id=asha_items[0].id,
                summary=f"Created medical inventory catalog item: {asha_items[0].name}",
                ip_address="127.0.0.1",
                created_at=now - timedelta(days=45),
            ),
            ActivityLog(
                org_id=org_asha.id,
                actor_user_id=manager_asha.id,
                action="movement",
                entity_type="stock_movement",
                entity_id=1,
                summary=f"Restocked 18 units of {asha_items[0].name} via purchase invoice INV-ASHA-2026-001",
                ip_address="127.0.0.1",
                created_at=now - timedelta(days=45),
            ),
            ActivityLog(
                org_id=org_asha.id,
                actor_user_id=volunteer_asha.id,
                action="movement",
                entity_type="stock_movement",
                entity_id=2,
                summary=f"Dispatched 10 units of {asha_items[0].name} to flood relief triage unit",
                ip_address="127.0.0.1",
                created_at=now - timedelta(days=15),
            ),
            ActivityLog(
                org_id=org_sunrise.id,
                actor_user_id=owner_sunrise.id,
                action="movement",
                entity_type="stock_movement",
                entity_id=3,
                summary=f"Procured 43 units of {sunrise_items[0].name} from wholesale mandi distributor",
                ip_address="127.0.0.1",
                created_at=now - timedelta(days=50),
            ),
        ]
        db.add_all(logs)

        db.commit()
        print("Database successfully seeded with realistic multi-tenant demo data!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        if close_db:
            db.close()


if __name__ == "__main__":
    seed_database()
