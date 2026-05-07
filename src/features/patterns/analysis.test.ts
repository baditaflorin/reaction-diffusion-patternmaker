import { describe, expect, it } from "vitest";
import { analyzePattern } from "./analysis";
import type { StateSnapshot } from "./types";

function makeSnapshot(
  width: number,
  height: number,
  fill: (x: number, y: number) => number,
): StateSnapshot {
  const state = new Float32Array(width * height * 2);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 2;
      const v = fill(x, y);
      state[index] = 1 - v * 0.4;
      state[index + 1] = v;
    }
  }
  return { state, width, height };
}

describe("analyzePattern", () => {
  it("reports low edge density for uniform fields", () => {
    const metrics = analyzePattern(
      makeSnapshot(32, 32, () => 0.1),
      2,
    );
    expect(metrics.edgeDensity).toBeLessThan(0.001);
    expect(metrics.density).toBeGreaterThan(0);
  });

  it("finds more edges in striped fields", () => {
    const smooth = analyzePattern(
      makeSnapshot(32, 32, () => 0.1),
      2,
    );
    const striped = analyzePattern(
      makeSnapshot(32, 32, (x) => (x % 8 < 4 ? 0.35 : 0.02)),
      2,
    );
    expect(striped.edgeDensity).toBeGreaterThan(smooth.edgeDensity);
    expect(striped.regionEstimate).toBeGreaterThan(smooth.regionEstimate);
  });
});
