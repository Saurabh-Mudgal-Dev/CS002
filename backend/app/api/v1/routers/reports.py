from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Request
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.audit import ActivityLog
from app.core.deps import get_current_user, require_roles
from app.services.reporting import generate_inventory_csv, generate_finance_csv
from app.services.pdf import generate_combined_pdf

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/inventory.csv")
def download_inventory_csv(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Download org inventory CSV.
    Permitted: all authenticated roles.
    """
    csv_content, filename = generate_inventory_csv(db, current_user.org_id)

    # Log export in audit trail
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
    current_user: User = Depends(require_roles("admin", "manager", "accountant")),
    db: Session = Depends(get_db)
):
    """
    Download combined finance CSV (Purchases, Donations, Expenses).
    Permitted: Admin, Manager, Accountant.
    """
    csv_content, filename = generate_finance_csv(db, current_user.org_id)

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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Download combined PDF report.
    Permitted: all authenticated roles.
    Financial sections are filtered out if user is Volunteer.
    """
    include_fin = current_user.role.lower() in ["admin", "manager", "accountant"]
    pdf_bytes = generate_combined_pdf(db, current_user.org_id, include_finance=include_fin)

    today_str = datetime.now(timezone.utc).strftime("%Y%m%d")
    filename = f"ResourceOne_Operations_Report_{today_str}.pdf"

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
