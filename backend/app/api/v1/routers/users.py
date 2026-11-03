from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, ActivityLog, Organization
from app.core.deps import get_optional_user, require_roles
from app.schemas.user import UserOut, UserRoleUpdate

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=List[UserOut])
def list_team_users(
    org_type: Optional[str] = Query("ngo"),
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    List all team accounts within the organization.
    Publicly visible in read-only mode for directory transparency;
    Role mutations and deactivations remain strictly restricted to Administrators.
    """
    if current_user:
        target_org_id = current_user.org_id
    else:
        org = db.query(Organization).filter(Organization.org_type == org_type).first()
        target_org_id = org.id if org else 1

    return db.query(User).filter(User.org_id == target_org_id).order_by(User.id.asc()).all()


@router.patch("/{user_id}", response_model=UserOut)
def update_user_role_or_status(
    user_id: int,
    req: UserRoleUpdate,
    request: Request,
    current_user: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db)
):
    """Admin-only endpoint to update user role or active status. Scoped strictly to current organization."""
    user = db.query(User).filter(
        User.id == user_id,
        User.org_id == current_user.org_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found in your organization"
        )

    # Prevent admin from deactivating themselves
    if user.id == current_user.id and req.is_active is False:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrators cannot deactivate their own account"
        )

    changes = []
    if req.role is not None and req.role.lower() != user.role.lower():
        changes.append(f"role '{user.role}' -> '{req.role}'")
        user.role = req.role.lower()

    if req.is_active is not None and req.is_active != user.is_active:
        changes.append(f"status '{'active' if user.is_active else 'inactive'}' -> '{'active' if req.is_active else 'inactive'}'")
        user.is_active = req.is_active

    if changes:
        ip_addr = request.client.host if request.client else "127.0.0.1"
        audit = ActivityLog(
            org_id=current_user.org_id,
            action_type="USER_MODIFIED",
            details=f"Admin {current_user.email} changed user {user.email}: {', '.join(changes)}",
            performed_by=current_user.full_name or current_user.email,
            ip_address=ip_addr,
            timestamp=datetime.now(timezone.utc)
        )
        db.add(audit)
        db.commit()
        db.refresh(user)

    return user
