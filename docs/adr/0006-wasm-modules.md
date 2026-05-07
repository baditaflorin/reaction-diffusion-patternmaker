# 0006 WASM Modules Used

## Status

Accepted

## Context

The bootstrap requested scikit-image, librosa, and WebGPU. Python-native scikit-image and librosa do not run directly on GitHub Pages without a large Pyodide/WASM payload.

## Decision

Do not ship WASM modules in v1.

Use WebGPU compute shaders for simulation, browser-native TypeScript for scikit-image-style image metrics, and Web Audio for librosa-inspired sonification.

Lazy WASM is allowed in a later version if a concrete feature requires parity with Python libraries and can stay behind a user action.

## Consequences

- Initial payload stays small.
- GitHub Pages does not need COOP/COEP workarounds.
- v1 is not a full scikit-image or librosa port.

## Alternatives Considered

- Pyodide with scikit-image/librosa. Rejected for payload size, startup latency, and cross-origin isolation complexity.
- Custom WebAssembly kernels. Rejected until profiling proves TypeScript/WebGPU is insufficient.
