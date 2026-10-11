"""
Unit tests for Modbus packet creation, plant physical simulation logic, and function code mappings.
"""

from app.services.simulator import MODBUS_FUNCTIONS, create_modbus_tcp_frame, get_plant_state, update_plant_control


class TestModbusProtocolStructures:
    def test_modbus_function_definitions(self):
        assert "FC01" in MODBUS_FUNCTIONS
        assert "FC03" in MODBUS_FUNCTIONS
        assert "FC05" in MODBUS_FUNCTIONS
        assert "FC06" in MODBUS_FUNCTIONS

        fc03_num, fc03_name = MODBUS_FUNCTIONS["FC03"]
        assert fc03_num == 3
        assert fc03_name == "Read Holding Registers"

        fc06_num, fc06_name = MODBUS_FUNCTIONS["FC06"]
        assert fc06_num == 6
        assert fc06_name == "Write Single Register"

    def test_create_modbus_tcp_frame_binary_structure(self):
        unit_id = 1
        fc_num = 3
        reg_addr = 40001
        reg_val = 68

        frame = create_modbus_tcp_frame(unit_id, fc_num, reg_addr, reg_val)
        assert isinstance(frame, bytes)
        # MBAP Header is 6 bytes + Unit ID (1 byte) + PDU (5 bytes) = 12 bytes
        assert len(frame) == 12

    def test_plant_state_structure_and_limits(self):
        state = get_plant_state()
        assert isinstance(state, dict)
        assert "tank_level" in state
        assert "pump_status" in state
        assert "chemical_ph" in state
        assert "modbus_registers" in state

        # Industrial physics sanity bounds
        assert 0.0 <= state["tank_level"] <= 100.0
        assert 0.0 <= state["chemical_ph"] <= 14.0
        assert state["pump_status"] in ["RUNNING", "STOPPED"]

    def test_update_plant_control_setpoints(self):
        updated = update_plant_control({"pump_status": "STOPPED", "inflow_valve": "CLOSED"})
        assert updated["pump_status"] == "STOPPED"
        assert updated["inflow_valve"] == "CLOSED"

        # Restore
        restored = update_plant_control({"pump_status": "RUNNING", "inflow_valve": "OPEN"})
        assert restored["pump_status"] == "RUNNING"
        assert restored["inflow_valve"] == "OPEN"
