# 0014 Error Handling Conventions

## Status

Accepted

## Context

Browser APIs such as WebGPU, Web Audio, downloads, and storage can fail independently.

## Decision

Errors are handled at the narrowest useful boundary:

- WebGPU initialization falls back to CPU.
- Export failures show a toast.
- Audio startup failures keep the visual app running.
- React render failures are caught by an error boundary.
- Storage parse failures reset to defaults.

## Consequences

- A failed optional subsystem should not crash the whole app.
- User-facing errors stay clear and concise.

## Alternatives Considered

- Throwing through the app tree. Rejected because creative tools should degrade gracefully.
