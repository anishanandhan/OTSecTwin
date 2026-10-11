FROM python:3.11-slim

WORKDIR /app

RUN pip install --no-cache-dir pymodbus>=3.6.8

COPY plc_server.py .

EXPOSE 502

CMD ["python", "plc_server.py"]
