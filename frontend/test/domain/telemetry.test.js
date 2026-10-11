/**
 * @file telemetry.test.js
 * Domain logic tests for physical plant bounds, risk calculation, and Modbus telemetry formulas.
 */

import { describe, it, expect } from "vitest";

describe("Industrial Fluid Dynamics & Telemetry Verification", () => {
  // Mass balance ODE discrete approximation: V(t+1) = V(t) + (Q_in - Q_out) * dt
  function computeNextVolume(currentVol, qIn, qOut, dt) {
    const next = currentVol + (qIn - qOut) * dt;
    return Math.max(0, Math.min(100, next));
  }

  it("accurately computes fluid accumulation under positive inflow balance", () => {
    const next = computeNextVolume(68.0, 80.0, 40.0, 0.1);
    expect(next).toBe(72.0);
  });

  it("clamps volume between 0.0 and 100.0 percent capacity", () => {
    const overfill = computeNextVolume(98.0, 100.0, 0.0, 1.0);
    expect(overfill).toBe(100.0);

    const drained = computeNextVolume(2.0, 0.0, 50.0, 1.0);
    expect(drained).toBe(0.0);
  });

  it("detects critical alarm threshold when tank level exceeds 90%", () => {
    function evaluateAlarm(level, pressure, ph) {
      if (level > 90.0) return "CRITICAL_OVERFLOW";
      if (pressure > 5.0) return "CRITICAL_OVERPRESSURE";
      if (ph < 5.5) return "CRITICAL_ACIDIC";
      return "NOMINAL";
    }

    expect(evaluateAlarm(68.5, 3.2, 7.2)).toBe("NOMINAL");
    expect(evaluateAlarm(94.2, 3.2, 7.2)).toBe("CRITICAL_OVERFLOW");
    expect(evaluateAlarm(70.0, 5.8, 7.2)).toBe("CRITICAL_OVERPRESSURE");
    expect(evaluateAlarm(70.0, 3.2, 3.1)).toBe("CRITICAL_ACIDIC");
  });
});
