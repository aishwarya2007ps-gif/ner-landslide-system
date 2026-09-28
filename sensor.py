from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SensorBase(BaseModel):
    sensor_code: str
    sensor_type: str
    district: str
    location_lat: float
    location_lng: float
    warning_threshold: float
    critical_threshold: float
    unit: str

class SensorCreate(SensorBase):
    pass

class SensorReadingCreate(BaseModel):
    sensor_code: str
    value: float
    recorded_at: Optional[datetime] = None

class SensorResponse(SensorBase):
    id: str
    status: str
    last_reading_value: Optional[float] = None
    last_reading_time: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
