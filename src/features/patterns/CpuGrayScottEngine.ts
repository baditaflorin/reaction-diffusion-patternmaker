import { createInitialState } from "./seed";
import { paletteColor } from "./palette";
import type {
  BrushState,
  PatternEngine,
  PatternPreset,
  PatternSettings,
  StateSnapshot,
} from "./types";

const idleBrush: BrushState = {
  active: false,
  x: -1,
  y: -1,
  radius: 1,
  strength: 0,
};

export class CpuGrayScottEngine implements PatternEngine {
  readonly mode = "cpu" as const;
  readonly canvas: HTMLCanvasElement;

  private context: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private state: Float32Array;
  private next: Float32Array;
  private imageData: ImageData;
  private settings: PatternSettings;
  private preset: PatternPreset;
  private brush = idleBrush;

  constructor(
    canvas: HTMLCanvasElement,
    settings: PatternSettings,
    preset: PatternPreset,
  ) {
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("Canvas 2D is unavailable");

    this.canvas = canvas;
    this.context = context;
    this.settings = settings;
    this.preset = preset;
    this.width = settings.resolution;
    this.height = settings.resolution;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.state = createInitialState(this.width, this.height, preset);
    this.next = new Float32Array(this.state.length);
    this.imageData = new ImageData(this.width, this.height);
    this.render();
  }

  setSettings(settings: PatternSettings) {
    const resized = settings.resolution !== this.width;
    this.settings = settings;
    if (resized) {
      this.width = settings.resolution;
      this.height = settings.resolution;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.state = createInitialState(this.width, this.height, this.preset);
      this.next = new Float32Array(this.state.length);
      this.imageData = new ImageData(this.width, this.height);
    }
  }

  setBrush(brush: BrushState) {
    this.brush = brush;
  }

  reseed(preset: PatternPreset, nonce = Date.now()) {
    this.preset = preset;
    this.state = createInitialState(this.width, this.height, preset, nonce);
    this.next.fill(0);
    this.render();
  }

  step(iterations: number) {
    for (let iteration = 0; iteration < iterations; iteration += 1) {
      this.iterate();
      const swap = this.state;
      this.state = this.next;
      this.next = swap;
    }
    this.render();
  }

  render() {
    for (let index = 0; index < this.width * this.height; index += 1) {
      const u = this.state[index * 2];
      const v = this.state[index * 2 + 1];
      const [r, g, b] = paletteColor(this.settings.palette, u, v);
      const out = index * 4;
      this.imageData.data[out] = r;
      this.imageData.data[out + 1] = g;
      this.imageData.data[out + 2] = b;
      this.imageData.data[out + 3] = 255;
    }
    this.context.putImageData(this.imageData, 0, 0);
  }

  async snapshot(): Promise<StateSnapshot> {
    return {
      state: new Float32Array(this.state),
      width: this.width,
      height: this.height,
    };
  }

  dispose() {
    this.brush = idleBrush;
  }

  private iterate() {
    const {
      diffusionU: du,
      diffusionV: dv,
      feed,
      kill,
      timeStep: dt,
    } = this.settings;

    for (let y = 0; y < this.height; y += 1) {
      const ym = y === 0 ? this.height - 1 : y - 1;
      const yp = y === this.height - 1 ? 0 : y + 1;
      for (let x = 0; x < this.width; x += 1) {
        const xm = x === 0 ? this.width - 1 : x - 1;
        const xp = x === this.width - 1 ? 0 : x + 1;
        const index = (y * this.width + x) * 2;
        const u = this.state[index];
        const v = this.state[index + 1];
        const lapU =
          this.state[(y * this.width + xm) * 2] +
          this.state[(y * this.width + xp) * 2] +
          this.state[(ym * this.width + x) * 2] +
          this.state[(yp * this.width + x) * 2] -
          u * 4;
        const lapV =
          this.state[(y * this.width + xm) * 2 + 1] +
          this.state[(y * this.width + xp) * 2 + 1] +
          this.state[(ym * this.width + x) * 2 + 1] +
          this.state[(yp * this.width + x) * 2 + 1] -
          v * 4;
        const reaction = u * v * v;
        let nextU = u + (du * lapU - reaction + feed * (1 - u)) * dt;
        let nextV = v + (dv * lapV + reaction - (feed + kill) * v) * dt;

        if (this.brush.active) {
          const dx = x - this.brush.x;
          const dy = y - this.brush.y;
          const distance = Math.hypot(dx, dy);
          if (distance < this.brush.radius) {
            const falloff = 1 - distance / this.brush.radius;
            nextU -= falloff * this.brush.strength * 0.45;
            nextV += falloff * this.brush.strength;
          }
        }

        this.next[index] = clamp(nextU);
        this.next[index + 1] = clamp(nextV);
      }
    }
  }
}

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}
