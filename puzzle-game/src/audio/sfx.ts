export class Sfx {
  private ctx: AudioContext | null = null;
  private unlockPromise: Promise<void> | null = null;
  
  unlock(): void {
    if (this.ctx) return;
    try {
      const AC = (window as unknown as { AudioContext: typeof AudioContext }).AudioContext;
      this.ctx = new AC();
    } catch {
      this.ctx = null;
    }
  }
  
  private get ready(): boolean {
    return !!this.ctx && this.ctx.state === 'running';
  }
  
  private playTone(freq: number, duration: number, type: OscillatorType = 'square', volume = 0.15): void {
    if (!this.ready) return;
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }
  
  play(name: 'jump' | 'coin' | 'stomp' | 'hurt' | 'win'): void {
    switch (name) {
      case 'jump': this.playTone(440, 0.12, 'square', 0.1); break;
      case 'coin': this.playTone(880, 0.1, 'square', 0.12); break;
      case 'stomp': this.playTone(220, 0.15, 'sawtooth', 0.12); break;
      case 'hurt': this.playTone(150, 0.2, 'sawtooth', 0.12); break;
      case 'win':
        this.playTone(523, 0.12, 'square', 0.12);
        setTimeout(() => this.playTone(659, 0.12, 'square', 0.12), 120);
        setTimeout(() => this.playTone(784, 0.2, 'square', 0.12), 240);
        break;
    }
  }
}