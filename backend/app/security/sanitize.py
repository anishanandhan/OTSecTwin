"""
Security module for sanitizing raw input, escaping HTML entities, and redacting credentials.
"""

import re
import unicodedata
from typing import Optional


def sanitize_input(raw: Optional[str]) -> str:
    """
    Strips non-printable control characters, zero-width spaces, and bidirectional
    override characters. Applies Unicode NFC normalization.

    Args:
        raw: The raw input string from client requests or external telemetry.

    Returns:
        Cleaned, normalized string safe for database storage and logging.
    """
    if raw is None:
        return ""
    if not isinstance(raw, str):
        raw = str(raw)

    # Unicode NFC Normalization
    normalized = unicodedata.normalize("NFC", raw)

    # Remove zero-width characters (U+200B - U+200D, U+FEFF, U+2060)
    normalized = re.sub(r"[\u200B-\u200D\uFEFF\u2060]", "", normalized)

    # Remove bidirectional override characters (U+202A - U+202E, U+2066 - U+2069)
    normalized = re.sub(r"[\u202A-\u202E\u2066-\u2069]", "", normalized)

    # Remove non-printable control characters (0x00 to 0x1F except tab and newline), and 0x7F
    normalized = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "", normalized)

    return normalized.strip()


def escape_html(text: Optional[str]) -> str:
    """
    Escapes HTML special characters (&, <, >, ", ') to prevent XSS in rendering contexts.

    Args:
        text: Input string potentially containing HTML markup.

    Returns:
        HTML-escaped string.
    """
    if text is None:
        return ""
    if not isinstance(text, str):
        text = str(text)

    escape_map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    }
    return re.sub(r'[&<>"\']', lambda m: escape_map[m.group(0)], text)


def redact_secrets(text: Optional[str]) -> str:
    """
    Redacts sensitive API tokens, Bearer authorization credentials, and email addresses
    from diagnostic outputs and system logs.

    Args:
        text: String that may contain secrets.

    Returns:
        Sanitized string with sensitive tokens masked with [REDACTED].
    """
    if not text or not isinstance(text, str):
        return ""

    sanitized = text

    # Redact OpenAI / RouterPlus API Keys (sk-...)
    sanitized = re.sub(r"\bsk-[a-zA-Z0-9_-]{20,}\b", "[REDACTED_API_KEY]", sanitized)

    # Redact Bearer authorization tokens
    sanitized = re.sub(r"(Bearer\s+)[A-Za-z0-9\-_.]+", r"\1[REDACTED_TOKEN]", sanitized, flags=re.IGNORECASE)

    # Redact email addresses
    sanitized = re.sub(
        r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b",
        "[REDACTED_EMAIL]",
        sanitized
    )

    # Redact passwords and auth secret assignments
    sanitized = re.sub(
        r"(api[_-]?key|secret|password|auth[_-]?token)\s*[:=]\s*['\"]?[^\s,'\"]+['\"]?",
        r"\1=[REDACTED]",
        sanitized,
        flags=re.IGNORECASE
    )

    return sanitized
