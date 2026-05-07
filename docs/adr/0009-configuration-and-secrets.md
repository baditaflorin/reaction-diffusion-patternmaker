# 0009 Configuration and Secrets Management

## Status

Accepted

## Context

Mode A must not contain secrets. Build configuration is public.

## Decision

Use public Vite environment variables only for non-secret values such as base path, version, and source commit.

`.env.example` documents placeholders. Real `.env*` files are ignored.

No API keys, tokens, private hosts, or credentials are used by v1.

## Consequences

- The frontend can be inspected safely.
- Git hooks include a gitleaks scan when the binary is installed.
- Public GitHub API calls are unauthenticated and optional.

## Alternatives Considered

- Encrypted frontend secrets. Rejected because frontend secrets are not secrets.
- Backend proxy. Rejected because no protected API is needed.
