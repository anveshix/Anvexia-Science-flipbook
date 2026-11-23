"""Deterministic, hash-pinned script CSP + deployment header generation.

The single-file build contains inline classic scripts and one inline stylesheet.
Every inline <script> is SHA-256 hash-pinned, so script execution needs NO
'unsafe-inline'. Dynamic UI code uses element.style properties / inline style
attributes, which CSP hashes cannot allow without enumerating every runtime
value; style-src therefore uses 'unsafe-inline' but no external style source.
script-src remains strict and default-src/connect-src/object-src are 'none'.

The same *header* policy is written to publish/_headers and publish/nginx.conf.
A slightly different *meta* policy omits frame-ancestors, which browsers ignore
(and log as an error) when delivered through <meta>. No external resources are
allowed at runtime.

Important: app JavaScript contains literal "<style>" markup inside template
strings for dynamically created SVGs. Those are NOT document style elements,
so script blocks are parsed and masked before looking for real <style> tags.
"""
from __future__ import annotations

import base64
import hashlib
import re
from typing import Dict, List

SCRIPT_OPEN_RE = re.compile(r"<script\b[^>]*>", re.I)
SCRIPT_CLOSE_RE = re.compile(r"</script\s*>", re.I)
STYLE_RE = re.compile(r"<style\b[^>]*>(.*?)</style\s*>", re.I | re.S)


def _sha256_source(content: str) -> str:
    digest = hashlib.sha256(content.encode("utf-8")).digest()
    return "'sha256-" + base64.b64encode(digest).decode("ascii") + "'"


def _script_blocks(html: str):
    """Return (content, start, end) for real script elements, skipping literal
    '<script>' text inside a previous script body. build.py guarantees no literal
    '</script' survives inside any script body."""
    blocks, pos = [], 0
    while True:
        opening = SCRIPT_OPEN_RE.search(html, pos)
        if not opening:
            break
        content_start = opening.end()
        closing = SCRIPT_CLOSE_RE.search(html, content_start)
        if not closing:
            raise ValueError("unterminated <script> element in bundle")
        blocks.append((html[content_start:closing.start()], opening.start(), closing.end()))
        pos = closing.end()
    return blocks


def analyze(html: str) -> Dict:
    script_blocks = _script_blocks(html)
    # Mask each complete script element (same length) so a literal <style> inside
    # a JS template string cannot be mistaken for a document stylesheet.
    masked = list(html)
    for _content, start, end in script_blocks:
        for i in range(start, end):
            masked[i] = "\0"
    styles = STYLE_RE.findall("".join(masked))
    return {
        "scriptBlocks": len(script_blocks),
        "styleBlocks": len(styles),
        "scriptHashes": [_sha256_source(b[0]) for b in script_blocks],
        "styleHashes": [_sha256_source(s) for s in styles],
    }


def _base_directives(a: Dict, *, include_frame_ancestors: bool) -> List[str]:
    directives = [
        "default-src 'none'",
        "base-uri 'none'",
        "object-src 'none'",
        "frame-src 'none'",
    ]
    if include_frame_ancestors:
        directives.append("frame-ancestors 'none'")
    directives += [
        "form-action 'none'",
        "connect-src 'none'",
        "img-src data: blob: 'self'",
        "font-src data:",
        "media-src 'none'",
        "worker-src 'none'",
        "manifest-src 'none'",
        "script-src " + " ".join(a["scriptHashes"]),
        # Dynamic CSSOM/inline style attributes cannot be hash-pinned; no remote
        # style, no remote image/font/connect is permitted by the other directives.
        "style-src 'unsafe-inline'",
    ]
    return directives


def policy(analysis: Dict | None = None, html: str | None = None) -> str:
    """Full CSP for HTTP headers (includes frame-ancestors)."""
    a = analysis if analysis is not None else analyze(html or "")
    return "; ".join(_base_directives(a, include_frame_ancestors=True))


def meta_policy(analysis: Dict | None = None, html: str | None = None) -> str:
    """CSP for <meta> delivery; frame-ancestors is header-only."""
    a = analysis if analysis is not None else analyze(html or "")
    return "; ".join(_base_directives(a, include_frame_ancestors=False))


SECURITY_HEADERS = [
    ("X-Content-Type-Options", "nosniff"),
    ("X-Frame-Options", "DENY"),
    ("Referrer-Policy", "strict-origin-when-cross-origin"),
    ("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), midi=()"),
    ("Cross-Origin-Opener-Policy", "same-origin"),
    ("Cross-Origin-Resource-Policy", "same-origin"),
    ("X-Permitted-Cross-Domain-Policies", "none"),
    ("Strict-Transport-Security", "max-age=31536000; includeSubDomains"),
    ("Cache-Control", "no-cache"),
]


def render_netlify_headers(csp: str) -> str:
    lines = ["/*"]
    lines.append("  Content-Security-Policy: " + csp)
    for name, value in SECURITY_HEADERS:
        lines.append(f"  {name}: {value}")
    lines += ["", "/index.html", "  Content-Type: text/html; charset=utf-8", ""]
    return "\n".join(lines)


def render_nginx_conf(csp: str) -> str:
    # The map lives in the http{} context (conf.d/default.conf is included there).
    # An empty mapped value makes nginx omit the header on plain HTTP; a TLS
    # reverse proxy sets X-Forwarded-Proto: https and HSTS is then emitted.
    lines: List[str] = [
        '# Generated by make_publish.py — do not hand-edit; hashes change with the bundle.',
        'map $http_x_forwarded_proto $eduverse_hsts {',
        '    default "";',
        '    https "max-age=31536000; includeSubDomains";',
        '}',
        '',
        'server {',
        '    listen 80;',
        '    server_name _;',
        '    root /usr/share/nginx/html;',
        '    index index.html;',
        '    charset utf-8;',
        '    server_tokens off;',
        '    autoindex off;',
        '    client_max_body_size 1m;',
        '',
        '    gzip on;',
        '    gzip_comp_level 6;',
        '    gzip_min_length 1024;',
        '    gzip_vary on;',
        '    gzip_types text/css application/javascript application/json image/svg+xml;',
        '',
        '    # One static document; no API, upload, form or backend exists.',
        '    if ($request_method !~ ^(GET|HEAD)$) { return 405; }',
        '',
        f'    add_header Content-Security-Policy "{csp}" always;',
    ]
    for name, value in SECURITY_HEADERS:
        if name == "Strict-Transport-Security":
            lines.append('    add_header Strict-Transport-Security $eduverse_hsts always;')
        else:
            lines.append(f'    add_header {name} "{value}" always;')
    lines += [
        '',
        '    # Query-string deep links (?world=...&spread=...) stay on index.html.',
        '    location / {',
        '        limit_except GET HEAD { deny all; }',
        '        try_files $uri $uri/ /index.html;',
        '    }',
        '',
        '    location = /index.html {',
        '        try_files $uri =404;',
        '    }',
        '}',
        '',
    ]
    return "\n".join(lines)
