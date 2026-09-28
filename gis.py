from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any, List
import json

from app.database.session import get_db
from app.database.models import District, CriticalFacility

router = APIRouter()

@router.get("/districts")
def get_districts(db: Session = Depends(get_db)):
    districts = db.query(District).all()
    features = []
    for d in districts:
        geom = json.loads(d.boundary_geojson) if d.boundary_geojson else None
        features.append({
            "type": "Feature",
            "properties": {
                "id": d.id,
                "name": d.name,
                "state": d.state,
                "headquarters": d.headquarters,
                "risk_level": d.risk_level,
                "population": d.population
            },
            "geometry": geom
        })
    return {
        "type": "FeatureCollection",
        "features": features
    }

@router.get("/shelters")
def get_shelters(db: Session = Depends(get_db)):
    shelters = db.query(CriticalFacility).filter(CriticalFacility.facility_type == "shelter").all()
    features = []
    for s in shelters:
        features.append({
            "type": "Feature",
            "properties": {
                "id": s.id,
                "name": s.name,
                "district": s.district_name,
                "capacity": s.capacity,
                "contact_phone": s.contact_phone,
                "facility_type": "shelter"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [s.longitude, s.latitude]
            }
        })
    return {
        "type": "FeatureCollection",
        "features": features
    }

@router.get("/hospitals")
def get_hospitals(db: Session = Depends(get_db)):
    hospitals = db.query(CriticalFacility).filter(CriticalFacility.facility_type == "hospital").all()
    features = []
    for h in hospitals:
        features.append({
            "type": "Feature",
            "properties": {
                "id": h.id,
                "name": h.name,
                "district": h.district_name,
                "capacity": h.capacity,
                "contact_phone": h.contact_phone,
                "facility_type": "hospital"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [h.longitude, h.latitude]
            }
        })
    return {
        "type": "FeatureCollection",
        "features": features
    }

@router.get("/evacuation-routes")
def get_evacuation_routes():
    """
    Returns primary mountain corridors and bypass evacuation routes in NER.
    """
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "route_name": "NH-27 Guwahati-Sonapur Emergency Evacuation Bypass",
                    "status": "clear",
                    "elevation_range_m": "55 - 240",
                    "priority": "Primary Lifeline"
                },
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [91.736, 26.144], [91.820, 26.120], [91.950, 26.110]
                    ]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "route_name": "NH-10 Rangpo to Gangtok Highway Lifeline",
                    "status": "caution_single_lane",
                    "elevation_range_m": "350 - 1650",
                    "priority": "Critical Corridor"
                },
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [98.530, 27.180], [98.590, 27.260], [98.613, 27.338]
                    ]
                }
            }
        ]
    }
