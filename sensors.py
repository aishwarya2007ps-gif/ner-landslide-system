from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
import random

from app.database.session import get_db
from app.database.models import Sensor, SensorReading
from app.schemas.sensor import SensorCreate, SensorResponse, SensorReadingCreate

router = APIRouter()

@router.get("", response_model=List[SensorResponse])
def list_sensors(district: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Sensor)
    if district and district != "all":
        query = query.filter(Sensor.district == district)
    return query.all()

@router.post("/reading")
def ingest_sensor_reading(reading: SensorReadingCreate, db: Session = Depends(get_db)):
    sensor = db.query(Sensor).filter(Sensor.sensor_code == reading.sensor_code).first()
    if not sensor:
        raise HTTPException(status_code=404, detail=f"Sensor {reading.sensor_code} not registered")

    # Simple outlier check (e.g. 5x of critical or negative values for non-displacement)
    is_outlier = False
    if reading.value < 0 and sensor.sensor_type != "inclinometer":
        is_outlier = True
    elif reading.value > (sensor.critical_threshold * 4.0):
        is_outlier = True

    now = reading.recorded_at or datetime.now(timezone.utc)
    sensor.last_reading_value = reading.value
    sensor.last_reading_time = now

    if not is_outlier:
        if reading.value >= sensor.critical_threshold:
            sensor.status = "warning"
        elif reading.value >= sensor.warning_threshold:
            sensor.status = "warning"
        else:
            sensor.status = "online"

    db_reading = SensorReading(
        sensor_id=sensor.id,
        value=reading.value,
        recorded_at=now,
        is_outlier=is_outlier
    )
    db.add(db_reading)
    db.commit()

    return {
        "sensor_code": sensor.sensor_code,
        "recorded_value": reading.value,
        "status": sensor.status,
        "is_outlier": is_outlier
    }

@router.post("/simulate")
def simulate_sensor_telemetry(db: Session = Depends(get_db)):
    """
    Simulates live IoT sensor pulses across all deployed stations in NER.
    """
    sensors = db.query(Sensor).all()
    updated = []

    for s in sensors:
        # Generate realistic variations based on sensor type
        if s.sensor_type == "rainfall":
            val = round(random.uniform(10.0, 110.0), 1)
        elif s.sensor_type == "soil_moisture":
            val = round(random.uniform(45.0, 92.0), 1)
        elif s.sensor_type == "river_level":
            val = round(random.uniform(3.5, 12.8), 2)
        elif s.sensor_type == "inclinometer":
            val = round(random.uniform(-0.5, 3.2), 2)
        else:
            val = round(random.uniform(18.0, 32.0), 1)

        s.last_reading_value = val
        s.last_reading_time = datetime.now(timezone.utc)
        if val >= s.critical_threshold:
            s.status = "warning"
        else:
            s.status = "online"

        updated.append({"sensor_code": s.sensor_code, "type": s.sensor_type, "new_reading": val, "status": s.status})

    db.commit()
    return {"message": f"Simulated telemetry updated for {len(updated)} sensors", "sensors": updated}
