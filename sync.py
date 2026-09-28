from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json
import uuid

from app.database.session import get_db
from app.database.models import Incident, User
from app.schemas.incident import IncidentCreate, SyncBatchRequest
from app.api.v1.auth import get_current_user

router = APIRouter()

@router.post("/batch")
def sync_batch_reports(
    batch_req: SyncBatchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Synchronizes reports created offline by field workers or volunteers.
    Ensures idempotency using client_id.
    """
    synced_ids = []
    duplicate_ids = []
    failed_items = []

    for report in batch_req.reports:
        cid = report.client_id or str(uuid.uuid4())
        try:
            existing = db.query(Incident).filter(Incident.client_id == cid).first()
            if existing:
                duplicate_ids.append(cid)
                continue

            new_inc = Incident(
                client_id=cid,
                reporter_id=current_user.id,
                hazard_type=report.hazard_type,
                title=report.title,
                description=report.description,
                severity=report.severity,
                status="submitted",
                latitude=report.latitude,
                longitude=report.longitude,
                district=report.district,
                village=report.village,
                affected_people=report.affected_people,
                road_status=report.road_status,
                attachments_json=json.dumps(report.attachments or [])
            )
            db.add(new_inc)
            synced_ids.append(cid)
        except Exception as e:
            failed_items.append({"client_id": cid, "error": str(e)})

    db.commit()

    return {
        "status": "success",
        "synced_count": len(synced_ids),
        "synced_ids": synced_ids,
        "duplicate_ids": duplicate_ids,
        "failed_items": failed_items
    }
