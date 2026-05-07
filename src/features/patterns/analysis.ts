import type { PatternMetrics, StateSnapshot } from "./types";

export function analyzePattern(
  snapshot: StateSnapshot,
  stride = 4,
): PatternMetrics {
  const { state, width, height } = snapshot;
  let count = 0;
  let sum = 0;
  let sumSq = 0;
  let edge = 0;
  let cx = 0;
  let cy = 0;
  let regions = 0;
  const bins = new Array<number>(16).fill(0);

  for (let y = 0; y < height; y += stride) {
    for (let x = 0; x < width; x += stride) {
      const value = state[(y * width + x) * 2 + 1];
      const right =
        state[(y * width + Math.min(width - 1, x + stride)) * 2 + 1];
      const down =
        state[(Math.min(height - 1, y + stride) * width + x) * 2 + 1];
      sum += value;
      sumSq += value * value;
      edge += Math.abs(value - right) + Math.abs(value - down);
      cx += x * value;
      cy += y * value;
      count += 1;
      bins[Math.min(15, Math.max(0, Math.floor(value * 16)))] += 1;

      if (value > 0.19 !== right > 0.19) regions += 1;
      if (value > 0.19 !== down > 0.19) regions += 1;
    }
  }

  const density = count === 0 ? 0 : sum / count;
  const variance = count === 0 ? 0 : sumSq / count - density * density;
  const entropy = bins.reduce((total, bin) => {
    if (!bin || !count) return total;
    const p = bin / count;
    return total - p * Math.log2(p);
  }, 0);

  return {
    density: clamp(density * 2.4),
    edgeDensity: clamp((edge / Math.max(1, count)) * 8),
    entropy: clamp(entropy / 4),
    contrast: clamp(Math.sqrt(Math.max(0, variance)) * 5),
    centroidX: sum === 0 ? 0.5 : clamp(cx / sum / width),
    centroidY: sum === 0 ? 0.5 : clamp(cy / sum / height),
    regionEstimate: Math.round(regions / 3),
  };
}

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}
