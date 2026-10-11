FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y nmap curl iputils-ping && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir pymodbus>=3.6.8 scapy>=2.5.0

COPY attack_toolkit.py .

CMD ["python", "attack_toolkit.py"]
