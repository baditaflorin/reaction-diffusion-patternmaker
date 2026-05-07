import { z } from "zod";
import type { PaletteId, PatternPreset, SeedKind } from "./types";

const presetSchema = z.object({
  id: z.string().min(2),
  name: z.string().min(2),
  signature: z.string().min(2),
  description: z.string().min(2),
  feed: z.number().min(0.005).max(0.09),
  kill: z.number().min(0.02).max(0.09),
  diffusionU: z.number().min(0.2).max(1.4),
  diffusionV: z.number().min(0.05).max(0.9),
  timeStep: z.number().min(0.2).max(1.6),
  seed: z.enum([
    "spots",
    "stripes",
    "coral",
    "fingerprint",
    "maze",
    "cells",
  ] satisfies [SeedKind, SeedKind, SeedKind, SeedKind, SeedKind, SeedKind]),
  palette: z.enum(["thermal", "reef", "ink", "topology"] satisfies [
    PaletteId,
    PaletteId,
    PaletteId,
    PaletteId,
  ]),
});

export const PRESETS = [
  {
    id: "leopard-spots",
    name: "Leopard",
    signature: "islands",
    description: "Rounded islands with slow splitting and soft halos.",
    feed: 0.0367,
    kill: 0.0649,
    diffusionU: 1,
    diffusionV: 0.5,
    timeStep: 1,
    seed: "spots",
    palette: "thermal",
  },
  {
    id: "zebra-stripes",
    name: "Zebra",
    signature: "bands",
    description: "Long travelling ridges that braid into parallel stripes.",
    feed: 0.029,
    kill: 0.057,
    diffusionU: 1,
    diffusionV: 0.48,
    timeStep: 1,
    seed: "stripes",
    palette: "ink",
  },
  {
    id: "coral-growth",
    name: "Coral",
    signature: "branches",
    description: "Branching fronts with porous reef-like edges.",
    feed: 0.0545,
    kill: 0.062,
    diffusionU: 1,
    diffusionV: 0.43,
    timeStep: 1,
    seed: "coral",
    palette: "reef",
  },
  {
    id: "fingerprint-whorls",
    name: "Fingerprint",
    signature: "whorls",
    description: "Curving ridges seeded with a radial phase field.",
    feed: 0.021,
    kill: 0.051,
    diffusionU: 1,
    diffusionV: 0.5,
    timeStep: 1,
    seed: "fingerprint",
    palette: "ink",
  },
  {
    id: "maze-skin",
    name: "Maze",
    signature: "labyrinth",
    description: "Dense maze channels that settle into printable grooves.",
    feed: 0.022,
    kill: 0.0505,
    diffusionU: 1,
    diffusionV: 0.5,
    timeStep: 1,
    seed: "maze",
    palette: "topology",
  },
  {
    id: "cell-division",
    name: "Cells",
    signature: "mitosis",
    description:
      "Pulsing cell walls with bright centres and merging membranes.",
    feed: 0.026,
    kill: 0.055,
    diffusionU: 1,
    diffusionV: 0.5,
    timeStep: 1,
    seed: "cells",
    palette: "thermal",
  },
] satisfies PatternPreset[];

export const VALIDATED_PRESETS = z.array(presetSchema).parse(PRESETS);

export const PALETTES = [
  { id: "thermal", name: "Thermal cloth" },
  { id: "reef", name: "Reef mineral" },
  { id: "ink", name: "Ink relief" },
  { id: "topology", name: "Topology map" },
] satisfies { id: PaletteId; name: string }[];

export function getPresetById(id: string): PatternPreset {
  return PRESETS.find((preset) => preset.id === id) ?? PRESETS[0];
}
