"""
Unit tests for backend input sanitization and secret redaction.
Target: 100% coverage on app/security/sanitize.py.
"""

from app.security.sanitize import sanitize_input, escape_html, redact_secrets


class TestSanitizeInput:
    def test_normal_string_remains_unchanged(self):
        assert sanitize_input("Modbus_PLC_001") == "Modbus_PLC_001"

    def test_handles_none_and_empty(self):
        assert sanitize_input(None) == ""
        assert sanitize_input("") == ""

    def test_handles_non_string_types(self):
        assert sanitize_input(12345) == "12345"
        assert sanitize_input(True) == "True"

    def test_strips_control_characters(self):
        dirty = "PLC\x00\x07\x1FData"
        assert sanitize_input(dirty) == "PLCData"

    def test_strips_zero_width_characters(self):
        dirty = "HMI\u200B\u200C\u200D\uFEFFUnit"
        assert sanitize_input(dirty) == "HMIUnit"

    def test_strips_bidirectional_override_characters(self):
        dirty = "Admin\u202A\u202B\u202EUser"
        assert sanitize_input(dirty) == "AdminUser"

    def test_trims_whitespace(self):
        assert sanitize_input("   192.168.10.10   ") == "192.168.10.10"


class TestEscapeHtml:
    def test_escapes_html_tags(self):
        assert escape_html("<script>alert(1)</script>") == "&lt;script&gt;alert(1)&lt;/script&gt;"

    def test_escapes_quotes_and_ampersand(self):
        assert escape_html('val="test" & type=\'modbus\'') == 'val=&quot;test&quot; &amp; type=&#39;modbus&#39;'

    def test_handles_none_and_empty(self):
        assert escape_html(None) == ""
        assert escape_html("") == ""

    def test_escapes_non_string_types(self):
        assert escape_html(12345) == "12345"

    def test_normal_string_untouched(self):
        assert escape_html("Tank_Level_Nominal") == "Tank_Level_Nominal"


class TestRedactSecrets:
    def test_redacts_openai_api_keys(self):
        raw = "Using key sk-abcdef1234567890abcdef1234567890 for AI query"
        redacted = redact_secrets(raw)
        assert "sk-abcdef" not in redacted
        assert "[REDACTED_API_KEY]" in redacted

    def test_redacts_bearer_tokens(self):
        raw = "Header Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xyz"
        redacted = redact_secrets(raw)
        assert "eyJhbGci" not in redacted
        assert "[REDACTED_TOKEN]" in redacted

    def test_redacts_email_addresses(self):
        raw = "Alert sent to operator.john@waterfacility.org at 10:00"
        redacted = redact_secrets(raw)
        assert "operator.john" not in redacted
        assert "[REDACTED_EMAIL]" in redacted

    def test_redacts_password_assignments(self):
        raw = 'Config: password="SuperSecretPassword123" and api_key=xyz987'
        redacted = redact_secrets(raw)
        assert "SuperSecretPassword123" not in redacted
        assert "password=[REDACTED]" in redacted

    def test_handles_none_and_empty(self):
        assert redact_secrets(None) == ""
        assert redact_secrets("") == ""
