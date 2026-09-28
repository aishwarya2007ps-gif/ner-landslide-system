from fastapi import APIRouter
from app.adapters.imd_adapter import IMDWeatherAdapter
from app.adapters.satellite_adapter import SatelliteAdapter

router = APIRouter()

@router.get("/district")
async def get_district_weather(district: str = "Kamrup Metropolitan"):
    weather = await IMDWeatherAdapter.get_district_weather(district)
    return weather

@router.get("/satellite")
def get_district_satellite(district: str = "Kamrup Metropolitan"):
    sat = SatelliteAdapter.get_latest_observations(district)
    return sat
