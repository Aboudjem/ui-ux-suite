# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in UI/UX Suite, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, email **adam@integralayer.com** with:

1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested fix (if any)

You will receive a response within 48 hours. We will work with you to understand
and address the issue before any public disclosure.

## Scope

This policy covers:
- The `lib/` engine modules
- The MCP server (`lib/mcp-server.js`)
- Any file path traversal or information disclosure via extractors
- Plugin manifest integrity

## Design Principles

- **Read-only analysis** — the suite never modifies user code
- **Zero dependencies** — no supply chain attack surface
- **Local execution** — no data sent to external services
- **No telemetry** — no usage data collected
