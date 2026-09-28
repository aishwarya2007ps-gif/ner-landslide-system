from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class IncidentBase(BaseModel):
    hazard_type: str
    title: str
    description: str
    severity: str = "medium"
    latitude: float
    longitude: float
    district: str
    village: Optional[str] = None
    affected_people: int = 0
    road_status: str = "passable"
    attachments: List[str] = []

class IncidentCreate(IncidentBase):
    client_id: Optional[str] = None

class IncidentUpdate(BaseModel):
    status: Optional[str] = None
    severity: Optional[str] = None
    verification_notes: Optional[str] = None
    assigned_team: Optional[str] = None

class IncidentResponse(IncidentBase):
    id: str
    client_id: str
    status: str
    reporter_id: Optional[str] = None
    verification_notes: Optional[str] = None
    assigned_team: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SyncBatchRequest(BaseModel):
    reports: List[IncidentCreate]
