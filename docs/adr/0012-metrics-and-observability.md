# 0012 Metrics and Observability

## Status

Accepted

## Context

The bootstrap defaults to no analytics for Mode A/B unless justified.

## Decision

Ship no analytics in v1.

The app displays local runtime metrics only:

- engine mode
- frame rate estimate
- pattern density
- edge density
- entropy
- region estimate

No telemetry is sent to a server.

## Consequences

- Privacy posture is simple.
- Product usage data is unavailable unless users provide feedback manually.

## Alternatives Considered

- Plausible analytics. Rejected for v1 because the app can launch without usage tracking.
- Self-hosted beacon. Rejected because Mode A has no backend.
