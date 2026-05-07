import type { PaletteId, StateSnapshot } from "./types";

type Stop = [number, number, number];

const palettes: Record<PaletteId, Stop[]> = {
  thermal: [
    [16, 17, 18],
    [77, 31, 68],
    [228, 88, 88],
    [248, 193, 74],
    [245, 241, 232],
  ],
  reef: [
    [13, 22, 24],
    [23, 91, 95],
    [87, 185, 153],
    [219, 198, 117],
    [248, 241, 221],
  ],
  ink: [
    [245, 241, 232],
    [184, 197, 194],
    [74, 85, 90],
    [22, 24, 26],
    [3, 4, 5],
  ],
  topology: [
    [18, 22, 20],
    [92, 126, 84],
    [96, 216, 211],
    [248, 193, 74],
    [255, 111, 145],
  ],
};

export function paletteColor(
  palette: PaletteId,
  u: number,
  v: number,
): [number, number, number] {
  const stops = palettes[palette];
  const value = clamp(v * 1.65 + (1 - u) * 0.55);
  const scaled = value * (stops.length - 1);
  const index = Math.min(stops.length - 2, Math.max(0, Math.floor(scaled)));
  const t = scaled - index;
  const a = stops[index];
  const b = stops[index + 1];
  return [
    Math.round(lerp(a[0], b[0], t)),
    Math.round(lerp(a[1], b[1], t)),
    Math.round(lerp(a[2], b[2], t)),
  ];
}

export function stateToImageData(snapshot: StateSnapshot, palette: PaletteId) {
  const imageData = new ImageData(snapshot.width, snapshot.height);
  for (let index = 0; index < snapshot.width * snapshot.height; index += 1) {
    const u = snapshot.state[index * 2];
    const v = snapshot.state[index * 2 + 1];
    const [r, g, b] = paletteColor(palette, u, v);
    const out = index * 4;
    imageData.data[out] = r;
    imageData.data[out + 1] = g;
    imageData.data[out + 2] = b;
    imageData.data[out + 3] = 255;
  }
  return imageData;
}

export function stateToHeightmap(snapshot: StateSnapshot) {
  const imageData = new ImageData(snapshot.width, snapshot.height);
  for (let index = 0; index < snapshot.width * snapshot.height; index += 1) {
    const u = snapshot.state[index * 2];
    const v = snapshot.state[index * 2 + 1];
    const value = Math.round(clamp(v * 1.85 + (1 - u) * 0.45) * 255);
    const out = index * 4;
    imageData.data[out] = value;
    imageData.data[out + 1] = value;
    imageData.data[out + 2] = value;
    imageData.data[out + 3] = 255;
  }
  return imageData;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}
