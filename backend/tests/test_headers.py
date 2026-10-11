"""
Unit tests for backend security headers middleware and policy dictionary.
Target: 100% coverage on app/security/headers.py.
"""

import pytest
from starlette.requests import Request
from starlette.responses import Response

from app.security.headers import SECURITY_HEADERS, get_security_headers_list, SecurityHeadersMiddleware


class TestSecurityHeaders:
    def test_required_headers_present(self):
        required = [
            "Content-Security-Policy",
            "Strict-Transport-Security",
            "X-Frame-Options",
            "X-Content-Type-Options",
            "Referrer-Policy",
            "Permissions-Policy",
        ]
        for header in required:
            assert header in SECURITY_HEADERS
            assert len(SECURITY_HEADERS[header]) > 0

    def test_strict_transport_security_value(self):
        hsts = SECURITY_HEADERS["Strict-Transport-Security"]
        assert "max-age=31536000" in hsts
        assert "preload" in hsts

    def test_x_frame_options_denies_framing(self):
        assert SECURITY_HEADERS["X-Frame-Options"] == "DENY"

    def test_content_type_options_nosniff(self):
        assert SECURITY_HEADERS["X-Content-Type-Options"] == "nosniff"

    def test_get_security_headers_list_format(self):
        tuples_list = get_security_headers_list()
        assert isinstance(tuples_list, list)
        assert len(tuples_list) == len(SECURITY_HEADERS)
        for item in tuples_list:
            assert isinstance(item, tuple)
            assert len(item) == 2

    @pytest.mark.anyio
    async def test_middleware_injects_headers_and_removes_server(self):
        middleware = SecurityHeadersMiddleware(app=None)

        async def call_next(req):
            res = Response("ok")
            res.headers["server"] = "uvicorn"
            return res

        scope = {"type": "http", "method": "GET", "path": "/", "headers": []}
        req = Request(scope)
        res = await middleware.dispatch(req, call_next)
        assert res.headers["X-Frame-Options"] == "DENY"
        assert res.headers["X-Content-Type-Options"] == "nosniff"
        assert "server" not in res.headers
