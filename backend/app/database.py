from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import DATABASE_URL

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def run_sqlite_migrations():
    """
    Ensures existing SQLite databases are updated with new AssetModel columns
    without data loss or OperationalErrors.
    """
    try:
        with engine.connect() as conn:
            # Check if assets table exists
            res = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='assets';")).fetchone()
            if not res:
                return
            
            columns_info = conn.execute(text("PRAGMA table_info(assets);")).fetchall()
            existing_cols = {row[1] for row in columns_info}
            
            migrations = {
                "fingerprint_method": "VARCHAR DEFAULT 'Passive Modbus Telemetry'",
                "confidence_score": "FLOAT DEFAULT 95.0",
                "os_signature": "VARCHAR DEFAULT 'Embedded Controller OS'",
                "hardware_modules": "TEXT DEFAULT '[]'",
                "config_hash": "VARCHAR",
                "drift_detected": "BOOLEAN DEFAULT 0",
                "last_drift_timestamp": "DATETIME",
            }
            
            for col_name, col_sql in migrations.items():
                if col_name not in existing_cols:
                    conn.execute(text(f"ALTER TABLE assets ADD COLUMN {col_name} {col_sql};"))
            conn.commit()
    except Exception as exc:
        print(f"[DB Migration Warning] {exc}")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

