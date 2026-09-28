from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List

class SatelliteAdapter:
    """
    Adapter for Satellite Earth Observation data (Sentinel-1 InSAR surface deformation, Sentinel-2 optical NDVI & soil moisture).
    Transparently reports satellite acquisition dates, sensor models, and sample layers.
    """
    @classmethod
    def get_latest_observations(cls, district: str) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        sar_pass_date = (now - timedelta(days=2)).strftime("%Y-%m-%d")
        optical_pass_date = (now - timedelta(days=4)).strftime("%Y-%m-%d")

        return {
            "district": district,
            "sar_platform": "Sentinel-1 C-SAR (Synthetic Aperture Radar)",
            "sar_last_acquisition": sar_pass_date,
            "insar_coherence": 0.82,
            "estimated_slope_displacement_mm_yr": -12.4, # Negative indicates subsidence/downward movement
            "optical_platform": "Sentinel-2 MSI",
            "optical_last_acquisition": optical_pass_date,
            "cloud_cover_pct": 24.5,
            "normalized_moisture_index": 0.74,
            "data_source": "European Space Agency (ESA) Copernicus Sentinel Open Access Hub (Simulated Gateway)",
            "is_demo": True,
            "disclaimer": "Sample satellite layer metadata for demonstration. Real-time InSAR requires interferometric processing pipeline."
        }
