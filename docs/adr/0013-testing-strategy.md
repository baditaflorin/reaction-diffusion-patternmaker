# 0013 Testing Strategy

## Status

Accepted

## Context

Core risks are shader setup, CPU fallback correctness, preset validity, export behavior, and Pages path compatibility.

## Decision

Use:

- Vitest for TypeScript logic modules.
- TypeScript strict checking for compile-time contracts.
- ESLint and Prettier for code health.
- A Playwright smoke script serving `docs/` at the Pages base path.

`make test`, `make lint`, `make build`, and `make smoke` are the local quality gates.

## Consequences

- Pure logic is covered with fast unit tests.
- Browser behavior is checked by a happy-path smoke run.
- WebGPU support is not required for smoke; CPU fallback keeps the app testable in headless browsers.

## Alternatives Considered

- GitHub Actions. Rejected by the bootstrap constraints.
- Manual-only QA. Rejected because Pages base path mistakes are easy to miss.
