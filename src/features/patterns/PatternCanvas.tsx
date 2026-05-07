import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { analyzePattern } from "./analysis";
import { CpuGrayScottEngine } from "./CpuGrayScottEngine";
import { downloadImageData, makeExportImage } from "./exportTexture";
import type {
  PatternEngine,
  PatternMetrics,
  PatternPreset,
  PatternSettings,
} from "./types";
import { createWebGpuGrayScottEngine } from "./WebGpuGrayScottEngine";

export type PatternCanvasHandle = {
  exportImage: (kind: "color" | "heightmap") => Promise<void>;
  reseed: () => void;
};

type Props = {
  settings: PatternSettings;
  preset: PatternPreset;
  onMetrics: (metrics: PatternMetrics) => void;
  onEngineMode: (mode: PatternEngine["mode"]) => void;
  onCanvasReady: (canvas: HTMLCanvasElement | null) => void;
  onError: (message: string) => void;
};

export const PatternCanvas = forwardRef<PatternCanvasHandle, Props>(
  function PatternCanvas(
    { settings, preset, onMetrics, onEngineMode, onCanvasReady, onError },
    ref,
  ) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const engineRef = useRef<PatternEngine | null>(null);
    const settingsRef = useRef(settings);
    const presetRef = useRef(preset);
    const metricsBusyRef = useRef(false);
    const [engineReady, setEngineReady] = useState(false);

    settingsRef.current = settings;
    presetRef.current = preset;

    useImperativeHandle(
      ref,
      () => ({
        exportImage: async (kind) => {
          const engine = engineRef.current;
          if (!engine) throw new Error("Engine unavailable");
          const snapshot = await engine.snapshot();
          const imageData = makeExportImage(
            snapshot,
            settingsRef.current.palette,
            kind,
          );
          const stamp = new Date().toISOString().replace(/[:.]/g, "-");
          await downloadImageData(
            imageData,
            `reaction-diffusion-${kind}-${stamp}.png`,
            2,
          );
        },
        reseed: () => {
          engineRef.current?.reseed(presetRef.current);
        },
      }),
      [],
    );

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return undefined;
      const targetCanvas = canvas;

      let cancelled = false;
      setEngineReady(false);
      onCanvasReady(canvas);

      async function boot() {
        engineRef.current?.dispose();
        try {
          const gpu = await createWebGpuGrayScottEngine(
            targetCanvas,
            settingsRef.current,
            presetRef.current,
          );
          if (cancelled) {
            gpu.dispose();
            return;
          }
          engineRef.current = gpu;
          onEngineMode("webgpu");
        } catch {
          if (cancelled) return;
          try {
            const cpu = new CpuGrayScottEngine(
              targetCanvas,
              settingsRef.current,
              presetRef.current,
            );
            engineRef.current = cpu;
            onEngineMode("cpu");
            onError("WebGPU unavailable; CPU fallback is running");
          } catch {
            onError("Pattern renderer could not start");
          }
        } finally {
          if (!cancelled) setEngineReady(true);
        }
      }

      void boot();

      return () => {
        cancelled = true;
        engineRef.current?.dispose();
        engineRef.current = null;
        onCanvasReady(null);
      };
    }, [onCanvasReady, onEngineMode, onError]);

    useEffect(() => {
      engineRef.current?.setSettings(settings);
    }, [settings]);

    useEffect(() => {
      engineRef.current?.reseed(preset);
    }, [preset]);

    useEffect(() => {
      let animation = 0;
      let lastMetrics = 0;

      const loop = (now: number) => {
        const engine = engineRef.current;
        if (engine && engineReady) {
          if (settingsRef.current.running) {
            engine.step(settingsRef.current.iterationsPerFrame);
          } else {
            engine.render();
          }

          if (now - lastMetrics > 260 && !metricsBusyRef.current) {
            metricsBusyRef.current = true;
            lastMetrics = now;
            engine
              .snapshot()
              .then((snapshot) => onMetrics(analyzePattern(snapshot, 6)))
              .catch(() => undefined)
              .finally(() => {
                metricsBusyRef.current = false;
              });
          }
        }
        animation = window.requestAnimationFrame(loop);
      };

      animation = window.requestAnimationFrame(loop);
      return () => window.cancelAnimationFrame(animation);
    }, [engineReady, onMetrics]);

    const updateBrush = (
      event: ReactPointerEvent<HTMLCanvasElement>,
      active: boolean,
    ) => {
      const canvas = canvasRef.current;
      const engine = engineRef.current;
      if (!canvas || !engine) return;
      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
      const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
      engine.setBrush({
        active,
        x,
        y,
        radius: settingsRef.current.brushRadius,
        strength: 0.38,
      });
    };

    return (
      <div className="pattern-frame">
        <canvas
          aria-label="Live Gray-Scott reaction diffusion simulation"
          className="pattern-canvas"
          onPointerCancel={(event) => updateBrush(event, false)}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            updateBrush(event, true);
          }}
          onPointerLeave={(event) => updateBrush(event, false)}
          onPointerMove={(event) => updateBrush(event, event.buttons > 0)}
          onPointerUp={(event) => updateBrush(event, false)}
          ref={canvasRef}
        />
      </div>
    );
  },
);
