import type { PatternPreset, PatternSettings } from "./types";
import { PRESETS } from "./presets";

const initialPreset = PRESETS[0];

export const DEFAULT_SETTINGS: PatternSettings = {
  presetId: initialPreset.id,
  feed: initialPreset.feed,
  kill: initialPreset.kill,
  diffusionU: initialPreset.diffusionU,
  diffusionV: initialPreset.diffusionV,
  timeStep: initialPreset.timeStep,
  iterationsPerFrame: 6,
  brushRadius: 22,
  resolution: 512,
  palette: initialPreset.palette,
  running: true,
  audioEnabled: false,
};

export function applyPresetToSettings(
  current: PatternSettings,
  preset: PatternPreset,
): PatternSettings {
  return {
    ...current,
    presetId: preset.id,
    feed: preset.feed,
    kill: preset.kill,
    diffusionU: preset.diffusionU,
    diffusionV: preset.diffusionV,
    timeStep: preset.timeStep,
    palette: preset.palette,
  };
}
