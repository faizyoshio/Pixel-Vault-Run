import { describe, expect, test, beforeEach } from 'vitest';
import { PuzzleProgress } from '../../src/game/PuzzleProgress';

describe('PuzzleProgress', () => {
  beforeEach(() => localStorage.clear());

  test('collecting key unlocks exit and persists win', () => {
    const progress = new PuzzleProgress();
    expect(progress.canExit()).toBe(false);
    progress.collectKey();
    expect(progress.canExit()).toBe(true);
    progress.enterPortal(); // win via portal (portal open requires plate, so no win here)
    expect(new PuzzleProgress().won).toBe(false);
    // portal leads to the laser room; the final exit requires target power
    progress.goToPlateRoom();
    progress.activatePlate();
    progress.goToLaserRoom();
    progress.hitTarget();
    progress.useFinalExit();
    expect(new PuzzleProgress().won).toBe(true);
  });
});
