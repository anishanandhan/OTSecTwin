"""
HTTP Security Headers middleware and configuration for FastAPI backend.
"""

from typing import Dict, List, Tuple
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

SECURITY_HEADERS: Dict[str, str] = {
    "Content-Security-Policy": (
        "default-src 'self'; script-src 'self' 'unsafe-inline'; "
        "style-src 'self' 'unsafe-inline'; object-src 'none'; frame-ancestors 'none'; "
        "upgrade-insecure-requests"
    ),
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Cross-Origin-Opener-Policy": "same-origin",
}


def get_security_headers_list() -> List[Tuple[str, str]]:
    """Returns security headers as a list of (header_name, header_value) tuples."""
    return list(SECURITY_HEADERS.items())


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    FastAPI middleware that injects strict security headers into all outgoing responses.
    """

    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        for key, value in SECURITY_HEADERS.items():
            response.headers[key] = value
        # Suppress identifying backend header
        if "server" in response.headers:
            del response.headers["server"]
        return response
