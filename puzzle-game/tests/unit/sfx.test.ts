import { describe, test, expect, vi } from 'vitest';
import { Sfx, SFX_EVENT } from '../../src/audio/sfx';

type FakeOsc = {
  frequency: { value: number; setValueAtTime: (v: number, t: number) => void };
  connect: () => void;
  start: () => void;
  stop: () => void;
};

interface FakeAudioContext extends AudioContext {
  oscFreqs: number[];
  gainRamps: number[];
}

function makeFakeCtx(): FakeAudioContext {
  const oscFreqs: number[] = [];
  const gainRamps: number[] = [];
  const ctx = {
    currentTime: 0,
    destination: {} as AudioDestinationNode,
    oscFreqs,
    gainRamps,
    createOscillator(): FakeOsc {
      const osc: FakeOsc = {
        frequency: {
          value: 0,
          setValueAtTime(v: number) {
            this.value = v;
            oscFreqs.push(v);
          },
        },
        connect: () => undefined,
        start: () => undefined,
        stop: () => undefined,
      };
      return osc;
    },
    createGain() {
      const gain = {
        gain: {
          setValueAtTime: (_v: number, _t: number) => {},
          exponentialRampToValueAtTime(_v: number, _t: number) {
            gainRamps.push(1);
          },
        },
        connect: () => undefined,
      };
      return gain as unknown as GainNode;
    },
  } as unknown as FakeAudioContext;
  return ctx;
}

describe('Sfx procedural audio', () => {
  test('no AudioContext is created and play is a safe no-op before unlock', () => {
    const factory = vi.fn(makeFakeCtx);
    const sfx = new Sfx(factory);
    sfx.play('key');
    expect(factory).not.toHaveBeenCalled();
  });

  test('unlock creates the AudioContext exactly once across repeated calls', () => {
    const factory = vi.fn(makeFakeCtx);
    const sfx = new Sfx(factory);
    sfx.unlock();
    sfx.unlock();
    sfx.unlock();
    expect(factory).toHaveBeenCalledTimes(1);
  });

  test('every SFX event maps to a distinct deterministic frequency', () => {
    const ctx = makeFakeCtx();
    const sfx = new Sfx(() => ctx);
    sfx.unlock();
    const seen = new Set<string>();
    for (const name of Object.keys(SFX_EVENT) as SFX_EVENT[]) {
      const before = ctx.oscFreqs.length;
      sfx.play(name);
      const freqs = ctx.oscFreqs.slice(before).join(',');
      expect(freqs.length).toBeGreaterThan(0);
      seen.add(freqs);
    }
    expect(seen.size).toBe(Object.keys(SFX_EVENT).length);
  });

  test('play schedules a gain envelope (attack and release) for audible fade', () => {
    const ctx = makeFakeCtx();
    const sfx = new Sfx(() => ctx);
    sfx.unlock();
    sfx.play('plate');
    expect(ctx.gainRamps.length).toBeGreaterThanOrEqual(2);
  });

  test('win event plays more than one note (arpeggio)', () => {
    const ctx = makeFakeCtx();
    const sfx = new Sfx(() => ctx);
    sfx.unlock();
    const before = ctx.oscFreqs.length;
    sfx.play('win');
    expect(ctx.oscFreqs.slice(before).length).toBeGreaterThan(1);
  });
});