import { z } from "zod";
import type { PatternSettings } from "../patterns/types";
import { DEFAULT_SETTINGS } from "../patterns/settings";

const key = "reaction-diffusion-patternmaker:settings:v1";

const settingsSchema = z.object({
  presetId: z.string(),
  feed: z.number(),
  kill: z.number(),
  diffusionU: z.number(),
  diffusionV: z.number(),
  timeStep: z.number(),
  iterationsPerFrame: z.number(),
  brushRadius: z.number(),
  resolution: z.union([
    z.literal(256),
    z.literal(384),
    z.literal(512),
    z.literal(768),
  ]),
  palette: z.union([
    z.literal("thermal"),
    z.literal("reef"),
    z.literal("ink"),
    z.literal("topology"),
  ]),
  running: z.boolean(),
  audioEnabled: z.boolean(),
});

export function loadSettings(): PatternSettings | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return { ...DEFAULT_SETTINGS, ...settingsSchema.parse(JSON.parse(raw)) };
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

export function saveSettings(settings: PatternSettings) {
  window.localStorage.setItem(key, JSON.stringify(settings));
}
