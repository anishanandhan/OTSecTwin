import os
import sys
import logging
from pymodbus.server import StartTcpServer
from pymodbus.datastore import ModbusSequentialDataBlock, ModbusSlaveContext, ModbusServerContext

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(name)s: %(message)s')
logger = logging.getLogger("ModbusPLC")

PLC_NAME = os.getenv("PLC_NAME", "PLC-001-WaterTank")
BIND_IP = os.getenv("BIND_IP", "0.0.0.0")
PORT = int(os.getenv("PORT", "502"))

def run_plc():
    logger.info(f"Starting {PLC_NAME} on {BIND_IP}:{PORT}...")
    
    # Holding Registers (FC03/FC06/FC16):
    # 40001: Tank Level (0-100%)
    # 40002: Inflow Rate (L/min)
    # 40003: Outflow Rate (L/min)
    # 40004: Tank Temperature (°C)
    # 40005: Pressure (PSI)
    hr_block = ModbusSequentialDataBlock(1, [50, 15, 12, 24, 45] + [0]*95)
    
    # Coils (FC01/FC05/FC15):
    # 00001: Pump 1 Run/Stop (1=RUN, 0=STOP)
    # 00002: Inlet Valve Open/Close (1=OPEN, 0=CLOSED)
    # 00003: Outlet Valve Open/Close (1=OPEN, 0=CLOSED)
    # 00004: Emergency Cutoff Trip (1=TRIPPED, 0=NORMAL)
    coils_block = ModbusSequentialDataBlock(1, [1, 1, 1, 0] + [0]*96)
    
    # Discrete Inputs (FC02)
    di_block = ModbusSequentialDataBlock(1, [1, 0, 1, 0] + [0]*96)
    
    # Input Registers (FC04)
    ir_block = ModbusSequentialDataBlock(1, [1013, 220, 50, 1] + [0]*96)
    
    slave = ModbusSlaveContext(
        di=di_block,
        co=coils_block,
        hr=hr_block,
        ir=ir_block,
        zero_mode=True
    )
    context = ModbusServerContext(slaves=slave, single=True)
    
    logger.info(f"{PLC_NAME} ready. Registers initialized.")
    StartTcpServer(context=context, address=(BIND_IP, PORT))

if __name__ == "__main__":
    run_plc()
