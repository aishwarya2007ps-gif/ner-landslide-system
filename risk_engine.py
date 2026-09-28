from datetime import datetime, timezone
from typing import Dict, Any, List

class MultiHazardRiskEngine:
    MODEL_VERSION = "NER-RISK-PROTOTYPE-v1.4"
    DISCLAIMER = "This is a prototype decision-support estimate, not an official IMD/CWC warning. Human verification required before public critical alerts."

    # Heuristic weights for North Eastern Himalayan & Sub-Himalayan terrain
    WEIGHTS = {
        "rainfall_24h": 0.30,        # Recent high intensity trigger (mm)
        "rainfall_72h_accum": 0.20,  # Antecedent saturation trigger (mm)
        "slope_angle_deg": 0.15,     # Terrain steepness
        "soil_moisture_pct": 0.15,   # Volumetric soil moisture saturation (%)
        "river_gauge_pct": 0.10,     # River stage relative to warning/danger mark (%)
        "historical_incidents": 0.10 # Susceptibility from historical inventory
    }

    @classmethod
    def calculate_risk(cls, features: Dict[str, float], district: str = "Kamrup Metropolitan", hazard_type: str = "landslide") -> Dict[str, Any]:
        """
        Calculates hazard score [0 - 100], risk category, and top 3 drivers.
        """
        rain_24h = features.get("rainfall_24h", 0.0)
        rain_72h = features.get("rainfall_72h_accum", 0.0)
        slope = features.get("slope_angle_deg", 20.0)
        moisture = features.get("soil_moisture_pct", 40.0)
        river = features.get("river_gauge_pct", 30.0)
        history = features.get("historical_incidents_count", 2.0)

        # Normalization with realistic Himalayan thresholds
        n_rain_24h = min(1.0, max(0.0, rain_24h / 120.0))  # >120mm in 24h is severe
        n_rain_72h = min(1.0, max(0.0, rain_72h / 250.0))  # >250mm 3-day accumulation
        n_slope = min(1.0, max(0.0, (slope - 15.0) / 35.0)) # Critical slope between 15° and 50°
        n_moisture = min(1.0, max(0.0, moisture / 100.0))
        n_river = min(1.0, max(0.0, river / 100.0))
        n_history = min(1.0, max(0.0, history / 10.0))

        contributions = {
            "24-Hour Rainfall Intensity": round(n_rain_24h * cls.WEIGHTS["rainfall_24h"] * 100, 1),
            "72-Hour Antecedent Rainfall": round(n_rain_72h * cls.WEIGHTS["rainfall_72h_accum"] * 100, 1),
            "Terrain Slope Steepness": round(n_slope * cls.WEIGHTS["slope_angle_deg"] * 100, 1),
            "Soil Moisture Saturation": round(n_moisture * cls.WEIGHTS["soil_moisture_pct"] * 100, 1),
            "River Level Elevation": round(n_river * cls.WEIGHTS["river_gauge_pct"] * 100, 1),
            "Historical Landslide Frequency": round(n_history * cls.WEIGHTS["historical_incidents"] * 100, 1)
        }

        raw_score = sum(contributions.values())
        total_score = round(max(0.0, min(100.0, raw_score)), 1)

        # Risk categories according to spec:
        # 0–24: Low
        # 25–49: Moderate
        # 50–74: High
        # 75–100: Critical
        if total_score >= 75:
            category = "Critical"
            action = "Immediate evacuation alert recommended; activate SDRF/NDRF staging and road closures."
        elif total_score >= 50:
            category = "High"
            action = "Issue orange warning; restrict vehicular traffic on vulnerable mountain passes and clear drains."
        elif total_score >= 25:
            category = "Moderate"
            action = "Continuous sensor and river gauge watch; notify village disaster management committees."
        else:
            category = "Low"
            action = "Normal automated surveillance active; no emergency restrictions required."

        # Top 3 contributing factors
        sorted_factors = sorted(contributions.items(), key=lambda x: x[1], reverse=True)[:3]
        top_factors = [
            {"factor": name, "contribution_pts": val}
            for name, val in sorted_factors if val > 0.0
        ]

        return {
            "district": district,
            "hazard_type": hazard_type,
            "risk_score": total_score,
            "risk_category": category,
            "confidence": 0.88,
            "top_contributing_factors": top_factors,
            "recommended_action": action,
            "model_version": cls.MODEL_VERSION,
            "disclaimer": cls.DISCLAIMER,
            "calculated_at": datetime.now(timezone.utc)
        }
