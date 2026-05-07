# Reaction Diffusion Patternmaker

Live site: https://baditaflorin.github.io/reaction-diffusion-patternmaker/

Repository: https://github.com/baditaflorin/reaction-diffusion-patternmaker

A browser lab for live Gray-Scott patterns, musical sonification, and exportable textures.

## Quickstart

```bash
npm install
make install-hooks
make dev
```

## Build

```bash
make build
make pages-preview
make smoke
```

The app is Mode A: pure GitHub Pages. It runs in the browser with WebGPU when available, falls back to CPU canvas rendering, and requires no runtime backend.

## Documentation

Architecture: https://github.com/baditaflorin/reaction-diffusion-patternmaker/blob/main/docs/architecture.md

ADRs: https://github.com/baditaflorin/reaction-diffusion-patternmaker/tree/main/docs/adr

Deploy guide: https://github.com/baditaflorin/reaction-diffusion-patternmaker/blob/main/docs/deploy.md
