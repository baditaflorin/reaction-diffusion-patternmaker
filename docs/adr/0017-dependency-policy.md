# 0017 Dependency Policy

## Status

Accepted

## Context

The project uses graphics, audio, and browser APIs where battle-tested libraries reduce risk.

## Decision

Use production-grade dependencies with narrow responsibilities:

- React for UI state.
- Vite for build.
- Three.js for 3D preview.
- TanStack Query for public GitHub commit lookup.
- zod for schema validation.
- Tailwind CSS for styling.
- Vitest, Playwright, ESLint, and Prettier for local quality.

Avoid new runtime dependencies for algorithms that can be small, typed, and tested locally.

## Consequences

- The app avoids fragile custom rendering stacks.
- Dependency updates should be reviewed with `npm audit`, build, tests, and smoke.

## Alternatives Considered

- Pulling large Python-in-browser stacks for scikit-image/librosa parity. Rejected in ADR 0006.
