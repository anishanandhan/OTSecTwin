import os
import logging
from pymodbus.server import StartTcpServer
from pymodbus.datastore import ModbusSequentialDataBlock, ModbusSlaveContext, ModbusServerContext

logging.basicConfig(level=logging.INFO, format='%(asctime)s [HONEYPOT-DECOY] %(levelname)s: %(message)s')
logger = logging.getLogger("HoneyPLC")

DECOY_NAME = os.getenv("DECOY_NAME", "Decoy-Siemens-S7-PLC")
BIND_IP = os.getenv("BIND_IP", "0.0.0.0")
PORT = int(os.getenv("PORT", "502"))

def run_honeypot():
    logger.warning(f"🍯 [TRIPWIRE ACTIVE] Starting {DECOY_NAME} on {BIND_IP}:{PORT}...")
    logger.warning("Any incoming connections or read/write requests to this IP represent unauthorized lateral movement or scanning!")
    
    # Fake holding registers resembling an industrial turbine controller
    hr_block = ModbusSequentialDataBlock(1, [3000, 1500, 750, 420, 100] + [0]*95)
    coils_block = ModbusSequentialDataBlock(1, [1, 0, 1, 0] + [0]*96)
    
    slave = ModbusSlaveContext(
        di=coils_block,
        co=coils_block,
        hr=hr_block,
        ir=hr_block,
        zero_mode=True
    )
    context = ModbusServerContext(slaves=slave, single=True)
    StartTcpServer(context=context, address=(BIND_IP, PORT))

if __name__ == "__main__":
    run_honeypot()
