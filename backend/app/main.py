from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import engine, Base, SessionLocal
from app.api import assets, topology, twin, vulnerabilities, alerts, telemetry, simulator
from app.services.vulnerability_engine import seed_vulnerability_database
from app.services.baseline_engine import seed_baseline_rules
from app.services.simulator import seed_simulated_ot_lab

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create DB tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_vulnerability_database(db)
        seed_baseline_rules(db)
        seed_simulated_ot_lab(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="OTSecTwin API Engine",
    description="OT Asset Intelligence & Threat Detection Platform Backend",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(assets.router)
app.include_router(topology.router)
app.include_router(twin.router)
app.include_router(vulnerabilities.router)
app.include_router(alerts.router)
app.include_router(telemetry.router)
app.include_router(simulator.router)

@app.get("/health")
def health_check():
    return {"status": "HEALTHY", "platform": "OTSecTwin Engine v1.0.0"}
