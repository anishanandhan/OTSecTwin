import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
SAMPLE_PCAP_DIR = os.path.join(DATA_DIR, "sample_pcap")
ZEEK_LOGS_DIR = os.path.join(DATA_DIR, "zeek_logs")
DATABASE_URL = f"sqlite:///{os.path.join(DATA_DIR, 'otsectwin.db')}"

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(SAMPLE_PCAP_DIR, exist_ok=True)
os.makedirs(ZEEK_LOGS_DIR, exist_ok=True)
# Load environment variables from .env file if present
try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(BASE_DIR, ".env"))
    load_dotenv(os.path.join(os.path.dirname(BASE_DIR), ".env"))
except ImportError:
    pass

def _load_env_file():
    env_paths = [
        os.path.join(BASE_DIR, ".env"),
        os.path.join(os.path.dirname(BASE_DIR), ".env")
    ]
    for env_path in env_paths:
        if os.path.exists(env_path):
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            k = k.strip()
                            v = v.strip().strip('"').strip("'")
                            if k and k not in os.environ:
                                os.environ[k] = v
            except Exception:
                pass

_load_env_file()

# RouterPlus LLM Engine Config (Strictly read from environment)
ROUTERPLUS_API_KEY = os.getenv("ROUTERPLUS_API_KEY")
ROUTERPLUS_ORG_ID = os.getenv("ROUTERPLUS_ORG_ID")
ROUTERPLUS_BASE_URL = os.getenv("ROUTERPLUS_BASE_URL", "https://api.routerplus.com/v1")
ROUTERPLUS_MODEL = os.getenv("ROUTERPLUS_MODEL", "gpt-4.1-mini")
