from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, Request
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.audit import ActivityLog
from app.models.organization import Organization
from app.core.deps import get_current_user, get_optional_user, require_roles
from app.services.reporting import generate_inventory_csv, generate_finance_csv
from app.services.pdf import generate_combined_pdf

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/inventory.csv")
def download_inventory_csv(
    request: Request,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Download org inventory CSV.
    Permitted: all authenticated roles and public/guest viewers.
    """
    if current_user:
        org_id = current_user.org_id
    else:
        first_org = db.query(Organization).first()
        org_id = first_org.id if first_org else 1

    csv_content, filename = generate_inventory_csv(db, org_id)

    # Log export in audit trail if authenticated
    if current_user:
        ip_addr = request.client.host if request.client else "127.0.0.1"
        db.add(ActivityLog(
            org_id=current_user.org_id,
            actor_user_id=current_user.id,
            action="export",
            entity_type="inventory_report_csv",
            entity_id=None,
            summary=f"Exported inventory CSV ({filename})",
            ip_address=ip_addr,
            created_at=datetime.now(timezone.utc)
        ))
        db.commit()

    return Response(
        content=csv_content.encode("utf-8-sig"),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


@router.get("/finance.csv")
def download_finance_csv(
    request: Request,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Download combined finance CSV (Purchases, Donations, Expenses).
    Permitted: all authenticated roles and public guest viewers.
    """
    if current_user:
        org_id = current_user.org_id
    else:
        first_org = db.query(Organization).first()
        org_id = first_org.id if first_org else 1

    csv_content, filename = generate_finance_csv(db, org_id)

    if current_user:
        ip_addr = request.client.host if request.client else "127.0.0.1"
        db.add(ActivityLog(
            org_id=current_user.org_id,
            actor_user_id=current_user.id,
            action="export",
            entity_type="finance_report_csv",
            entity_id=None,
            summary=f"Exported finance CSV ({filename})",
            ip_address=ip_addr,
            created_at=datetime.now(timezone.utc)
        ))
        db.commit()

    return Response(
        content=csv_content.encode("utf-8-sig"),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


@router.get("/report.pdf")
def download_combined_pdf_report(
    request: Request,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Download combined PDF report.
    Permitted: all authenticated roles and guest viewers.
    Financial sections are filtered out if user is Volunteer or unauthenticated Guest.
    """
    if current_user:
        org_id = current_user.org_id
        include_fin = current_user.role.lower() in ["admin", "manager", "accountant"]
    else:
        first_org = db.query(Organization).first()
        org_id = first_org.id if first_org else 1
        include_fin = False

    pdf_bytes = generate_combined_pdf(db, org_id, include_finance=include_fin)

    today_str = datetime.now(timezone.utc).strftime("%Y%m%d")
    filename = f"ResourceOne_Operations_Report_{today_str}.pdf"

    if current_user:
        ip_addr = request.client.host if request.client else "127.0.0.1"
        db.add(ActivityLog(
            org_id=current_user.org_id,
            actor_user_id=current_user.id,
            action="export",
            entity_type="operations_report_pdf",
            entity_id=None,
            summary=f"Exported operations PDF report ({filename})",
            ip_address=ip_addr,
            created_at=datetime.now(timezone.utc)
        ))
        db.commit()

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
