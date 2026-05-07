# Postmortem

Date: 2026-05-08

Live site: https://baditaflorin.github.io/reaction-diffusion-patternmaker/

Repository: https://github.com/baditaflorin/reaction-diffusion-patternmaker

## What Was Built

Reaction Diffusion Patternmaker v0.1.0 is a Mode A GitHub Pages app with:

- live Gray-Scott reaction-diffusion simulation
- WebGPU compute/render path
- CPU Canvas2D fallback
- six morphogenesis presets
- brush interaction
- Web Audio sonification from morphology metrics
- Three.js material preview
- PNG texture and heightmap export
- localStorage settings
- visible version and latest public GitHub commit
- GitHub and PayPal links in the live app
- local hooks, tests, smoke test, and Pages-ready `docs/` output

## Was Mode A Correct?

Yes. Mode A was the right choice in hindsight.

No v1 feature required auth, secrets, shared persistence, server mutations, runtime data generation, or centralized GPU compute. WebGPU, Web Audio, Three.js, Canvas2D, downloads, and localStorage cover the product surface cleanly in the browser.

Mode B is still unnecessary because presets are tiny source data. Mode C would have added deployment and security overhead without adding user value.

## What Worked

- GitHub Pages from `main /docs` gave a live URL early.
- WebGPU and CPU fallback share a small engine interface.
- Three.js is lazy-loaded, keeping the initial app payload below 200KB gzip.
- The smoke test serves the exact Pages output at the correct base path.
- Runtime public GitHub commit lookup avoids embedding unstable commit hashes into tracked build output.

## What Did Not Work

- Embedding build timestamp and git commit in tracked Pages output made every build dirty.
- The first smoke screenshot run reused a fixed port and collided with a stale local server.
- Python-native scikit-image and librosa are not practical Mode A runtime dependencies without a large WASM/Pyodide payload.

## What Surprised Us

- The Vite latest major had ecosystem edge cases with the React plugin, so the project settled on Vite 7.
- Three.js remains the largest chunk by far even when lazy-loaded.
- The GitHub Pages plus docs-in-`docs/` strategy works, but build cleanup must carefully preserve ADRs and Markdown docs.

## Accepted Tech Debt

- WebGPU shader behavior is smoke-tested through app startup, but not pixel-regression tested across real GPUs.
- Sonification is browser-native and librosa-inspired, not librosa-compatible.
- Morphology analysis is scikit-image-style TypeScript, not a full connected-component implementation.
- The PWA service worker is intentionally small and cache-first only for same-project static assets.

## Next Improvements

1. Add WebGPU pixel checks with Playwright on a known GPU-capable runner or local browser profile.
2. Add shareable preset URLs and import/export of parameter JSON.
3. Add tiled SVG or displacement-ready EXR/TIFF export for fabric and 3D-print workflows.

## Time Spent vs Estimate

Estimated: 3 to 5 hours for a complete v1 static app with docs, hooks, tests, Pages, and publishing.

Actual: about 3 hours in one implementation pass.
