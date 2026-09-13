import { describe, expect, test } from 'vitest';
import { GameEngine } from '../../src/engine/engine';

describe('GameEngine', () => {
  test('initializes with default state', () => {
    const engine = new GameEngine();
    expect(engine.lives).toBe(3);
    expect(engine.score).toBe(0);
    expect(engine.levelIndex).toBe(0);
    expect(engine.state).toBe('menu');
  });

  test('resets to playing state with fresh stats', () => {
    const engine = new GameEngine();
    engine.score = 500;
    engine.lives = 1;
    engine.reset();
    expect(engine.lives).toBe(3);
    expect(engine.score).toBe(0);
    expect(engine.state).toBe('playing');
  });

  test('loads level correctly', () => {
    const engine = new GameEngine();
    let loadedIndex = -1;
    engine.onLevelLoad = (idx) => { loadedIndex = idx; };
    engine.loadLevel(1);
    expect(engine.levelIndex).toBe(1);
    expect(engine.state).toBe('playing');
    expect(loadedIndex).toBe(1);
  });
});