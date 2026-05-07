import { Github, Heart } from 'lucide-react';
import { buildInfo } from './generated/buildInfo';

export function App() {
  return (
    <main className="min-h-screen bg-ink text-paper">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-cyan">Gray-Scott Lab</p>
          <h1 className="text-2xl font-semibold">Reaction Diffusion Patternmaker</h1>
        </div>
        <nav className="flex items-center gap-2">
          <a className="icon-link" href={buildInfo.repoUrl} rel="noreferrer" target="_blank">
            <Github size={18} />
            <span>Star on GitHub</span>
          </a>
          <a className="icon-link" href={buildInfo.paypalUrl} rel="noreferrer" target="_blank">
            <Heart size={18} />
            <span>PayPal</span>
          </a>
        </nav>
      </header>
      <section className="mx-auto grid max-w-6xl gap-5 px-5 py-8">
        <div className="rounded border border-white/10 bg-white/[0.04] p-5">
          <p className="max-w-2xl text-lg text-white/80">
            Live WebGPU pattern synthesis, audio mapping, and export controls are being wired in
            now.
          </p>
          <p className="mt-4 text-sm text-white/60">
            Version {buildInfo.version} · Commit {buildInfo.sourceCommit}
          </p>
        </div>
      </section>
    </main>
  );
}
