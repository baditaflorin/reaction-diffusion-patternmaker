import {
  Activity,
  AudioLines,
  Download,
  Github,
  Heart,
  Pause,
  Play,
  RotateCcw,
  Shuffle,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastRail, type ToastMessage } from "./components/ToastRail";
import { SonificationEngine } from "./features/audio/SonificationEngine";
import {
  PatternCanvas,
  type PatternCanvasHandle,
} from "./features/patterns/PatternCanvas";
import {
  DEFAULT_SETTINGS,
  applyPresetToSettings,
} from "./features/patterns/settings";
import type {
  EngineMode,
  PaletteId,
  PatternMetrics,
  PatternSettings,
  Resolution,
} from "./features/patterns/types";
import { PALETTES, PRESETS, getPresetById } from "./features/patterns/presets";
import { ThreePreview } from "./features/preview/ThreePreview";
import { useLatestCommit } from "./features/runtime/useLatestCommit";
import { loadSettings, saveSettings } from "./features/storage/settingsStorage";
import { buildInfo } from "./generated/buildInfo";

const resolutionOptions: Resolution[] = [256, 384, 512, 768];

export function App() {
  const [settings, setSettings] = useState<PatternSettings>(
    () => loadSettings() ?? DEFAULT_SETTINGS,
  );
  const [metrics, setMetrics] = useState<PatternMetrics>({
    density: 0,
    edgeDensity: 0,
    entropy: 0,
    contrast: 0,
    centroidX: 0.5,
    centroidY: 0.5,
    regionEstimate: 0,
  });
  const [engineMode, setEngineMode] = useState<EngineMode>("cpu");
  const [sourceCanvas, setSourceCanvas] = useState<HTMLCanvasElement | null>(
    null,
  );
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [audioEngine] = useState(() => new SonificationEngine());
  const patternRef = useRef<PatternCanvasHandle | null>(null);
  const latestCommit = useLatestCommit();

  const selectedPreset = useMemo(
    () => getPresetById(settings.presetId),
    [settings.presetId],
  );
  const visibleCommit =
    latestCommit.data?.slice(0, 7) ?? buildInfo.sourceCommit;

  const pushToast = useCallback((kind: ToastMessage["kind"], text: string) => {
    const toast = { id: crypto.randomUUID(), kind, text };
    setToasts((items) => [...items.slice(-2), toast]);
    window.setTimeout(() => {
      setToasts((items) => items.filter((item) => item.id !== toast.id));
    }, 3600);
  }, []);

  const updateSettings = useCallback((patch: Partial<PatternSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const selectPreset = useCallback(
    (presetId: string) => {
      const preset = getPresetById(presetId);
      const next = applyPresetToSettings(settings, preset);
      setSettings(next);
      saveSettings(next);
      pushToast("info", `${preset.name} preset loaded`);
    },
    [pushToast, settings],
  );

  const toggleAudio = useCallback(async () => {
    try {
      const next = !settings.audioEnabled;
      if (next) {
        await audioEngine.start();
        pushToast("success", "Audio sonification enabled");
      } else {
        audioEngine.stop();
      }
      updateSettings({ audioEnabled: next });
    } catch {
      pushToast("error", "Audio could not start in this browser");
    }
  }, [audioEngine, pushToast, settings.audioEnabled, updateSettings]);

  const handleMetrics = useCallback(
    (next: PatternMetrics) => {
      setMetrics(next);
      if (settings.audioEnabled) {
        audioEngine.update(next, settings);
      }
    },
    [audioEngine, settings],
  );

  const exportTexture = useCallback(
    async (kind: "color" | "heightmap") => {
      try {
        await patternRef.current?.exportImage(kind);
        pushToast(
          "success",
          kind === "color" ? "Texture PNG exported" : "Heightmap PNG exported",
        );
      } catch {
        pushToast("error", "Export failed");
      }
    },
    [pushToast],
  );

  const handleRendererError = useCallback(
    (message: string) => {
      pushToast("error", message);
    },
    [pushToast],
  );

  return (
    <ErrorBoundary>
      <main className="app-shell">
        <header className="topbar">
          <div className="brand-lockup">
            <Sparkles size={20} aria-hidden="true" />
            <div>
              <h1>Reaction Diffusion Patternmaker</h1>
              <p>
                v{buildInfo.version} · commit {visibleCommit}
              </p>
            </div>
          </div>
          <nav className="topbar-actions" aria-label="Project links">
            <a
              className="tool-button"
              href={buildInfo.repoUrl}
              rel="noreferrer"
              target="_blank"
            >
              <Github size={18} />
              <span>Star</span>
            </a>
            <a
              className="tool-button"
              href={buildInfo.paypalUrl}
              rel="noreferrer"
              target="_blank"
            >
              <Heart size={18} />
              <span>PayPal</span>
            </a>
          </nav>
        </header>

        <section
          className="workbench"
          aria-label="Reaction diffusion workspace"
        >
          <aside className="control-rail" aria-label="Pattern controls">
            <section className="panel-section">
              <div className="section-heading">
                <Activity size={17} aria-hidden="true" />
                <h2>Presets</h2>
              </div>
              <div className="preset-grid" role="list">
                {PRESETS.map((preset) => (
                  <button
                    className={
                      preset.id === settings.presetId
                        ? "preset-tile is-active"
                        : "preset-tile"
                    }
                    key={preset.id}
                    onClick={() => selectPreset(preset.id)}
                    type="button"
                  >
                    <span>{preset.name}</span>
                    <small>{preset.signature}</small>
                  </button>
                ))}
              </div>
            </section>

            <section className="panel-section">
              <div className="section-heading">
                <Shuffle size={17} aria-hidden="true" />
                <h2>Simulation</h2>
              </div>
              <Slider
                label="Feed"
                max={0.08}
                min={0.01}
                onChange={(feed) => updateSettings({ feed })}
                step={0.0005}
                value={settings.feed}
              />
              <Slider
                label="Kill"
                max={0.08}
                min={0.035}
                onChange={(kill) => updateSettings({ kill })}
                step={0.0005}
                value={settings.kill}
              />
              <Slider
                label="Speed"
                max={12}
                min={1}
                onChange={(iterationsPerFrame) =>
                  updateSettings({ iterationsPerFrame })
                }
                step={1}
                value={settings.iterationsPerFrame}
              />
              <Slider
                label="Brush"
                max={42}
                min={6}
                onChange={(brushRadius) => updateSettings({ brushRadius })}
                step={1}
                value={settings.brushRadius}
              />
            </section>

            <section className="panel-section">
              <div className="segmented" aria-label="Resolution">
                {resolutionOptions.map((resolution) => (
                  <button
                    className={
                      settings.resolution === resolution ? "is-active" : ""
                    }
                    key={resolution}
                    onClick={() => updateSettings({ resolution })}
                    type="button"
                  >
                    {resolution}
                  </button>
                ))}
              </div>
              <label className="field-label" htmlFor="palette">
                Palette
              </label>
              <select
                className="select-input"
                id="palette"
                onChange={(event) =>
                  updateSettings({ palette: event.target.value as PaletteId })
                }
                value={settings.palette}
              >
                {PALETTES.map((palette) => (
                  <option key={palette.id} value={palette.id}>
                    {palette.name}
                  </option>
                ))}
              </select>
            </section>
          </aside>

          <section className="stage-column" aria-label="Live pattern">
            <div className="stage-toolbar">
              <div className="mode-chip" data-mode={engineMode}>
                {engineMode === "webgpu" ? "WebGPU compute" : "CPU fallback"}
              </div>
              <div className="transport">
                <button
                  className="icon-button"
                  onClick={() => updateSettings({ running: !settings.running })}
                  title={settings.running ? "Pause" : "Play"}
                  type="button"
                >
                  {settings.running ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <button
                  className="icon-button"
                  onClick={() => patternRef.current?.reseed()}
                  title="Randomize seed"
                  type="button"
                >
                  <Shuffle size={18} />
                </button>
                <button
                  className="icon-button"
                  onClick={() => selectPreset(settings.presetId)}
                  title="Reset preset"
                  type="button"
                >
                  <RotateCcw size={18} />
                </button>
                <button
                  className="icon-button"
                  onClick={toggleAudio}
                  title={settings.audioEnabled ? "Mute" : "Enable audio"}
                  type="button"
                >
                  {settings.audioEnabled ? (
                    <Volume2 size={18} />
                  ) : (
                    <VolumeX size={18} />
                  )}
                </button>
              </div>
            </div>
            <PatternCanvas
              onCanvasReady={setSourceCanvas}
              onEngineMode={setEngineMode}
              onError={handleRendererError}
              onMetrics={handleMetrics}
              preset={selectedPreset}
              ref={patternRef}
              settings={settings}
            />
          </section>

          <aside className="output-rail" aria-label="Metrics and exports">
            <section className="panel-section">
              <div className="section-heading">
                <AudioLines size={17} aria-hidden="true" />
                <h2>Morphology</h2>
              </div>
              <Metric label="Density" value={metrics.density} />
              <Metric label="Edges" value={metrics.edgeDensity} />
              <Metric label="Entropy" value={metrics.entropy} />
              <Metric
                label="Regions"
                value={Math.min(metrics.regionEstimate / 120, 1)}
              />
            </section>

            <section className="preview-section">
              <ThreePreview sourceCanvas={sourceCanvas} />
            </section>

            <section className="panel-section export-actions">
              <button
                className="primary-button"
                onClick={() => exportTexture("color")}
                type="button"
              >
                <Download size={18} />
                <span>PNG texture</span>
              </button>
              <button
                className="secondary-button"
                onClick={() => exportTexture("heightmap")}
                type="button"
              >
                <Download size={18} />
                <span>Heightmap</span>
              </button>
            </section>
          </aside>
        </section>

        <ToastRail messages={toasts} />
      </main>
    </ErrorBoundary>
  );
}

function Slider({
  label,
  max,
  min,
  onChange,
  step,
  value,
}: {
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  step: number;
  value: number;
}) {
  return (
    <label className="slider-row">
      <span>
        {label}
        <strong>
          {Number.isInteger(step) ? value.toFixed(0) : value.toFixed(4)}
        </strong>
      </span>
      <input
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        step={step}
        type="range"
        value={value}
      />
    </label>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  const width = `${Math.round(Math.max(0.02, Math.min(value, 1)) * 100)}%`;
  return (
    <div className="metric-row">
      <div>
        <span>{label}</span>
        <strong>{Math.round(value * 1000) / 1000}</strong>
      </div>
      <i style={{ width }} />
    </div>
  );
}
