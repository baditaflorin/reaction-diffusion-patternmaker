import type { PatternMetrics, PatternSettings } from "../patterns/types";

type Voice = {
  oscillator: OscillatorNode;
  gain: GainNode;
};

const scale = [0, 2, 3, 5, 7, 10, 12, 14, 15, 17, 19, 22];

export class SonificationEngine {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private delay: DelayNode | null = null;
  private voices: Voice[] = [];
  private enabled = false;

  async start() {
    if (!this.context) {
      const context = new AudioContext();
      const master = context.createGain();
      const filter = context.createBiquadFilter();
      const delay = context.createDelay(0.45);
      const feedback = context.createGain();

      master.gain.value = 0;
      filter.type = "lowpass";
      filter.frequency.value = 1200;
      delay.delayTime.value = 0.18;
      feedback.gain.value = 0.18;

      filter.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(master);
      filter.connect(master);
      master.connect(context.destination);

      this.context = context;
      this.master = master;
      this.filter = filter;
      this.delay = delay;
      this.voices = [0, 1, 2, 3].map((index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = index % 2 === 0 ? "sine" : "triangle";
        oscillator.frequency.value = 110 * (index + 1);
        gain.gain.value = 0;
        oscillator.connect(gain);
        gain.connect(filter);
        oscillator.start();
        return { oscillator, gain };
      });
    }

    await this.context.resume();
    this.enabled = true;
    this.master?.gain.cancelScheduledValues(this.context.currentTime);
    this.master?.gain.linearRampToValueAtTime(
      0.09,
      this.context.currentTime + 0.2,
    );
  }

  stop() {
    if (!this.context || !this.master) return;
    this.enabled = false;
    this.master.gain.cancelScheduledValues(this.context.currentTime);
    this.master.gain.linearRampToValueAtTime(
      0,
      this.context.currentTime + 0.18,
    );
  }

  update(metrics: PatternMetrics, settings: PatternSettings) {
    if (!this.context || !this.enabled) return;
    const now = this.context.currentTime;
    const root =
      38 + Math.round(metrics.centroidX * 10) + Math.round(settings.feed * 180);
    const spread = 1 + Math.round(metrics.edgeDensity * 4);
    const brightness = 500 + metrics.entropy * 2600 + metrics.contrast * 800;
    this.filter?.frequency.exponentialRampToValueAtTime(
      Math.max(120, brightness),
      now + 0.08,
    );
    if (this.delay) {
      this.delay.delayTime.linearRampToValueAtTime(
        0.08 + metrics.centroidY * 0.2,
        now + 0.15,
      );
    }

    this.voices.forEach((voice, index) => {
      const note =
        root +
        scale[
          (index * spread + Math.floor(metrics.density * 7)) % scale.length
        ];
      const frequency = 440 * 2 ** ((note - 69) / 12);
      const gain =
        0.012 +
        metrics.edgeDensity * 0.018 +
        (index === 0 ? metrics.density * 0.012 : 0);
      voice.oscillator.frequency.exponentialRampToValueAtTime(
        frequency,
        now + 0.08,
      );
      voice.gain.gain.linearRampToValueAtTime(gain, now + 0.08);
    });
  }
}
