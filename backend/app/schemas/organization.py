from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class OrganizationBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    org_type: str = Field(..., description="'ngo' or 'retail'")
    currency: str = Field(default="INR", max_length=10)


class OrganizationCreate(OrganizationBase):
    pass


class OrganizationUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=150)
    currency: Optional[str] = Field(None, max_length=10)


class OrganizationOut(OrganizationBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
