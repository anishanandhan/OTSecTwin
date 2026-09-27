import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
SAMPLE_PCAP_DIR = os.path.join(DATA_DIR, "sample_pcap")
ZEEK_LOGS_DIR = os.path.join(DATA_DIR, "zeek_logs")
DATABASE_URL = f"sqlite:///{os.path.join(DATA_DIR, 'otsectwin.db')}"

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(SAMPLE_PCAP_DIR, exist_ok=True)
os.makedirs(ZEEK_LOGS_DIR, exist_ok=True)
