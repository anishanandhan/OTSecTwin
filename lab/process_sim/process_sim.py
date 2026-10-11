import time
import os
import logging
from pymodbus.client import ModbusTcpClient

logging.basicConfig(level=logging.INFO, format='%(asctime)s [PROCESS-SIM] %(levelname)s: %(message)s')
logger = logging.getLogger("ProcessSimulation")

PLC1_HOST = os.getenv("PLC1_HOST", "192.168.10.10")
PLC2_HOST = os.getenv("PLC2_HOST", "192.168.10.12")
PORT = int(os.getenv("PORT", "502"))

def run_simulation_loop():
    logger.info(f"Connecting to PLC-1 ({PLC1_HOST}:{PORT}) and PLC-2 ({PLC2_HOST}:{PORT})...")
    
    # Wait for PLCs to boot
    time.sleep(3)
    client1 = ModbusTcpClient(PLC1_HOST, port=PORT)
    client2 = ModbusTcpClient(PLC2_HOST, port=PORT)

    tank_level = 50.0  # Percentage 0-100%
    ph_level = 7.2     # Neutral pH
    
    while True:
        try:
            if not client1.connected:
                client1.connect()
            if not client2.connected:
                client2.connect()

            # --- PLC 1: Water Tank Level Dynamics ---
            # Read Coils: Coil 1 = Pump Run/Stop, Coil 2 = Inlet Valve, Coil 3 = Outlet Valve
            coils = client1.read_coils(address=1, count=4)
            pump_running = coils.bits[0] if coils and not coils.isError() else True
            inlet_open = coils.bits[1] if coils and not coils.isError() else True
            outlet_open = coils.bits[2] if coils and not coils.isError() else True
            
            # Physics Calculation
            inflow = 1.5 if (pump_running and inlet_open) else 0.0
            outflow = 1.0 if outlet_open else 0.0
            
            tank_level = max(0.0, min(100.0, tank_level + inflow - outflow))
            
            # Write updated level back to Holding Register 40001 (address 1)
            client1.write_register(address=1, value=int(tank_level))
            
            # Auto-trip safety coil 4 if tank level overflows (> 95%)
            if tank_level >= 95.0:
                logger.warning(f"HIGH WATER LEVEL ALARM: {tank_level:.1f}%. Tripping emergency shutoff coil!")
                client1.write_coil(address=4, value=True)
            elif tank_level < 85.0:
                client1.write_coil(address=4, value=False)
            
            # --- PLC 2: Chemical Dosing Dynamics ---
            # Adjust pH based on dosing pump coil
            c2_coils = client2.read_coils(address=1, count=2)
            dosing_active = c2_coils.bits[0] if c2_coils and not c2_coils.isError() else False
            
            if dosing_active:
                ph_level = max(6.0, ph_level - 0.05)
            else:
                ph_level = min(7.4, ph_level + 0.02)
                
            client2.write_register(address=1, value=int(ph_level * 10)) # e.g. 72 for 7.2 pH

            logger.info(f"Process Tick -> Tank Level: {tank_level:.1f}%, Pump: {pump_running}, pH: {ph_level:.2f}")

        except Exception as e:
            logger.error(f"Simulation cycle error: {e}")

        time.sleep(1.0)

if __name__ == "__main__":
    run_simulation_loop()
