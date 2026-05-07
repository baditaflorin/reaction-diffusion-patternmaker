# 0010 GitHub Pages Publishing Strategy

## Status

Accepted

## Context

The live GitHub Pages URL is a first-class deliverable from the first commit. Project docs and ADRs also need to live under `docs/`.

## Decision

Publish from `main` branch `/docs`.

Vite builds the app into `docs/` with `emptyOutDir: false`. The build script removes only generated Pages assets before rebuilding so `docs/adr/` and Markdown docs survive.

Base path is `/reaction-diffusion-patternmaker/`.

`docs/404.html` is copied from `docs/index.html` after each build for SPA fallback.

No custom domain is configured in v1.

## Consequences

- The Pages URL is https://baditaflorin.github.io/reaction-diffusion-patternmaker/.
- Built assets are committed and not gitignored.
- Documentation is also visible under the Pages path.
- Asset filenames are hashed for cache busting.

## Alternatives Considered

- `gh-pages` branch. Rejected to avoid branch publishing complexity for v1.
- Publish from repository root. Rejected because source files should not be served as the site root.
