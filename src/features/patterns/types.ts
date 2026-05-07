export type EngineMode = "webgpu" | "cpu";

export type Resolution = 256 | 384 | 512 | 768;

export type PaletteId = "thermal" | "reef" | "ink" | "topology";

export type SeedKind =
  | "spots"
  | "stripes"
  | "coral"
  | "fingerprint"
  | "maze"
  | "cells";

export type PatternPreset = {
  id: string;
  name: string;
  signature: string;
  description: string;
  feed: number;
  kill: number;
  diffusionU: number;
  diffusionV: number;
  timeStep: number;
  seed: SeedKind;
  palette: PaletteId;
};

export type PatternSettings = {
  presetId: string;
  feed: number;
  kill: number;
  diffusionU: number;
  diffusionV: number;
  timeStep: number;
  iterationsPerFrame: number;
  brushRadius: number;
  resolution: Resolution;
  palette: PaletteId;
  running: boolean;
  audioEnabled: boolean;
};

export type BrushState = {
  active: boolean;
  x: number;
  y: number;
  radius: number;
  strength: number;
};

export type PatternMetrics = {
  density: number;
  edgeDensity: number;
  entropy: number;
  contrast: number;
  centroidX: number;
  centroidY: number;
  regionEstimate: number;
};

export type StateSnapshot = {
  state: Float32Array;
  width: number;
  height: number;
};

export interface PatternEngine {
  readonly mode: EngineMode;
  readonly canvas: HTMLCanvasElement;
  setSettings(settings: PatternSettings): void;
  setBrush(brush: BrushState): void;
  reseed(preset: PatternPreset, nonce?: number): void;
  step(iterations: number): void;
  render(): void;
  snapshot(): Promise<StateSnapshot>;
  dispose(): void;
}
