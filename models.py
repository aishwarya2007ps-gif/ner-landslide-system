import uuid
from datetime import datetime, timezone
import json
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey
from app.database.session import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(50), default="citizen", nullable=False) # super_admin, state_authority, district_authority, field_worker, citizen
    phone_number = Column(String(20), nullable=True)
    assigned_state = Column(String(50), nullable=True)
    assigned_district = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

class District(Base):
    __tablename__ = "districts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, nullable=False)
    state = Column(String(50), nullable=False)
    headquarters = Column(String(100), nullable=True)
    population = Column(Integer, default=0)
    risk_level = Column(String(20), default="Low") # Low, Moderate, High, Critical
    boundary_geojson = Column(Text, nullable=True) # GeoJSON representation of polygon
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

class CriticalFacility(Base):
    __tablename__ = "critical_facilities"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(150), nullable=False)
    facility_type = Column(String(50), nullable=False) # shelter, hospital, helipad, relief_camp
    district_name = Column(String(100), nullable=False)
    capacity = Column(Integer, default=0)
    contact_phone = Column(String(30), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    client_id = Column(String(64), unique=True, index=True, nullable=False) # Offline idempotency key
    reporter_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    hazard_type = Column(String(50), nullable=False) # landslide, flash_flood, road_blockage, bridge_damage, slope_failure, etc.
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(20), default="medium", nullable=False) # low, medium, high, critical
    status = Column(String(30), default="submitted", nullable=False) # submitted, under_review, verified, assigned, in_progress, resolved, rejected
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    district = Column(String(100), nullable=False)
    village = Column(String(100), nullable=True)
    affected_people = Column(Integer, default=0)
    road_status = Column(String(50), default="passable") # passable, partially_blocked, blocked, destroyed
    attachments_json = Column(Text, default="[]") # JSON list of strings/URLs
    verification_notes = Column(Text, nullable=True)
    verified_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    assigned_team = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    alert_code = Column(String(50), unique=True, index=True, nullable=False)
    hazard_type = Column(String(50), nullable=False)
    severity = Column(String(20), nullable=False) # warning, high, critical
    title = Column(String(200), nullable=False)
    warning_message = Column(Text, nullable=False)
    recommended_actions_json = Column(Text, default="[]")
    affected_district = Column(String(100), nullable=False)
    status = Column(String(20), default="published", nullable=False) # draft, published, expired, cancelled
    valid_from = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    valid_to = Column(DateTime(timezone=True), nullable=False)
    issuer_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    channels_sent_json = Column(Text, default="[\"in_app\"]")
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    sensor_code = Column(String(50), unique=True, index=True, nullable=False)
    sensor_type = Column(String(50), nullable=False) # rainfall, river_level, soil_moisture, inclinometer, temperature
    district = Column(String(100), nullable=False)
    location_lat = Column(Float, nullable=False)
    location_lng = Column(Float, nullable=False)
    warning_threshold = Column(Float, nullable=False)
    critical_threshold = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False)
    status = Column(String(20), default="online", nullable=False) # online, warning, offline
    last_reading_value = Column(Float, nullable=True)
    last_reading_time = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    sensor_id = Column(String(36), ForeignKey("sensors.id"), nullable=False)
    value = Column(Float, nullable=False)
    recorded_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    is_outlier = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    district = Column(String(100), nullable=False)
    risk_score = Column(Float, nullable=False) # 0 to 100
    risk_category = Column(String(20), nullable=False) # Low, Moderate, High, Critical
    hazard_type = Column(String(50), default="landslide", nullable=False)
    top_factors_json = Column(Text, default="[]")
    recommended_action = Column(Text, nullable=False)
    model_version = Column(String(50), default="NER-RISK-PROTOTYPE-v1.4", nullable=False)
    calculated_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), nullable=True)
    action = Column(String(100), nullable=False)
    target_type = Column(String(50), nullable=False)
    target_id = Column(String(100), nullable=True)
    details_json = Column(Text, default="{}")
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
