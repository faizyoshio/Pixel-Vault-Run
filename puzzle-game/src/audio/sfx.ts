export const SFX_EVENT = {
  key: 660,
  plate: 330,
  mirror: 520,
  target: 880,
  win: 0,
} as const;
export type SFX_EVENT = keyof typeof SFX_EVENT;

type CtxFactory = () => AudioContext;

/**
 * Procedural Web Audio SFX. Lazy: creates the AudioContext only on unlock() so
 * the browser's autoplay policy is satisfied by the first user click.
 */
export class Sfx {
  private ctx: AudioContext | null = null;

  constructor(private factory: CtxFactory = () => new AudioContext()) {}

  unlock(): void {
    if (!this.ctx) this.ctx = this.factory();
  }

  play(event: SFX_EVENT): void {
    if (!this.ctx) return; // silent until first user gesture unlocks audio
    const base = SFX_EVENT[event];
    const notes = base === 0 ? [523.25, 659.25, 783.99, 1046.5] : [base];
    notes.forEach((freq, i) => this.note(freq, this.ctx!.currentTime + i * 0.09));
  }

  private note(freq: number, when: number): void {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(freq, when);
    osc.type = 'square';
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(0.12, when + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(when);
    osc.stop(when + 0.32);
  }
}