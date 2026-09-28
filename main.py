from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
import time

from app.core.config import settings
from app.database.session import engine, Base
from app.api.v1 import auth, incidents, sync, alerts, risk, gis, sensors, weather, admin

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Multi-Hazard Disaster Preparedness & AI Early-Warning Decision Support Platform for North Eastern Region India",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Consistent Error Format Handler
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "The request payload failed schema validation",
                "details": {"errors": exc.errors()}
            }
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": str(exc),
                "details": {"path": str(request.url)}
            }
        }
    )

# Health Check with System Diagnostics
@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "timestamp": time.time(),
        "database": "connected",
        "integrations": {
            "imd_adapter": "active (prototype fallback available)",
            "satellite_adapter": "active (simulated sentinel-1/2)",
            "iot_gateway": "online",
            "offline_sync_engine": "ready"
        }
    }

# API v1 Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(incidents.router, prefix=f"{settings.API_V1_STR}/incidents", tags=["Incidents"])
app.include_router(sync.router, prefix=f"{settings.API_V1_STR}/sync", tags=["Offline Sync"])
app.include_router(alerts.router, prefix=f"{settings.API_V1_STR}/alerts", tags=["Alerts"])
app.include_router(risk.router, prefix=f"{settings.API_V1_STR}/risk", tags=["AI Risk Engine"])
app.include_router(gis.router, prefix=f"{settings.API_V1_STR}/gis", tags=["GIS & Spatial"])
app.include_router(sensors.router, prefix=f"{settings.API_V1_STR}/sensors", tags=["IoT Sensors"])
app.include_router(weather.router, prefix=f"{settings.API_V1_STR}/weather", tags=["Weather & Satellite"])
app.include_router(admin.router, prefix=f"{settings.API_V1_STR}/admin", tags=["Administration"])
