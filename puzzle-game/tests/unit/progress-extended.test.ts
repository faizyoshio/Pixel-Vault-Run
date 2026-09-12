import { describe, expect, test, beforeEach } from 'vitest';
import { PuzzleProgress } from '../../src/game/PuzzleProgress';

describe('PuzzleProgress – extended room tracking', () => {
  beforeEach(() => localStorage.clear());

  test('starts in key-room with no plate activation', () => {
    const p = new PuzzleProgress();
    expect(p.currentRoom).toBe('key-room');
    expect(p.plateActivated).toBe(false);
    expect(p.portalOpen).toBe(false);
  });

  test('goToPlateRoom sets currentRoom and persists', () => {
    const p = new PuzzleProgress();
    p.collectKey();
    p.goToPlateRoom();
    expect(p.currentRoom).toBe('plate-room');
    // new instance reads persisted state
    const p2 = new PuzzleProgress();
    expect(p2.currentRoom).toBe('plate-room');
    expect(p2.hasKey).toBe(true);
  });

  test('activatePlate sets plateActivated and portalOpen', () => {
    const p = new PuzzleProgress();
    p.goToPlateRoom();
    p.activatePlate();
    expect(p.plateActivated).toBe(true);
    expect(p.portalOpen).toBe(true);
    const p2 = new PuzzleProgress();
    expect(p2.plateActivated).toBe(true);
    expect(p2.portalOpen).toBe(true);
  });

  test('enterPortal only wins when portalOpen', () => {
    const p = new PuzzleProgress();
    p.goToPlateRoom();
    // plate not active — portal closed
    p.enterPortal();
    expect(p.won).toBe(false);
    // activate plate, then portal
    p.activatePlate();
    p.enterPortal();
    expect(p.won).toBe(true);
  });

  test('reset clears all room/plate/portal state', () => {
    const p = new PuzzleProgress();
    p.goToPlateRoom();
    p.activatePlate();
    p.reset();
    expect(p.currentRoom).toBe('key-room');
    expect(p.plateActivated).toBe(false);
    expect(p.portalOpen).toBe(false);
    expect(p.won).toBe(false);
  });

  test('canExit still requires key', () => {
    const p = new PuzzleProgress();
    p.goToPlateRoom();
    // in plate room, canExit should still require key
    expect(p.canExit()).toBe(false);
    p.collectKey();
    expect(p.canExit()).toBe(true);
  });
});
