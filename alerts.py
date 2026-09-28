from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
import json
import uuid

from app.database.session import get_db
from app.database.models import Alert, User, AuditLog
from app.schemas.alert import AlertCreate, AlertResponse
from app.api.v1.auth import get_current_user, require_role
from app.adapters.notification_adapter import NotificationDispatcher

router = APIRouter()

@router.get("", response_model=List[AlertResponse])
def list_alerts(
    district: Optional[str] = None,
    status: Optional[str] = None,
    hazard_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if district and district != "all":
        query = query.filter(Alert.affected_district == district)
    if status and status != "all":
        query = query.filter(Alert.status == status)
    if hazard_type and hazard_type != "all":
        query = query.filter(Alert.hazard_type == hazard_type)

    alerts = query.order_by(Alert.created_at.desc()).all()
    results = []
    for a in alerts:
        results.append(AlertResponse(
            id=a.id,
            alert_code=a.alert_code,
            hazard_type=a.hazard_type,
            severity=a.severity,
            title=a.title,
            warning_message=a.warning_message,
            recommended_actions=json.loads(a.recommended_actions_json or "[]"),
            affected_district=a.affected_district,
            status=a.status,
            valid_from=a.valid_from,
            valid_to=a.valid_to,
            channels=json.loads(a.channels_sent_json or "[\"in_app\"]"),
            issuer_id=a.issuer_id,
            created_at=a.created_at
        ))
    return results

@router.post("", response_model=AlertResponse)
async def create_alert(
    alert_in: AlertCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["super_admin", "state_authority", "district_authority"]))
):
    # Deduplication check: check if an identical active alert exists for this district & hazard
    now = datetime.now(timezone.utc)
    existing = db.query(Alert).filter(
        Alert.affected_district == alert_in.affected_district,
        Alert.hazard_type == alert_in.hazard_type,
        Alert.status == "published",
        Alert.valid_to > now
    ).first()

    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"An active alert for '{alert_in.hazard_type}' in district '{alert_in.affected_district}' is already published (#{existing.alert_code})."
        )

    alert_code = f"NER-ALT-{uuid.uuid4().hex[:6].upper()}"

    new_alert = Alert(
        alert_code=alert_code,
        hazard_type=alert_in.hazard_type,
        severity=alert_in.severity,
        title=alert_in.title,
        warning_message=alert_in.warning_message,
        recommended_actions_json=json.dumps(alert_in.recommended_actions or []),
        affected_district=alert_in.affected_district,
        status="published",
        valid_from=now,
        valid_to=alert_in.valid_to,
        issuer_id=current_user.id,
        channels_sent_json=json.dumps(alert_in.channels or ["in_app"])
    )
    db.add(new_alert)

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="CREATE_ALERT",
        target_type="alert",
        target_id=alert_code,
        details_json=json.dumps({"district": alert_in.affected_district, "severity": alert_in.severity})
    )
    db.add(audit)
    db.commit()
    db.refresh(new_alert)

    # Dispatch to notification adapter (mock SMS/Email & in-app)
    await NotificationDispatcher.dispatch(
        channels=alert_in.channels,
        recipient=f"{alert_in.affected_district} Emergency Channel",
        title=alert_in.title,
        message=alert_in.warning_message,
        severity=alert_in.severity
    )

    return AlertResponse(
        id=new_alert.id,
        alert_code=new_alert.alert_code,
        hazard_type=new_alert.hazard_type,
        severity=new_alert.severity,
        title=new_alert.title,
        warning_message=new_alert.warning_message,
        recommended_actions=alert_in.recommended_actions,
        affected_district=new_alert.affected_district,
        status=new_alert.status,
        valid_from=new_alert.valid_from,
        valid_to=new_alert.valid_to,
        channels=alert_in.channels,
        issuer_id=new_alert.issuer_id,
        created_at=new_alert.created_at
    )

@router.patch("/{alert_id}/status")
def update_alert_status(
    alert_id: str,
    status: str = Query(..., regex="^(published|expired|cancelled)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["super_admin", "state_authority", "district_authority"]))
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.status = status
    audit = AuditLog(
        user_id=current_user.id,
        action="UPDATE_ALERT_STATUS",
        target_type="alert",
        target_id=alert.alert_code,
        details_json=json.dumps({"new_status": status})
    )
    db.add(audit)
    db.commit()
    return {"message": f"Alert {alert.alert_code} status updated to {status}"}
