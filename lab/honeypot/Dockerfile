FROM python:3.11-slim

WORKDIR /app

RUN pip install --no-cache-dir pymodbus>=3.6.8

COPY honey_plc.py .

EXPOSE 502

CMD ["python", "honey_plc.py"]
