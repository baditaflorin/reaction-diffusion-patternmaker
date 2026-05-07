# 0011 Logging Strategy

## Status

Accepted

## Context

Mode A has no server logs. Browser console noise should be minimal in production.

## Decision

Use a small client logger wrapper for development diagnostics. Production builds avoid routine console output.

User-visible failures go through the error boundary and toast surface, not console-only messages.

## Consequences

- Production users should not see avoidable console errors.
- Debug information remains available locally during development.

## Alternatives Considered

- Structured remote logging. Rejected because it would add tracking and infrastructure not needed for v1.
