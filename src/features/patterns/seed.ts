import type { PatternPreset } from "./types";
import { hashString, mulberry32 } from "./random";

export function createInitialState(
  width: number,
  height: number,
  preset: PatternPreset,
  nonce = 0,
) {
  const state = new Float32Array(width * height * 2);
  const random = mulberry32(hashString(`${preset.id}:${nonce}`));

  for (let index = 0; index < width * height; index += 1) {
    state[index * 2] = 1;
    state[index * 2 + 1] = 0;
  }

  const paintDisc = (
    cx: number,
    cy: number,
    radius: number,
    u = 0.5,
    v = 0.25,
  ) => {
    const minX = Math.max(0, Math.floor(cx - radius));
    const maxX = Math.min(width - 1, Math.ceil(cx + radius));
    const minY = Math.max(0, Math.floor(cy - radius));
    const maxY = Math.min(height - 1, Math.ceil(cy + radius));
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy <= radius * radius) {
          const offset = (y * width + x) * 2;
          const falloff = 1 - Math.sqrt(dx * dx + dy * dy) / radius;
          state[offset] = Math.max(0.05, u - falloff * 0.22);
          state[offset + 1] = Math.min(1, v + falloff * 0.55);
        }
      }
    }
  };

  if (preset.seed === "spots") {
    for (let index = 0; index < 34; index += 1) {
      paintDisc(
        random() * width,
        random() * height,
        8 + random() * 18,
        0.48,
        0.22,
      );
    }
  }

  if (preset.seed === "stripes") {
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const wave = Math.sin(
          x * 0.055 + Math.sin(y * 0.026) * 2.2 + random() * 0.08,
        );
        if (wave > 0.4) {
          const offset = (y * width + x) * 2;
          state[offset] = 0.42;
          state[offset + 1] = 0.3;
        }
      }
    }
  }

  if (preset.seed === "coral") {
    for (let index = 0; index < 46; index += 1) {
      const angle = random() * Math.PI * 2;
      const distance = Math.pow(random(), 0.8) * width * 0.27;
      paintDisc(
        width / 2 + Math.cos(angle) * distance,
        height / 2 + Math.sin(angle) * distance,
        6 + random() * 10,
      );
    }
  }

  if (preset.seed === "fingerprint") {
    const cx = width * (0.48 + random() * 0.08);
    const cy = height * (0.48 + random() * 0.08);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const dx = x - cx;
        const dy = y - cy;
        const radius = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);
        const ridge = Math.sin(
          radius * 0.16 + angle * 7.5 + Math.sin(x * 0.015) * 2,
        );
        if (ridge > 0.55) {
          const offset = (y * width + x) * 2;
          state[offset] = 0.5;
          state[offset + 1] = 0.26;
        }
      }
    }
  }

  if (preset.seed === "maze") {
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (random() > 0.88) {
          const offset = (y * width + x) * 2;
          state[offset] = 0.44 + random() * 0.08;
          state[offset + 1] = 0.16 + random() * 0.32;
        }
      }
    }
  }

  if (preset.seed === "cells") {
    for (let index = 0; index < 20; index += 1) {
      paintDisc(
        random() * width,
        random() * height,
        18 + random() * 34,
        0.36,
        0.28,
      );
    }
  }

  return state;
}
