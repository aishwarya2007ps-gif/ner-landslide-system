from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Based early warning and landslide Risk Monitoring System in NER"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "ner_super_secret_jwt_key_prototype_2026_disaster_system"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # Database
    DATABASE_URL: str = "sqlite:///./ner_disaster.db"

    # External APIs / Fallbacks
    IMD_API_BASE_URL: str = "https://api.imd.gov.in/v1/forecast"
    IMD_API_TOKEN: str = ""
    SATELLITE_PROVIDER_URL: str = "https://sentinel.esa.int/api/v1"
    SMS_PROVIDER: str = "mock"
    SMS_API_KEY: str = ""
    EMAIL_PROVIDER: str = "mock"
    EMAIL_API_KEY: str = ""

    # GIS Map configuration
    MAP_TILE_URL: str = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    MAP_ATTRIBUTION: str = "&copy; OpenStreetMap contributors"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
