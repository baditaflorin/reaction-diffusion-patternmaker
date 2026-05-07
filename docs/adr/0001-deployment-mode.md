# 0001 Deployment Mode

## Status

Accepted

## Context

The project is a live Gray-Scott reaction-diffusion patternmaker with WebGPU compute shaders, Three.js preview, browser audio sonification, and image export. The requested default is GitHub Pages whenever feasible.

The v1 feature set has no auth, no shared user accounts, no private data, no server-side writes, and no secrets. User state can stay in browser storage. Simulation runs on the user's device.

## Decision

Use Mode A: Pure GitHub Pages.

The frontend is a static Vite app committed to `docs/` and served from GitHub Pages at https://baditaflorin.github.io/reaction-diffusion-patternmaker/.

No runtime backend, Docker image, nginx, database, or hosted API will be built for v1.

## Consequences

- The public surface is static and cheap to host.
- WebGPU acceleration depends on browser and device support.
- The app must provide a CPU canvas fallback for unsupported browsers.
- Python-native scikit-image/librosa are not runtime dependencies. Their v1 role is represented by browser-native analysis and sonification algorithms inspired by those domains.
- Cross-device sync and collaborative presets are out of scope.

## Alternatives Considered

- Mode B: GitHub Pages plus pre-built data. Rejected because presets and shader code are small static assets and do not require a scheduled pipeline.
- Mode C: Pages frontend plus Docker backend. Rejected because no v1 feature requires secrets, runtime mutation, auth, or centralized compute.
