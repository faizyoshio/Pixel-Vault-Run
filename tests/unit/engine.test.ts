import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EngineCore } from '../../src/engine/core';
import { GameObject } from '../../src/lib/types';

describe('EngineCore', () => {
  let engine: EngineCore;

  beforeEach(() => {
    engine = new EngineCore();
  });

  it('initializes in stopped state', () => {
    expect(engine.isRunning()).toBe(false);
  });

  it('manages game objects lifecycle', () => {
    const mockUpdate = vi.fn();
    const mockDispose = vi.fn();
    const obj: GameObject = {
      id: 'test-obj',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      visible: true,
      update: mockUpdate,
      dispose: mockDispose,
    };

    engine.addGameObject(obj);
    engine.removeGameObject(obj);
    engine.dispose();

    expect(mockDispose).not.toHaveBeenCalled(); // obj removed before dispose

    engine.addGameObject(obj);
    engine.dispose();
    expect(mockDispose).toHaveBeenCalledTimes(1);
  });
});