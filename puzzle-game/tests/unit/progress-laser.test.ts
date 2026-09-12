import { beforeEach, describe, expect, test } from 'vitest';
import { PuzzleProgress } from '../../src/game/PuzzleProgress';

describe('PuzzleProgress – laser room tracking', () => {
  beforeEach(() => localStorage.clear());

  test('goToLaserRoom sets currentRoom and persists', () => {
    const p = new PuzzleProgress();
    p.goToLaserRoom();
    expect(p.currentRoom).toBe('laser-room');
    expect(new PuzzleProgress().currentRoom).toBe('laser-room');
  });

  test('starts with mirrors at zero-degree snaps and target unhit', () => {
    const p = new PuzzleProgress();
    expect(p.mirror1Angle).toBe(0);
    expect(p.mirror2Angle).toBe(0);
    expect(p.targetHit).toBe(false);
  });

  test('rotateMirror advances selected mirror in bounded 90-degree snaps', () => {
    const p = new PuzzleProgress();
    p.rotateMirror(1);
    expect(p.mirror1Angle).toBe(90);
    for (let i = 0; i < 3; i++) p.rotateMirror(1);
    expect(p.mirror1Angle).toBe(0);
    p.rotateMirror(2);
    expect(new PuzzleProgress().mirror2Angle).toBe(90);
  });

  test('persists mirror angles and solved target state', () => {
    const p = new PuzzleProgress();
    p.goToLaserRoom();
    p.rotateMirror(1);
    p.rotateMirror(2);
    p.hitTarget();
    const restored = new PuzzleProgress();
    expect(restored.currentRoom).toBe('laser-room');
    expect(restored.mirror1Angle).toBe(90);
    expect(restored.mirror2Angle).toBe(90);
    expect(restored.targetHit).toBe(true);
  });

  test('final exit only wins after target hit', () => {
    const p = new PuzzleProgress();
    p.useFinalExit();
    expect(p.won).toBe(false);
    p.hitTarget();
    p.useFinalExit();
    expect(p.won).toBe(true);
  });

  test('reset clears laser state', () => {
    const p = new PuzzleProgress();
    p.goToLaserRoom();
    p.rotateMirror(1);
    p.hitTarget();
    p.reset();
    expect(p.currentRoom).toBe('key-room');
    expect(p.mirror1Angle).toBe(0);
    expect(p.targetHit).toBe(false);
  });
});
