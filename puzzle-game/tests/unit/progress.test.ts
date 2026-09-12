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
    // win directly via goToPlateRoom + activatePlate + enterPortal
    progress.goToPlateRoom();
    progress.activatePlate();
    progress.enterPortal();
    expect(new PuzzleProgress().won).toBe(true);
  });
});
