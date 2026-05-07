import { createInitialState } from "./seed";
import type {
  BrushState,
  PatternEngine,
  PatternPreset,
  PatternSettings,
  StateSnapshot,
} from "./types";

const uniformSize = 48;

const shader = /* wgsl */ `
struct Params {
  width: u32,
  height: u32,
  diffusionU: f32,
  diffusionV: f32,
  feed: f32,
  kill: f32,
  timeStep: f32,
  brushX: f32,
  brushY: f32,
  brushRadius: f32,
  brushStrength: f32,
  palette: u32,
};

struct State {
  values: array<vec2<f32>>,
};

@group(0) @binding(0) var<storage, read> inputState: State;
@group(0) @binding(1) var<storage, read_write> outputState: State;
@group(0) @binding(2) var<uniform> params: Params;

fn idx(x: u32, y: u32) -> u32 {
  return y * params.width + x;
}

@compute @workgroup_size(8, 8)
fn compute(@builtin(global_invocation_id) id: vec3<u32>) {
  if (id.x >= params.width || id.y >= params.height) {
    return;
  }

  let x = id.x;
  let y = id.y;
  let xm = select(x - 1u, params.width - 1u, x == 0u);
  let xp = select(x + 1u, 0u, x == params.width - 1u);
  let ym = select(y - 1u, params.height - 1u, y == 0u);
  let yp = select(y + 1u, 0u, y == params.height - 1u);

  let center = inputState.values[idx(x, y)];
  let left = inputState.values[idx(xm, y)];
  let right = inputState.values[idx(xp, y)];
  let up = inputState.values[idx(x, ym)];
  let down = inputState.values[idx(x, yp)];

  let lap = left + right + up + down - center * 4.0;
  let u = center.x;
  let v = center.y;
  let reaction = u * v * v;

  var nextU = u + (params.diffusionU * lap.x - reaction + params.feed * (1.0 - u)) * params.timeStep;
  var nextV = v + (params.diffusionV * lap.y + reaction - (params.feed + params.kill) * v) * params.timeStep;

  if (params.brushStrength > 0.0) {
    let d = distance(vec2<f32>(f32(x), f32(y)), vec2<f32>(params.brushX, params.brushY));
    if (d < params.brushRadius) {
      let falloff = 1.0 - d / params.brushRadius;
      nextU = nextU - falloff * params.brushStrength * 0.45;
      nextV = nextV + falloff * params.brushStrength;
    }
  }

  outputState.values[idx(x, y)] = vec2<f32>(clamp(nextU, 0.0, 1.0), clamp(nextV, 0.0, 1.0));
}
`;

const renderShader = /* wgsl */ `
struct Params {
  width: u32,
  height: u32,
  diffusionU: f32,
  diffusionV: f32,
  feed: f32,
  kill: f32,
  timeStep: f32,
  brushX: f32,
  brushY: f32,
  brushRadius: f32,
  brushStrength: f32,
  palette: u32,
};

struct State {
  values: array<vec2<f32>>,
};

@group(0) @binding(0) var<storage, read> state: State;
@group(0) @binding(1) var<uniform> params: Params;

@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4<f32> {
  var positions = array<vec2<f32>, 3>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>(3.0, -1.0),
    vec2<f32>(-1.0, 3.0)
  );
  return vec4<f32>(positions[vertexIndex], 0.0, 1.0);
}

fn mixColor(a: vec3<f32>, b: vec3<f32>, t: f32) -> vec3<f32> {
  return a + (b - a) * t;
}

fn paletteColor(value: f32, mode: u32) -> vec3<f32> {
  let n = clamp(value, 0.0, 1.0);
  if (mode == 1u) {
    let a = mixColor(vec3<f32>(0.05, 0.09, 0.1), vec3<f32>(0.10, 0.45, 0.47), smoothstep(0.0, 0.35, n));
    let b = mixColor(vec3<f32>(0.34, 0.73, 0.60), vec3<f32>(0.97, 0.86, 0.55), smoothstep(0.35, 0.78, n));
    return mixColor(a, b, smoothstep(0.25, 1.0, n));
  }
  if (mode == 2u) {
    return mixColor(vec3<f32>(0.96, 0.95, 0.91), vec3<f32>(0.01, 0.01, 0.01), smoothstep(0.0, 1.0, n));
  }
  if (mode == 3u) {
    let a = mixColor(vec3<f32>(0.07, 0.09, 0.08), vec3<f32>(0.36, 0.49, 0.33), smoothstep(0.0, 0.35, n));
    let b = mixColor(vec3<f32>(0.37, 0.85, 0.83), vec3<f32>(1.0, 0.43, 0.57), smoothstep(0.5, 1.0, n));
    return mixColor(a, b, smoothstep(0.28, 1.0, n));
  }
  let a = mixColor(vec3<f32>(0.06, 0.07, 0.07), vec3<f32>(0.30, 0.12, 0.27), smoothstep(0.0, 0.25, n));
  let b = mixColor(vec3<f32>(0.89, 0.35, 0.35), vec3<f32>(0.97, 0.76, 0.29), smoothstep(0.3, 0.85, n));
  return mixColor(a, b, smoothstep(0.2, 1.0, n));
}

@fragment
fn fragmentMain(@builtin(position) position: vec4<f32>) -> @location(0) vec4<f32> {
  let x = min(u32(position.x), params.width - 1u);
  let y = min(u32(position.y), params.height - 1u);
  let sample = state.values[y * params.width + x];
  let signal = sample.y * 1.65 + (1.0 - sample.x) * 0.55;
  return vec4<f32>(paletteColor(signal, params.palette), 1.0);
}
`;

export async function createWebGpuGrayScottEngine(
  canvas: HTMLCanvasElement,
  settings: PatternSettings,
  preset: PatternPreset,
) {
  if (!navigator.gpu) {
    throw new Error("WebGPU unavailable");
  }

  const adapter = await navigator.gpu.requestAdapter({
    powerPreference: "high-performance",
  });
  if (!adapter) throw new Error("WebGPU adapter unavailable");
  const device = await adapter.requestDevice();
  return new WebGpuGrayScottEngine(canvas, settings, preset, device);
}

class WebGpuGrayScottEngine implements PatternEngine {
  readonly mode = "webgpu" as const;
  readonly canvas: HTMLCanvasElement;

  private device: GPUDevice;
  private context: GPUCanvasContext;
  private format: GPUTextureFormat;
  private settings: PatternSettings;
  private preset: PatternPreset;
  private width: number;
  private height: number;
  private byteSize: number;
  private buffers: [GPUBuffer, GPUBuffer];
  private uniformBuffer: GPUBuffer;
  private readbackBuffer: GPUBuffer;
  private computePipeline: GPUComputePipeline;
  private renderPipeline: GPURenderPipeline;
  private computeBindGroups: [GPUBindGroup, GPUBindGroup];
  private renderBindGroups: [GPUBindGroup, GPUBindGroup];
  private current = 0;
  private brush: BrushState = {
    active: false,
    x: -1,
    y: -1,
    radius: 1,
    strength: 0,
  };

  constructor(
    canvas: HTMLCanvasElement,
    settings: PatternSettings,
    preset: PatternPreset,
    device: GPUDevice,
  ) {
    this.canvas = canvas;
    this.device = device;
    this.context = canvas.getContext("webgpu") as GPUCanvasContext;
    if (!this.context) throw new Error("WebGPU canvas context unavailable");

    this.settings = settings;
    this.preset = preset;
    this.width = settings.resolution;
    this.height = settings.resolution;
    this.byteSize =
      this.width * this.height * 2 * Float32Array.BYTES_PER_ELEMENT;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.format = navigator.gpu.getPreferredCanvasFormat();
    this.context.configure({
      device,
      format: this.format,
      alphaMode: "opaque",
    });

    this.buffers = this.createStateBuffers();
    this.uniformBuffer = device.createBuffer({
      size: uniformSize,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this.readbackBuffer = device.createBuffer({
      size: this.byteSize,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });

    this.computePipeline = device.createComputePipeline({
      layout: "auto",
      compute: {
        module: device.createShaderModule({ code: shader }),
        entryPoint: "compute",
      },
    });
    this.renderPipeline = device.createRenderPipeline({
      layout: "auto",
      vertex: {
        module: device.createShaderModule({ code: renderShader }),
        entryPoint: "vertexMain",
      },
      fragment: {
        module: device.createShaderModule({ code: renderShader }),
        entryPoint: "fragmentMain",
        targets: [{ format: this.format }],
      },
      primitive: { topology: "triangle-list" },
    });

    this.computeBindGroups = this.createComputeBindGroups();
    this.renderBindGroups = this.createRenderBindGroups();
    this.writeUniforms();
    this.render();
  }

  setSettings(settings: PatternSettings) {
    const resized = settings.resolution !== this.width;
    this.settings = settings;
    if (resized) {
      this.resize(settings.resolution);
    }
    this.writeUniforms();
  }

  setBrush(brush: BrushState) {
    this.brush = brush;
    this.writeUniforms();
  }

  reseed(preset: PatternPreset, nonce = Date.now()) {
    this.preset = preset;
    this.writeStateBuffer(
      0,
      createInitialState(this.width, this.height, preset, nonce),
    );
    this.writeStateBuffer(
      1,
      createInitialState(this.width, this.height, preset, nonce + 1),
    );
    this.current = 0;
    this.render();
  }

  step(iterations: number) {
    const encoder = this.device.createCommandEncoder();
    for (let index = 0; index < iterations; index += 1) {
      const pass = encoder.beginComputePass();
      pass.setPipeline(this.computePipeline);
      pass.setBindGroup(0, this.computeBindGroups[this.current]);
      pass.dispatchWorkgroups(
        Math.ceil(this.width / 8),
        Math.ceil(this.height / 8),
      );
      pass.end();
      this.current = 1 - this.current;
    }
    this.encodeRender(encoder);
    this.device.queue.submit([encoder.finish()]);
  }

  render() {
    const encoder = this.device.createCommandEncoder();
    this.encodeRender(encoder);
    this.device.queue.submit([encoder.finish()]);
  }

  async snapshot(): Promise<StateSnapshot> {
    const encoder = this.device.createCommandEncoder();
    encoder.copyBufferToBuffer(
      this.buffers[this.current],
      0,
      this.readbackBuffer,
      0,
      this.byteSize,
    );
    this.device.queue.submit([encoder.finish()]);
    await this.readbackBuffer.mapAsync(GPUMapMode.READ);
    const mapped = this.readbackBuffer.getMappedRange();
    const state = new Float32Array(mapped.slice(0));
    this.readbackBuffer.unmap();
    return { state, width: this.width, height: this.height };
  }

  dispose() {
    this.buffers.forEach((buffer) => buffer.destroy());
    this.uniformBuffer.destroy();
    this.readbackBuffer.destroy();
  }

  private resize(resolution: number) {
    this.width = resolution;
    this.height = resolution;
    this.byteSize =
      this.width * this.height * 2 * Float32Array.BYTES_PER_ELEMENT;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.buffers.forEach((buffer) => buffer.destroy());
    this.readbackBuffer.destroy();
    this.buffers = this.createStateBuffers();
    this.readbackBuffer = this.device.createBuffer({
      size: this.byteSize,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });
    this.computeBindGroups = this.createComputeBindGroups();
    this.renderBindGroups = this.createRenderBindGroups();
    this.current = 0;
  }

  private createStateBuffers(): [GPUBuffer, GPUBuffer] {
    const a = this.device.createBuffer({
      size: this.byteSize,
      usage:
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_DST |
        GPUBufferUsage.COPY_SRC,
    });
    const b = this.device.createBuffer({
      size: this.byteSize,
      usage:
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_DST |
        GPUBufferUsage.COPY_SRC,
    });
    this.writeStateBufferFor(
      a,
      createInitialState(this.width, this.height, this.preset),
    );
    this.writeStateBufferFor(
      b,
      createInitialState(this.width, this.height, this.preset, 1),
    );
    return [a, b];
  }

  private writeStateBuffer(index: 0 | 1, state: Float32Array) {
    this.writeStateBufferFor(this.buffers[index], state);
  }

  private writeStateBufferFor(buffer: GPUBuffer, state: Float32Array) {
    this.device.queue.writeBuffer(
      buffer,
      0,
      state.buffer,
      state.byteOffset,
      state.byteLength,
    );
  }

  private createComputeBindGroups(): [GPUBindGroup, GPUBindGroup] {
    const layout = this.computePipeline.getBindGroupLayout(0);
    return [
      this.device.createBindGroup({
        layout,
        entries: [
          { binding: 0, resource: { buffer: this.buffers[0] } },
          { binding: 1, resource: { buffer: this.buffers[1] } },
          { binding: 2, resource: { buffer: this.uniformBuffer } },
        ],
      }),
      this.device.createBindGroup({
        layout,
        entries: [
          { binding: 0, resource: { buffer: this.buffers[1] } },
          { binding: 1, resource: { buffer: this.buffers[0] } },
          { binding: 2, resource: { buffer: this.uniformBuffer } },
        ],
      }),
    ];
  }

  private createRenderBindGroups(): [GPUBindGroup, GPUBindGroup] {
    const layout = this.renderPipeline.getBindGroupLayout(0);
    return [
      this.device.createBindGroup({
        layout,
        entries: [
          { binding: 0, resource: { buffer: this.buffers[0] } },
          { binding: 1, resource: { buffer: this.uniformBuffer } },
        ],
      }),
      this.device.createBindGroup({
        layout,
        entries: [
          { binding: 0, resource: { buffer: this.buffers[1] } },
          { binding: 1, resource: { buffer: this.uniformBuffer } },
        ],
      }),
    ];
  }

  private encodeRender(encoder: GPUCommandEncoder) {
    const view = this.context.getCurrentTexture().createView();
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view,
          clearValue: { r: 0.06, g: 0.07, b: 0.07, a: 1 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });
    pass.setPipeline(this.renderPipeline);
    pass.setBindGroup(0, this.renderBindGroups[this.current]);
    pass.draw(3);
    pass.end();
  }

  private writeUniforms() {
    const data = new ArrayBuffer(uniformSize);
    const view = new DataView(data);
    view.setUint32(0, this.width, true);
    view.setUint32(4, this.height, true);
    view.setFloat32(8, this.settings.diffusionU, true);
    view.setFloat32(12, this.settings.diffusionV, true);
    view.setFloat32(16, this.settings.feed, true);
    view.setFloat32(20, this.settings.kill, true);
    view.setFloat32(24, this.settings.timeStep, true);
    view.setFloat32(28, this.brush.active ? this.brush.x : -1000, true);
    view.setFloat32(32, this.brush.active ? this.brush.y : -1000, true);
    view.setFloat32(36, this.brush.radius, true);
    view.setFloat32(40, this.brush.active ? this.brush.strength : 0, true);
    view.setUint32(44, paletteIndex(this.settings.palette), true);
    this.device.queue.writeBuffer(this.uniformBuffer, 0, data);
  }
}

function paletteIndex(palette: PatternSettings["palette"]) {
  if (palette === "reef") return 1;
  if (palette === "ink") return 2;
  if (palette === "topology") return 3;
  return 0;
}
