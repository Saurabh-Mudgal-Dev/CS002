from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, ActivityLog
from app.core.deps import get_current_user, require_roles
from app.schemas.user import UserOut, UserRoleUpdate

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=List[UserOut])
def list_team_users(
    current_user: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db)
):
    """Admin-only endpoint to list all team accounts within the organization."""
    return db.query(User).filter(User.org_id == current_user.org_id).order_by(User.id.asc()).all()


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
    if req.role is not None:
        valid_roles = ["admin", "manager", "accountant", "volunteer"]
        new_role = req.role.lower().strip()
        if new_role not in valid_roles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role. Allowed roles: {', '.join(valid_roles)}"
            )
        old_role = user.role
        user.role = new_role
        changes.append(f"role: {old_role} -> {new_role}")

    if req.is_active is not None:
        user.is_active = req.is_active
        changes.append(f"active: {req.is_active}")

    if changes:
        client_ip = request.client.host if request.client else "127.0.0.1"
        log = ActivityLog(
            org_id=current_user.org_id,
            actor_user_id=current_user.id,
            action="update",
            entity_type="user",
            entity_id=user.id,
            summary=f"Admin updated user {user.email} ({', '.join(changes)})",
            ip_address=client_ip,
            created_at=datetime.now(timezone.utc),
        )
        db.add(log)
        db.commit()
        db.refresh(user)

    return user
