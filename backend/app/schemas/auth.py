from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.user import UserOut


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class SessionUser(BaseModel):
    id: int
    org_id: int
    org_name: str
    org_type: str
    currency: str
    email: str
    full_name: str
    role: str

    model_config = ConfigDict(from_attributes=True)


class TokenData(BaseModel):
    sub: str
    org: int
    role: str
