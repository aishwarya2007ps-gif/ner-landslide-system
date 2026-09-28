import json
from datetime import datetime, timezone, timedelta
from app.database.session import SessionLocal, engine, Base
from app.database.models import User, District, CriticalFacility, Sensor, SensorReading, Alert, Incident
from app.core.security import get_password_hash

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Users (5 roles)
        demo_users = [
            {
                "email": "admin@ner-disaster.gov.in",
                "full_name": "NER Emergency Director",
                "role": "super_admin",
                "phone_number": "+91-361-2237001",
                "assigned_state": "All NER",
                "assigned_district": "Regional HQ"
            },
            {
                "email": "state@ner-disaster.gov.in",
                "full_name": "Assam State Disaster Officer",
                "role": "state_authority",
                "phone_number": "+91-361-2237002",
                "assigned_state": "Assam",
                "assigned_district": "State Operations"
            },
            {
                "email": "district@ner-disaster.gov.in",
                "full_name": "Kamrup Metro District Officer",
                "role": "district_authority",
                "phone_number": "+91-361-2237003",
                "assigned_state": "Assam",
                "assigned_district": "Kamrup Metropolitan"
            },
            {
                "email": "field@ner-disaster.gov.in",
                "full_name": "Biren Das (Field Scout SDRF)",
                "role": "field_worker",
                "phone_number": "+91-94350-12345",
                "assigned_state": "Assam",
                "assigned_district": "Kamrup Metropolitan"
            },
            {
                "email": "citizen@ner-disaster.gov.in",
                "full_name": "Ananya Sharma (Citizen Volunteer)",
                "role": "citizen",
                "phone_number": "+91-98640-54321",
                "assigned_state": "Assam",
                "assigned_district": "Kamrup Metropolitan"
            }
        ]

        for u_data in demo_users:
            if not db.query(User).filter(User.email == u_data["email"]).first():
                user = User(
                    email=u_data["email"],
                    hashed_password=get_password_hash("Password123!"),
                    full_name=u_data["full_name"],
                    role=u_data["role"],
                    phone_number=u_data["phone_number"],
                    assigned_state=u_data["assigned_state"],
                    assigned_district=u_data["assigned_district"],
                    is_active=True
                )
                db.add(user)

        # 2. Seed Districts for 8 NER States
        districts_data = [
            {"name": "Kamrup Metropolitan", "state": "Assam", "headquarters": "Guwahati", "population": 1253938, "risk_level": "High"},
            {"name": "Dima Hasao", "state": "Assam", "headquarters": "Haflong", "population": 214102, "risk_level": "Critical"},
            {"name": "East Khasi Hills", "state": "Meghalaya", "headquarters": "Shillong", "population": 825922, "risk_level": "Critical"},
            {"name": "West Garo Hills", "state": "Meghalaya", "headquarters": "Tura", "population": 643291, "risk_level": "Moderate"},
            {"name": "East Sikkim", "state": "Sikkim", "headquarters": "Gangtok", "population": 283583, "risk_level": "Critical"},
            {"name": "North Sikkim", "state": "Sikkim", "headquarters": "Mangan", "population": 43709, "risk_level": "Critical"},
            {"name": "Papum Pare", "state": "Arunachal Pradesh", "headquarters": "Yupia / Itanagar", "population": 176562, "risk_level": "High"},
            {"name": "West Kameng", "state": "Arunachal Pradesh", "headquarters": "Bomdila", "population": 83947, "risk_level": "High"},
            {"name": "Kohima", "state": "Nagaland", "headquarters": "Kohima", "population": 267988, "risk_level": "High"},
            {"name": "Imphal West", "state": "Manipur", "headquarters": "Lamphelpat", "population": 517992, "risk_level": "Moderate"},
            {"name": "Aizawl", "state": "Mizoram", "headquarters": "Aizawl", "population": 400309, "risk_level": "Critical"},
            {"name": "West Tripura", "state": "Tripura", "headquarters": "Agartala", "population": 918200, "risk_level": "Moderate"}
        ]

        for d in districts_data:
            if not db.query(District).filter(District.name == d["name"]).first():
                dist = District(
                    name=d["name"],
                    state=d["state"],
                    headquarters=d["headquarters"],
                    population=d["population"],
                    risk_level=d["risk_level"]
                )
                db.add(dist)

        # 3. Seed Shelters & Hospitals
        facilities = [
            {"name": "Guwahati Central Disaster Relief Center", "type": "shelter", "district": "Kamrup Metropolitan", "cap": 500, "phone": "0361-2237000", "lat": 26.1850, "lng": 91.7470},
            {"name": "Gauhati Medical College & Hospital (GMCH)", "type": "hospital", "district": "Kamrup Metropolitan", "cap": 1200, "phone": "0361-2130230", "lat": 26.1585, "lng": 91.7712},
            {"name": "Cherrapunji Sub-Divisional Shelter Camp", "type": "shelter", "district": "East Khasi Hills", "cap": 300, "phone": "0364-2224000", "lat": 25.2700, "lng": 91.7300},
            {"name": "NEIGRIHMS Shillong Tertiary Hospital", "type": "hospital", "district": "East Khasi Hills", "cap": 800, "phone": "0364-2538011", "lat": 25.5900, "lng": 91.9300},
            {"name": "Gangtok Relief Camp Base", "type": "shelter", "district": "East Sikkim", "cap": 350, "phone": "03592-202000", "lat": 27.3389, "lng": 98.6138},
            {"name": "Sir Thutob Namgyal Memorial Hospital (STNM)", "type": "hospital", "district": "East Sikkim", "cap": 500, "phone": "03592-201075", "lat": 27.3290, "lng": 98.6100},
            {"name": "Itanagar Multi-purpose Community Shelter", "type": "shelter", "district": "Papum Pare", "cap": 400, "phone": "0360-2212000", "lat": 27.0844, "lng": 93.6053},
            {"name": "Aizawl Civil Hospital & Trauma Center", "type": "hospital", "district": "Aizawl", "cap": 450, "phone": "0389-2322318", "lat": 23.7271, "lng": 92.7176}
        ]

        for f in facilities:
            if not db.query(CriticalFacility).filter(CriticalFacility.name == f["name"]).first():
                fac = CriticalFacility(
                    name=f["name"],
                    facility_type=f["type"],
                    district_name=f["district"],
                    capacity=f["cap"],
                    contact_phone=f["phone"],
                    latitude=f["lat"],
                    longitude=f["lng"]
                )
                db.add(fac)

        # 4. Seed Sensors
        sensors_data = [
            {"code": "RG-KAM-01", "type": "rainfall", "district": "Kamrup Metropolitan", "lat": 26.1445, "lng": 91.7362, "w_th": 65.0, "c_th": 115.0, "unit": "mm/24h", "val": 74.2},
            {"code": "SP-KAM-02", "type": "soil_moisture", "district": "Kamrup Metropolitan", "lat": 26.1550, "lng": 91.7450, "w_th": 75.0, "c_th": 90.0, "unit": "%", "val": 82.5},
            {"code": "RL-KAM-03", "type": "river_level", "district": "Kamrup Metropolitan", "lat": 26.1920, "lng": 91.7510, "w_th": 48.0, "c_th": 49.68, "unit": "m (Danger Mark 49.68m)", "val": 49.10},
            {"code": "RG-MEG-01", "type": "rainfall", "district": "East Khasi Hills", "lat": 25.2750, "lng": 91.7280, "w_th": 100.0, "c_th": 180.0, "unit": "mm/24h", "val": 155.0},
            {"code": "INC-SIK-01", "type": "inclinometer", "district": "East Sikkim", "lat": 27.3100, "lng": 98.6050, "w_th": 1.5, "c_th": 3.0, "unit": "mm/day", "val": 2.4},
            {"code": "RL-PAP-01", "type": "river_level", "district": "Papum Pare", "lat": 27.0600, "lng": 93.6100, "w_th": 8.0, "c_th": 11.5, "unit": "m", "val": 7.4}
        ]

        for s in sensors_data:
            if not db.query(Sensor).filter(Sensor.sensor_code == s["code"]).first():
                sens = Sensor(
                    sensor_code=s["code"],
                    sensor_type=s["type"],
                    district=s["district"],
                    location_lat=s["lat"],
                    location_lng=s["lng"],
                    warning_threshold=s["w_th"],
                    critical_threshold=s["c_th"],
                    unit=s["unit"],
                    status="warning" if s["val"] >= s["w_th"] else "online",
                    last_reading_value=s["val"],
                    last_reading_time=datetime.now(timezone.utc)
                )
                db.add(sens)

        # 5. Seed Alerts
        now = datetime.now(timezone.utc)
        alerts_data = [
            {
                "code": "NER-ALT-001",
                "hazard": "landslide",
                "severity": "critical",
                "title": "Severe Slope Debris Warning on NH-10 Teesta Corridor",
                "msg": "Continuous rainfall has destabilized vulnerable hill slopes between Melli and Rangpo. Traffic restricted to essential emergency convoy only.",
                "actions": ["Avoid NH-10 night travel", "Residents near unstable cut slopes to move to STNM shelter", "SDRF staging at Rangpo checkpost"],
                "district": "East Sikkim",
                "valid_to": now + timedelta(hours=18)
            },
            {
                "code": "NER-ALT-002",
                "hazard": "flash_flood",
                "severity": "high",
                "title": "Brahmaputra Tributary Kopili Stage Rise Warning",
                "msg": "River Kopili water level has surpassed the warning mark by 0.6m. Inundation alert for agricultural lowlands in Morigaon and Kamrup outskirts.",
                "actions": ["Relocate livestock to elevated highlands", "Keep emergency battery lanterns charged", "Follow DDMA radio advisories"],
                "district": "Kamrup Metropolitan",
                "valid_to": now + timedelta(hours=24)
            }
        ]

        for a in alerts_data:
            if not db.query(Alert).filter(Alert.alert_code == a["code"]).first():
                alert = Alert(
                    alert_code=a["code"],
                    hazard_type=a["hazard"],
                    severity=a["severity"],
                    title=a["title"],
                    warning_message=a["msg"],
                    recommended_actions_json=json.dumps(a["actions"]),
                    affected_district=a["district"],
                    status="published",
                    valid_from=now,
                    valid_to=a["valid_to"],
                    channels_sent_json=json.dumps(["in_app", "push", "sms"])
                )
                db.add(alert)

        # 6. Seed Incidents
        incidents_data = [
            {
                "cid": "SEED-INC-001",
                "hazard": "landslide",
                "title": "Major Rockfall Blocking NH-27 Jorabat Inbound Lane",
                "desc": "Boulders and mud debris slid down the cut slope following 3 hours of continuous rain. Both heavy vehicle lanes choked.",
                "severity": "high",
                "status": "in_progress",
                "lat": 26.1285,
                "lng": 91.8210,
                "district": "Kamrup Metropolitan",
                "village": "Jorabat Border",
                "people": 0,
                "road": "partially_blocked",
                "team": "NHAI & SDRF Quick Clearance Unit"
            },
            {
                "cid": "SEED-INC-002",
                "hazard": "flash_flood",
                "title": "Water Logging & Culvert Inundation at Rukminigaon",
                "desc": "Drainage runoff overflowed street level by 2.5 feet, entering ground floor premises.",
                "severity": "medium",
                "status": "verified",
                "lat": 26.1420,
                "lng": 91.7950,
                "district": "Kamrup Metropolitan",
                "village": "Rukminigaon",
                "people": 45,
                "road": "partially_blocked",
                "team": "Guwahati Municipal Quick Response"
            },
            {
                "cid": "SEED-INC-003",
                "hazard": "slope_failure",
                "title": "Active Subsidence near Gangtok Ward 4",
                "desc": "Cracks of 4 inches observed on retaining wall above residential lane.",
                "severity": "critical",
                "status": "under_review",
                "lat": 27.3310,
                "lng": 98.6180,
                "district": "East Sikkim",
                "village": "Deorali Ridge",
                "people": 25,
                "road": "passable",
                "team": None
            }
        ]

        for inc in incidents_data:
            if not db.query(Incident).filter(Incident.client_id == inc["cid"]).first():
                db_inc = Incident(
                    client_id=inc["cid"],
                    hazard_type=inc["hazard"],
                    title=inc["title"],
                    description=inc["desc"],
                    severity=inc["severity"],
                    status=inc["status"],
                    latitude=inc["lat"],
                    longitude=inc["lng"],
                    district=inc["district"],
                    village=inc["village"],
                    affected_people=inc["people"],
                    road_status=inc["road"],
                    assigned_team=inc["team"]
                )
                db.add(db_inc)

        db.commit()
        print("Successfully seeded NER Disaster System database with realistic prototype data.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
