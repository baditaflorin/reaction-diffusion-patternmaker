# Reaction Diffusion Patternmaker

![Live GitHub Pages](https://img.shields.io/badge/live-GitHub%20Pages-60d8d3)
![Mode A](https://img.shields.io/badge/deployment-Mode%20A%20static-f8c14a)
![License MIT](https://img.shields.io/badge/license-MIT-f5f1e8)

Live site: https://baditaflorin.github.io/reaction-diffusion-patternmaker/

Repository: https://github.com/baditaflorin/reaction-diffusion-patternmaker

PayPal: https://www.paypal.com/paypalme/florinbadita

A browser lab for live Gray-Scott patterns, musical sonification, and exportable textures.

![Reaction Diffusion Patternmaker screenshot](docs/screenshot.png)

## What It Does

Reaction Diffusion Patternmaker runs Turing-style morphogenesis equations in the browser. WebGPU drives the live Gray-Scott simulation when available, CPU canvas rendering keeps unsupported browsers usable, Three.js previews the pattern as material, and Web Audio maps morphology metrics into sound.

The live page shows the current app version and latest public `main` commit, plus links back to GitHub and PayPal.

## Quickstart

```bash
npm install
make install-hooks
make dev
```

## Local Checks

```bash
make lint
make test
make build
make smoke
```

## Architecture

```mermaid
flowchart LR
  User["Browser user"] --> UI["React + TypeScript controls"]
  UI --> GPU["WebGPU Gray-Scott compute shader"]
  UI --> CPU["CPU Canvas2D fallback"]
  UI --> Audio["Web Audio sonification"]
  UI --> Preview["Three.js material preview"]
  UI --> Export["PNG texture and heightmap export"]
  UI --> Storage["localStorage settings"]
  UI --> GitHub["Public GitHub commit API"]
```

Deployment mode: Mode A, pure GitHub Pages. No runtime backend, no secrets, no Docker, no analytics.

Architecture docs: https://github.com/baditaflorin/reaction-diffusion-patternmaker/blob/main/docs/architecture.md

ADRs: https://github.com/baditaflorin/reaction-diffusion-patternmaker/tree/main/docs/adr

Data contract: https://github.com/baditaflorin/reaction-diffusion-patternmaker/blob/main/docs/data.md

Privacy: https://github.com/baditaflorin/reaction-diffusion-patternmaker/blob/main/docs/privacy.md

Deploy guide: https://github.com/baditaflorin/reaction-diffusion-patternmaker/blob/main/docs/deploy.md
