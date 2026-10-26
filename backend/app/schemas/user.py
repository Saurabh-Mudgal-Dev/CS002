from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class UserBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=120)
    role: str = Field(default="volunteer", description="admin, manager, accountant, volunteer")
    is_active: bool = True


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    org_id: Optional[int] = None


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class UserRoleUpdate(BaseModel):
    role: Optional[str] = None
    is_active: Optional[bool] = None


class UserOut(UserBase):
    id: int
    org_id: int
    created_at: datetime

    @property
    def name(self) -> str:
        return self.full_name

    model_config = ConfigDict(from_attributes=True)
