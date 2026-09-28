from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import json

from app.database.session import get_db
from app.database.models import RiskAssessment
from app.schemas.risk import RiskPredictionInput, RiskPredictionOutput
from app.services.risk_engine import MultiHazardRiskEngine

router = APIRouter()

@router.post("/predict", response_model=RiskPredictionOutput)
def predict_risk(input_data: RiskPredictionInput, db: Session = Depends(get_db)):
    features = {
        "rainfall_24h": input_data.rainfall_24h,
        "rainfall_72h_accum": input_data.rainfall_72h_accum,
        "slope_angle_deg": input_data.slope_angle_deg,
        "soil_moisture_pct": input_data.soil_moisture_pct,
        "river_gauge_pct": input_data.river_gauge_pct,
        "historical_incidents_count": input_data.historical_incidents_count
    }

    result = MultiHazardRiskEngine.calculate_risk(features, district=input_data.district)

    # Persist assessment record
    record = RiskAssessment(
        district=result["district"],
        risk_score=result["risk_score"],
        risk_category=result["risk_category"],
        hazard_type=result["hazard_type"],
        top_factors_json=json.dumps(result["top_contributing_factors"]),
        recommended_action=result["recommended_action"],
        model_version=result["model_version"],
        calculated_at=result["calculated_at"]
    )
    db.add(record)
    db.commit()

    return RiskPredictionOutput(**result)

@router.get("/areas")
def get_risk_areas():
    """
    Returns spatial vulnerability zones for NER districts.
    """
    return {
        "disclaimer": "Sample prototype risk polygons for North Eastern Region of India.",
        "areas": [
            {
                "id": "NER-ZONE-01",
                "name": "Guwahati Red Hill & Naranarayan Slope Escarpment",
                "district": "Kamrup Metropolitan",
                "state": "Assam",
                "risk_category": "Critical",
                "risk_score": 79.4,
                "hazard_type": "landslide",
                "coordinates": [
                    [26.18, 91.70], [26.22, 91.75], [26.19, 91.80], [26.15, 91.74]
                ]
            },
            {
                "id": "NER-ZONE-02",
                "name": "Cherrapunji - Shella Ridge Drainage Line",
                "district": "East Khasi Hills",
                "state": "Meghalaya",
                "risk_category": "High",
                "risk_score": 68.2,
                "hazard_type": "flash_flood",
                "coordinates": [
                    [25.25, 91.68], [25.32, 91.75], [25.28, 91.82], [25.20, 91.72]
                ]
            },
            {
                "id": "NER-ZONE-03",
                "name": "NH-10 Teesta Valley Active Slide Corridor",
                "district": "East Sikkim",
                "state": "Sikkim",
                "risk_category": "Critical",
                "risk_score": 84.1,
                "hazard_type": "slope_failure",
                "coordinates": [
                    [27.30, 98.58], [27.35, 98.65], [27.32, 98.70], [27.28, 98.61]
                ]
            },
            {
                "id": "NER-ZONE-04",
                "name": "Dikrong River Surge Floodplain",
                "district": "Papum Pare",
                "state": "Arunachal Pradesh",
                "risk_category": "Warning",
                "risk_score": 44.5,
                "hazard_type": "river_level_rise",
                "coordinates": [
                    [27.05, 93.58], [27.15, 93.68], [27.08, 93.75], [26.98, 93.62]
                ]
            }
        ]
    }

@router.get("/history")
def get_risk_history(district: str = "Kamrup Metropolitan", db: Session = Depends(get_db)):
    assessments = db.query(RiskAssessment).filter(RiskAssessment.district == district).order_by(RiskAssessment.calculated_at.desc()).limit(20).all()
    results = []
    for a in assessments:
        results.append({
            "id": a.id,
            "district": a.district,
            "risk_score": a.risk_score,
            "risk_category": a.risk_category,
            "top_factors": json.loads(a.top_factors_json or "[]"),
            "recommended_action": a.recommended_action,
            "calculated_at": a.calculated_at
        })
    return results

@router.get("/explanations")
def get_risk_explanations():
    return {
        "model_version": MultiHazardRiskEngine.MODEL_VERSION,
        "weights": MultiHazardRiskEngine.WEIGHTS,
        "disclaimer": MultiHazardRiskEngine.DISCLAIMER,
        "category_ranges": {
            "Low": "0 - 24 (Routine surveillance)",
            "Moderate": "25 - 49 (Notice to local mitigation teams)",
            "High": "50 - 74 (Traffic caution & slope monitoring)",
            "Critical": "75 - 100 (Immediate evacuation & emergency response mobilization)"
        }
    }
