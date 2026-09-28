from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class AlertBase(BaseModel):
    hazard_type: str
    severity: str # warning, high, critical
    title: str
    warning_message: str
    recommended_actions: List[str] = []
    affected_district: str
    valid_to: datetime
    channels: List[str] = ["in_app"]

class AlertCreate(AlertBase):
    pass

class AlertResponse(AlertBase):
    id: str
    alert_code: str
    status: str
    valid_from: datetime
    issuer_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
