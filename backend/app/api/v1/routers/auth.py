from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, ActivityLog
from app.core.config import settings
from app.core.security import verify_password, create_access_token
from app.core.deps import get_current_user
from app.schemas.auth import LoginRequest, TokenResponse, SessionUser
from app.schemas.user import UserOut

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(
    req: LoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == req.email.strip().lower()).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive"
        )

    # Claims: sub, org, role
    claims = {
        "sub": str(user.id),
        "org": user.org_id,
        "role": user.role,
    }
    token = create_access_token(data=claims)

    # Deliver 8-hour httpOnly cookie
    max_age_seconds = settings.ACCESS_TOKEN_HOURS * 3600
    is_secure = (settings.ENVIRONMENT == "production")
    response.set_cookie(
        key="ro_session",
        value=token,
        max_age=max_age_seconds,
        expires=max_age_seconds,
        httponly=True,
        samesite="lax",
        secure=is_secure,
        path="/",
    )

    # Log successful login to immutable audit trail
    client_ip = request.client.host if request.client else "127.0.0.1"
    log = ActivityLog(
        org_id=user.org_id,
        actor_user_id=user.id,
        action="login",
        entity_type="auth",
        entity_id=user.id,
        summary=f"User {user.email} authenticated",
        ip_address=client_ip,
        created_at=datetime.now(timezone.utc),
    )
    db.add(log)
    db.commit()

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserOut.model_validate(user),
    )


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="ro_session", path="/")
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=SessionUser)
def get_me(current_user: User = Depends(get_current_user)):
    org = current_user.organization
    return SessionUser(
        id=current_user.id,
        org_id=current_user.org_id,
        org_name=org.name if org else "",
        org_type=org.org_type if org else "",
        currency=org.currency if org else "INR",
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
    )
