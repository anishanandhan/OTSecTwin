/**
 * @file sanitize.test.js
 * Unit test suite for frontend input sanitization, HTML escaping, and secret redaction.
 * Target: 100% coverage on src/lib/security/sanitize.js.
 */

import { describe, it, expect } from "vitest";
import { sanitizeInput, escapeHtml, redactSecrets } from "../../src/lib/security/sanitize.js";

describe("sanitizeInput", () => {
  it("passes clean strings through unchanged", () => {
    expect(sanitizeInput("Modbus_L1_PLC")).toBe("Modbus_L1_PLC");
  });

  it("handles null, undefined, and non-string inputs safely", () => {
    expect(sanitizeInput(null)).toBe("");
    expect(sanitizeInput(undefined)).toBe("");
    expect(sanitizeInput(12345)).toBe("12345");
  });

  it("strips ASCII control characters", () => {
    const dirty = "PLC\x00\x08\x1FData";
    expect(sanitizeInput(dirty)).toBe("PLCData");
  });

  it("strips zero-width whitespace characters", () => {
    const dirty = "HMI\u200B\u200C\u200D\uFEFFUnit";
    expect(sanitizeInput(dirty)).toBe("HMIUnit");
  });

  it("strips bidirectional override characters", () => {
    const dirty = "Admin\u202A\u202B\u202EUser";
    expect(sanitizeInput(dirty)).toBe("AdminUser");
  });

  it("trims leading and trailing whitespace", () => {
    expect(sanitizeInput("  192.168.10.10  ")).toBe("192.168.10.10");
  });
});

describe("escapeHtml", () => {
  it("escapes dangerous HTML script tags", () => {
    expect(escapeHtml("<script>alert(1)</script>")).toBe("&lt;script&gt;alert(1)&lt;/script&gt;");
  });

  it("escapes quotes and ampersands", () => {
    expect(escapeHtml('val="test" & type=\'modbus\'')).toBe('val=&quot;test&quot; &amp; type=&#39;modbus&#39;');
  });

  it("handles null and undefined gracefully", () => {
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(undefined)).toBe("");
  });

  it("handles non-string types", () => {
    expect(escapeHtml(42)).toBe("42");
  });
});

describe("redactSecrets", () => {
  it("redacts standard OpenAI API keys", () => {
    const log = "Using key sk-1234567890abcdef1234567890 for AI triage";
    expect(redactSecrets(log)).not.toContain("sk-123456");
    expect(redactSecrets(log)).toContain("[REDACTED_API_KEY]");
  });

  it("redacts HTTP Authorization Bearer tokens", () => {
    const log = "Header Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.secret";
    expect(redactSecrets(log)).not.toContain("eyJhbGci");
    expect(redactSecrets(log)).toContain("[REDACTED_TOKEN]");
  });

  it("redacts email addresses from diagnostics", () => {
    const log = "Notification sent to engineer@plantops.org at 10:00";
    expect(redactSecrets(log)).not.toContain("engineer@plantops.org");
    expect(redactSecrets(log)).toContain("[REDACTED_EMAIL]");
  });

  it("redacts generic secret and password assignments", () => {
    const log = 'Config: password="SuperSecret123" and api_key=xyz987';
    expect(redactSecrets(log)).not.toContain("SuperSecret123");
    expect(redactSecrets(log)).toContain("password=[REDACTED]");
  });

  it("handles empty or non-string inputs", () => {
    expect(redactSecrets("")).toBe("");
    expect(redactSecrets(null)).toBe("");
  });
});
