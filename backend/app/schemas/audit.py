from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, model_validator


class ActivityLogOut(BaseModel):
    id: int
    org_id: int
    actor_user_id: Optional[int] = None
    action: str
    entity_type: str
    entity_id: Optional[int] = None
    summary: str
    ip_address: Optional[str] = None
    created_at: datetime
    actor_name: Optional[str] = None

    # Legacy compatibility fields
    action_type: Optional[str] = None
    item_name: Optional[str] = None
    quantity_change: int = 0
    note: Optional[str] = None
    performed_by: Optional[str] = None
    timestamp: Optional[datetime] = None

    @model_validator(mode="before")
    @classmethod
    def populate_legacy(cls, data):
        if hasattr(data, "action"):
            actor_display = data.actor.full_name if (hasattr(data, "actor") and data.actor) else "System"
            return {
                "id": data.id,
                "org_id": data.org_id,
                "actor_user_id": data.actor_user_id,
                "action": data.action,
                "entity_type": data.entity_type,
                "entity_id": data.entity_id,
                "summary": data.summary,
                "ip_address": data.ip_address,
                "created_at": data.created_at,
                "actor_name": actor_display,
                "action_type": data.action,
                "item_name": data.summary,
                "quantity_change": 0,
                "note": data.summary,
                "performed_by": actor_display,
                "timestamp": data.created_at,
            }
        return data

    model_config = ConfigDict(from_attributes=True)
