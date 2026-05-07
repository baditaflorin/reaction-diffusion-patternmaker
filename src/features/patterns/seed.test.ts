import { describe, expect, it } from "vitest";
import { PRESETS } from "./presets";
import { createInitialState } from "./seed";

describe("createInitialState", () => {
  it("is deterministic for a preset and nonce", () => {
    const a = createInitialState(64, 64, PRESETS[0], 42);
    const b = createInitialState(64, 64, PRESETS[0], 42);
    expect(Array.from(a.slice(0, 128))).toEqual(Array.from(b.slice(0, 128)));
  });

  it("creates active reagent regions", () => {
    const state = createInitialState(64, 64, PRESETS[2], 7);
    let active = 0;
    for (let index = 1; index < state.length; index += 2) {
      if (state[index] > 0.1) active += 1;
    }
    expect(active).toBeGreaterThan(20);
  });
});
