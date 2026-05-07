import { describe, expect, it } from "vitest";
import { PRESETS, VALIDATED_PRESETS } from "./presets";

describe("pattern presets", () => {
  it("match the v1 schema", () => {
    expect(VALIDATED_PRESETS).toHaveLength(6);
  });

  it("have unique ids", () => {
    const ids = new Set(PRESETS.map((preset) => preset.id));
    expect(ids.size).toBe(PRESETS.length);
  });

  it("stay inside stable Gray-Scott control ranges", () => {
    for (const preset of PRESETS) {
      expect(preset.feed).toBeGreaterThanOrEqual(0.01);
      expect(preset.feed).toBeLessThanOrEqual(0.08);
      expect(preset.kill).toBeGreaterThanOrEqual(0.035);
      expect(preset.kill).toBeLessThanOrEqual(0.08);
      expect(preset.diffusionU).toBeGreaterThan(preset.diffusionV);
    }
  });
});
