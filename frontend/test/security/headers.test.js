/**
 * @file headers.test.js
 * Unit test suite for frontend HTTP security headers configuration.
 * Target: 100% coverage on src/lib/security/headers.js.
 */

import { describe, it, expect } from "vitest";
import { SECURITY_HEADERS, getSecurityHeadersArray } from "../../src/lib/security/headers.js";

describe("SECURITY_HEADERS Policy", () => {
  it("contains all mandatory high-priority defense headers", () => {
    const requiredHeaders = [
      "Content-Security-Policy",
      "Strict-Transport-Security",
      "X-Frame-Options",
      "X-Content-Type-Options",
      "Referrer-Policy",
      "Permissions-Policy",
    ];

    for (const header of requiredHeaders) {
      expect(SECURITY_HEADERS).toHaveProperty(header);
      expect(SECURITY_HEADERS[header].length).toBeGreaterThan(0);
    }
  });

  it("enforces strict frame-ancestors none in CSP and X-Frame-Options DENY", () => {
    expect(SECURITY_HEADERS["X-Frame-Options"]).toBe("DENY");
    expect(SECURITY_HEADERS["Content-Security-Policy"]).toContain("frame-ancestors 'none'");
  });

  it("enforces 1-year HSTS with preload directive", () => {
    const hsts = SECURITY_HEADERS["Strict-Transport-Security"];
    expect(hsts).toContain("max-age=31536000");
    expect(hsts).toContain("includeSubDomains");
    expect(hsts).toContain("preload");
  });

  it("nosniff is configured for MIME type security", () => {
    expect(SECURITY_HEADERS["X-Content-Type-Options"]).toBe("nosniff");
  });

  it("getSecurityHeadersArray returns correct key-value tuples", () => {
    const tuples = getSecurityHeadersArray();
    expect(Array.isArray(tuples)).toBe(true);
    expect(tuples.length).toBe(Object.keys(SECURITY_HEADERS).length);

    for (const [key, value] of tuples) {
      expect(typeof key).toBe("string");
      expect(typeof value).toBe("string");
      expect(value.length).toBeGreaterThan(0);
    }
  });
});
