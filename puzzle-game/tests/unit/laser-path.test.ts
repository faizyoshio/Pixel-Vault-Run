import { describe, expect, test } from 'vitest';
import { traceLaser } from '../../src/game/laserPath';

describe('traceLaser', () => {
  test('reflects through both mirrors before hitting the target', () => {
    const path = traceLaser(0, 270);
    expect(path.reflections).toBe(2);
    expect(path.targetHit).toBe(true);
    expect(path.points).toHaveLength(4);
  });

  test('stops at max reflections when mirrors form a loop', () => {
    const path = traceLaser(0, 0, 1);
    expect(path.reflections).toBeLessThanOrEqual(1);
  });

  test('misses target for an unsolved mirror angle', () => {
    expect(traceLaser(90, 270).targetHit).toBe(false);
  });
});
