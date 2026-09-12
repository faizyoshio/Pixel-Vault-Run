import { describe, test, expect, vi, afterEach } from 'vitest';
import { flash } from '../../src/ui/feedback';

describe('flash visual feedback', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test('flash applies the event color and clears itself', () => {
    vi.useFakeTimers();
    const el = document.createElement('div');
    flash(el, '#ffcc33');
    expect(el.classList.contains('game-flash')).toBe(true);
    expect(el.style.backgroundColor).toBe('rgb(255, 204, 51)');
    vi.advanceTimersByTime(400);
    expect(el.classList.contains('game-flash')).toBe(false);
  });

  test('flash re-triggering while active restarts the timer', () => {
    vi.useFakeTimers();
    const el = document.createElement('div');
    flash(el, '#ffcc33');
    vi.advanceTimersByTime(200);
    flash(el, '#40e878');
    vi.advanceTimersByTime(250);
    expect(el.classList.contains('game-flash')).toBe(true);
    vi.advanceTimersByTime(250);
    expect(el.classList.contains('game-flash')).toBe(false);
  });
});