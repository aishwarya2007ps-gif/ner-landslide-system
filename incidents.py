from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import uuid

from app.database.session import get_db
from app.database.models import Incident, User, AuditLog
from app.schemas.incident import IncidentCreate, IncidentUpdate, IncidentResponse
from app.api.v1.auth import get_current_user, require_role

router = APIRouter()

@router.get("", response_model=List[IncidentResponse])
def list_incidents(
    hazard_type: Optional[str] = None,
    status: Optional[str] = None,
    district: Optional[str] = None,
    severity: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Incident)
    if hazard_type and hazard_type != "all":
        query = query.filter(Incident.hazard_type == hazard_type)
    if status and status != "all":
        query = query.filter(Incident.status == status)
    if district and district != "all":
        query = query.filter(Incident.district == district)
    if severity and severity != "all":
        query = query.filter(Incident.severity == severity)

    incidents = query.order_by(Incident.created_at.desc()).offset(skip).limit(limit).all()
    
    # Map attachments_json to attachments
    results = []
    for inc in incidents:
        res = IncidentResponse(
            id=inc.id,
            client_id=inc.client_id,
            hazard_type=inc.hazard_type,
            title=inc.title,
            description=inc.description,
            severity=inc.severity,
            status=inc.status,
            latitude=inc.latitude,
            longitude=inc.longitude,
            district=inc.district,
            village=inc.village,
            affected_people=inc.affected_people,
            road_status=inc.road_status,
            attachments=json.loads(inc.attachments_json or "[]"),
            reporter_id=inc.reporter_id,
            verification_notes=inc.verification_notes,
            assigned_team=inc.assigned_team,
            created_at=inc.created_at,
            updated_at=inc.updated_at
        )
        results.append(res)
    return results

@router.post("", response_model=IncidentResponse)
def create_incident(
    report_in: IncidentCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    cid = report_in.client_id or str(uuid.uuid4())
    existing = db.query(Incident).filter(Incident.client_id == cid).first()
    if existing:
        return IncidentResponse(
            id=existing.id,
            client_id=existing.client_id,
            hazard_type=existing.hazard_type,
            title=existing.title,
            description=existing.description,
            severity=existing.severity,
            status=existing.status,
            latitude=existing.latitude,
            longitude=existing.longitude,
            district=existing.district,
            village=existing.village,
            affected_people=existing.affected_people,
            road_status=existing.road_status,
            attachments=json.loads(existing.attachments_json or "[]"),
            reporter_id=existing.reporter_id,
            verification_notes=existing.verification_notes,
            assigned_team=existing.assigned_team,
            created_at=existing.created_at,
            updated_at=existing.updated_at
        )

    new_incident = Incident(
        client_id=cid,
        reporter_id=current_user.id if current_user else None,
        hazard_type=report_in.hazard_type,
        title=report_in.title,
        description=report_in.description,
        severity=report_in.severity,
        status="submitted",
        latitude=report_in.latitude,
        longitude=report_in.longitude,
        district=report_in.district,
        village=report_in.village,
        affected_people=report_in.affected_people,
        road_status=report_in.road_status,
        attachments_json=json.dumps(report_in.attachments or [])
    )
    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)

    return IncidentResponse(
        id=new_incident.id,
        client_id=new_incident.client_id,
        hazard_type=new_incident.hazard_type,
        title=new_incident.title,
        description=new_incident.description,
        severity=new_incident.severity,
        status=new_incident.status,
        latitude=new_incident.latitude,
        longitude=new_incident.longitude,
        district=new_incident.district,
        village=new_incident.village,
        affected_people=new_incident.affected_people,
        road_status=new_incident.road_status,
        attachments=report_in.attachments or [],
        reporter_id=new_incident.reporter_id,
        verification_notes=new_incident.verification_notes,
        assigned_team=new_incident.assigned_team,
        created_at=new_incident.created_at,
        updated_at=new_incident.updated_at
    )

@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(incident_id: str, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return IncidentResponse(
        id=inc.id,
        client_id=inc.client_id,
        hazard_type=inc.hazard_type,
        title=inc.title,
        description=inc.description,
        severity=inc.severity,
        status=inc.status,
        latitude=inc.latitude,
        longitude=inc.longitude,
        district=inc.district,
        village=inc.village,
        affected_people=inc.affected_people,
        road_status=inc.road_status,
        attachments=json.loads(inc.attachments_json or "[]"),
        reporter_id=inc.reporter_id,
        verification_notes=inc.verification_notes,
        assigned_team=inc.assigned_team,
        created_at=inc.created_at,
        updated_at=inc.updated_at
    )

@router.patch("/{incident_id}", response_model=IncidentResponse)
def update_incident_status(
    incident_id: str,
    update_data: IncidentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["super_admin", "state_authority", "district_authority"]))
):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    if update_data.status:
        inc.status = update_data.status
        if update_data.status == "verified":
            inc.verified_by = current_user.id
    if update_data.severity:
        inc.severity = update_data.severity
    if update_data.verification_notes is not None:
        inc.verification_notes = update_data.verification_notes
    if update_data.assigned_team is not None:
        inc.assigned_team = update_data.assigned_team

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="UPDATE_INCIDENT_STATUS",
        target_type="incident",
        target_id=incident_id,
        details_json=json.dumps({"new_status": inc.status, "assigned_team": inc.assigned_team})
    )
    db.add(audit)
    db.commit()
    db.refresh(inc)

    return IncidentResponse(
        id=inc.id,
        client_id=inc.client_id,
        hazard_type=inc.hazard_type,
        title=inc.title,
        description=inc.description,
        severity=inc.severity,
        status=inc.status,
        latitude=inc.latitude,
        longitude=inc.longitude,
        district=inc.district,
        village=inc.village,
        affected_people=inc.affected_people,
        road_status=inc.road_status,
        attachments=json.loads(inc.attachments_json or "[]"),
        reporter_id=inc.reporter_id,
        verification_notes=inc.verification_notes,
        assigned_team=inc.assigned_team,
        created_at=inc.created_at,
        updated_at=inc.updated_at
    )
