# 0003 Frontend Framework and Build Tooling

## Status

Accepted

## Context

The v1 interface needs dense controls, real-time status, error boundaries, and integration with WebGPU, Three.js, and Web Audio.

## Decision

Use React 18, TypeScript strict mode, Vite 7, Tailwind CSS, zod, TanStack Query, Vitest, ESLint, Prettier, and Playwright.

Vite builds directly into `docs/` with base path `/reaction-diffusion-patternmaker/`.

## Consequences

- React keeps the tool UI manageable.
- Vite produces fast local dev and hashed assets for Pages.
- TypeScript catches mistakes around WebGPU and browser APIs.
- Tailwind keeps styling consistent without a large component framework.

## Alternatives Considered

- Vanilla TypeScript. Rejected because the control surface and status handling are easier to maintain with React.
- Next.js or Remix. Rejected because server rendering and routing add unnecessary deployment complexity for Mode A.
