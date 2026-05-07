# 0002 Architecture Overview and Module Boundaries

## Status

Accepted

## Context

The app needs a responsive creative tool surface, GPU simulation, CPU fallback, 3D preview, audio sonification, export, and persistent local settings.

## Decision

Use feature-oriented frontend modules under `src/features/`.

- `features/patterns`: presets, Gray-Scott engines, analyzers, export.
- `features/audio`: Web Audio sonification.
- `features/preview`: Three.js material preview.
- `features/runtime`: build metadata and public GitHub commit lookup.
- `features/storage`: local browser persistence.
- `components`: shared UI, error boundary, and toast shell.

Simulation engines expose a small common interface so the UI can switch between WebGPU and CPU fallback.

## Consequences

- GPU and CPU implementations can be tested or replaced independently.
- Three.js is lazy-loaded outside the first render path.
- Browser-only capabilities are isolated from pure logic modules.

## Alternatives Considered

- A single large app file. Rejected because engine, audio, and export behavior need separate tests and clear failure boundaries.
- A backend-centered architecture. Rejected by ADR 0001.
