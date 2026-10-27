import io
from datetime import datetime, timezone
from decimal import Decimal
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from sqlalchemy.orm import Session

from app.models.organization import Organization
from app.models.inventory import InventoryItem
from app.models.audit import ActivityLog
from app.services.finance import get_finance_summary


def generate_combined_pdf(db: Session, org_id: int, include_finance: bool = True) -> bytes:
    """
    Generates a combined operations and inventory PDF report using ReportLab.
    Includes:
      - Organization header and metadata
      - Inventory Valuation & Stock Summary
      - Low-stock and Critical Items Table
      - Financial Position & Summary (if allowed by role)
      - Audit trail activity metrics & footer with methodology
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    org = db.query(Organization).filter(Organization.id == org_id).first()
    org_name = org.name if org else "ResourceOne Platform"
    org_type = (org.org_type.upper() if org and org.org_type else "ORGANIZATION")
    currency = org.currency if org and org.currency else "INR"

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#123A6B"),
        alignment=0
    )
    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#667085")
    )
    section_heading = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=17,
        textColor=colors.HexColor("#123A6B"),
        spaceBefore=14,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        "Body",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#101828")
    )
    footer_style = ParagraphStyle(
        "FooterNote",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#98A2B3")
    )

    story = []

    # 1. Header
    now_str = datetime.now(timezone.utc).strftime("%d %b %Y, %H:%M UTC")
    story.append(Paragraph("<b>ResourceOne Operations Report</b>", title_style))
    story.append(Paragraph(f"<b>{org_name}</b> ({org_type}) &bull; Generated on: {now_str}", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#123A6B"), spaceAfter=14))

    # 2. Executive Snapshot
    items = db.query(InventoryItem).filter(
        InventoryItem.org_id == org_id,
        InventoryItem.is_archived == False
    ).all()

    total_items = len(items)
    low_stock_items = [i for i in items if i.calculate_status() in ["low", "out_of_stock"]]
    expiring_soon = [i for i in items if i.calculate_expiry_status() in ["expiring_30d", "expired"]]
    inv_valuation = sum((i.quantity_on_hand * i.unit_cost for i in items), Decimal("0.00"))

    summary_data = [
        [
            Paragraph(f"<b>Active Catalog Items:</b> {total_items}", body_style),
            Paragraph(f"<b>Inventory Valuation:</b> {currency} {inv_valuation:,.2f}", body_style)
        ],
        [
            Paragraph(f"<b>Low / Out of Stock:</b> {len(low_stock_items)} items", body_style),
            Paragraph(f"<b>Expiring / Expired:</b> {len(expiring_soon)} items", body_style)
        ]
    ]
    summary_table = Table(summary_data, colWidths=[270, 270])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F6F7F9")),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#E4E7EC")),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(summary_table)

    # 3. Low-Stock & Critical Table
    story.append(Paragraph("<b>Low-Stock & Reorder Alerts</b>", section_heading))
    if low_stock_items:
        table_rows = [["SKU", "Item Name", "Category", "On Hand", "Reorder Level", "Unit Cost", "Status"]]
        for it in low_stock_items[:25]:  # top 25 alerts
            st = it.calculate_status().upper()
            table_rows.append([
                it.sku,
                it.name[:25],
                it.category[:15],
                f"{it.quantity_on_hand:.1f} {it.unit}",
                str(it.reorder_level),
                f"{currency} {it.unit_cost:.2f}",
                st
            ])
        alert_table = Table(table_rows, colWidths=[65, 150, 95, 75, 55, 60, 40])
        alert_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#123A6B")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E4E7EC")),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8F9FA")]),
        ]))
        story.append(alert_table)
    else:
        story.append(Paragraph("All active inventory items are operating above reorder safety levels.", body_style))

    # 4. Finance Section (Role Filtered)
    if include_finance:
        story.append(Spacer(1, 10))
        story.append(Paragraph("<b>Financial Position & Cashflow Summary</b>", section_heading))
        fin = get_finance_summary(db, org_id)

        fin_data = [
            ["Metric", "Formula / Source", "Amount"],
            ["Total Cash Income", "Σ Cash Donations + Σ Sales Revenue", f"{currency} {fin.cash_income:,.2f}"],
            ["Total Operating Expenses", "Σ Direct Expenses + Σ Paid Purchases", f"{currency} {fin.expenses:,.2f}"],
            ["Net Operating Position", "Cash Income − Operating Expenses", f"{currency} {fin.net_position:,.2f}"],
            ["Total Purchases (All)", "Total procurement expenditure", f"{currency} {fin.total_purchases:,.2f}"],
        ]
        fin_table = Table(fin_data, colWidths=[160, 230, 150])
        fin_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#2563EB")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E4E7EC")),
            ('PADDING', (0, 0), (-1, -1), 5),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8F9FA")]),
        ]))
        story.append(fin_table)

    # 5. Audit Metrics & Methodology Footer
    story.append(Spacer(1, 14))
    audit_count = db.query(ActivityLog).filter(ActivityLog.org_id == org_id).count()
    story.append(Paragraph(f"<b>System Audit Status:</b> {audit_count} tamper-evident activity ledger records logged.", body_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#D0D5DD"), spaceAfter=6))
    story.append(Paragraph(
        "Definitions: Cash Income = Σ Cash Donations + Σ Sale Revenue; Operating Expenses = Σ Expenses + Σ Paid Purchases; "
        "Net Position = Cash Income − Operating Expenses; Inventory Value = Σ (Quantity On Hand × Unit Cost). "
        "Generated securely by ResourceOne Platform.",
        footer_style
    ))

    doc.build(story)
    return buffer.getvalue()
