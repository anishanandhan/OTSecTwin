from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import engine, Base, SessionLocal, run_sqlite_migrations
from app.api import assets, topology, twin, vulnerabilities, alerts, telemetry, simulator, ai
from app.services.vulnerability_engine import seed_vulnerability_database
from app.services.baseline_engine import seed_baseline_rules
from app.services.simulator import seed_simulated_ot_lab
from app.security.headers import SecurityHeadersMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create DB tables
    Base.metadata.create_all(bind=engine)
    run_sqlite_migrations()
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

# Security Headers & CORS Middleware setup
app.add_middleware(SecurityHeadersMiddleware)
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
app.include_router(ai.router)

@app.get("/health")
def health_check():
    return {"status": "HEALTHY", "platform": "OTSecTwin Engine v1.0.0"}

# Static Frontend SPA Serving (Cloud Run unified container)
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

dist_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dist")
if os.path.exists(dist_dir):
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="static-assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        target_file = os.path.join(dist_dir, full_path)
        if full_path and os.path.isfile(target_file):
            return FileResponse(target_file)
        return FileResponse(os.path.join(dist_dir, "index.html"))
