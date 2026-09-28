from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import json

from app.database.session import get_db
from app.database.models import User, Incident, Alert, Sensor, AuditLog
from app.schemas.user import UserResponse
from app.api.v1.auth import require_role

router = APIRouter()

@router.get("/users", response_model=List[UserResponse])
def list_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["super_admin"]))
):
    return db.query(User).all()

@router.get("/audit-logs")
def list_audit_logs(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["super_admin", "state_authority"]))
):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    results = []
    for l in logs:
        results.append({
            "id": l.id,
            "user_id": l.user_id,
            "action": l.action,
            "target_type": l.target_type,
            "target_id": l.target_id,
            "details": json.loads(l.details_json or "{}"),
            "created_at": l.created_at
        })
    return results

@router.get("/system-stats")
def get_system_stats(db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    total_incidents = db.query(Incident).count()
    open_incidents = db.query(Incident).filter(Incident.status.in_(["submitted", "under_review", "in_progress"])).count()
    active_alerts = db.query(Alert).filter(Alert.status == "published").count()
    total_sensors = db.query(Sensor).count()
    online_sensors = db.query(Sensor).filter(Sensor.status == "online").count()

    return {
        "platform": "AI-Based early warning and landslide Risk Monitoring System in NER",
        "version": "1.0.0-PROTOTYPE",
        "stats": {
            "total_users": total_users,
            "total_incidents": total_incidents,
            "open_incidents": open_incidents,
            "active_alerts": active_alerts,
            "total_sensors": total_sensors,
            "online_sensors": online_sensors,
            "data_source_status": "All 8 NER state nodes connected"
        }
    }
