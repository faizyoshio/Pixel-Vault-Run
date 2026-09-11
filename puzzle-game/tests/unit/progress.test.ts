import { describe, expect, test, beforeEach } from 'vitest';
import { PuzzleProgress } from '../../src/game/PuzzleProgress';

describe('PuzzleProgress', () => {
  beforeEach(() => localStorage.clear());

  test('collecting key unlocks exit and persists win', () => {
    const progress = new PuzzleProgress();
    expect(progress.canExit()).toBe(false);
    progress.collectKey();
    expect(progress.canExit()).toBe(true);
    progress.win();
    expect(new PuzzleProgress().won).toBe(true);
  });
});
