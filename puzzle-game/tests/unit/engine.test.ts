import { describe, it, expect } from 'vitest';
import {
  createPlayer,
  parseLevel,
  aabbOverlap,
  updateGravity,
  updatePlayerHorizontal,
  tryJump,
  updateCoyoteAndJumpBuffer,
  resolveXCollision,
  resolveYCollision,
  isStomp,
  stompEnemy,
  collectCoin,
  checkLevelWin,
  createDefaultLevels,
  findPlayerStart,
  findCoins,
  findEnemies,
  killPlayer,
  COYOTE_TIME,
} from '../../src/game/engine';

describe('Engine - Physics', () => {
  it('gravity accelerates player downward', () => {
    const p = createPlayer(100, 100);
    updateGravity(p, false);
    expect(p.vel.y).toBe(0.45);
  });

  it('jump sets upward velocity', () => {
    const p = createPlayer(100, 100);
    p.onGround = true;
    const jumped = tryJump(p);
    expect(jumped).toBe(true);
    expect(p.vel.y).toBe(-7.5);
    expect(p.onGround).toBe(false);
  });

  it('player respects max fall speed', () => {
    const p = createPlayer(100, 100);
    p.vel.y = 100;
    updateGravity(p, false);
    expect(p.vel.y).toBe(8);
  });
});

describe('Engine - Collision', () => {
  it('aabbOverlap detects overlapping boxes', () => {
    expect(aabbOverlap({ x: 0, y: 0, w: 10, h: 10 }, { x: 5, y: 5, w: 10, h: 10 })).toBe(true);
    expect(aabbOverlap({ x: 0, y: 0, w: 10, h: 10 }, { x: 15, y: 15, w: 10, h: 10 })).toBe(false);
  });

  it('resolveXCollision pushes player out of walls', () => {
    const level = parseLevel(['##', '##']);
    const p = createPlayer(14, 0);
    p.vel.x = 5;
    resolveXCollision(p, level);
    expect(p.pos.x).toBe(4);
    expect(p.vel.x).toBe(0);
  });

  it('resolveYCollision lands player on platforms', () => {
    const level = parseLevel(['##', '##']);
    const p = createPlayer(0, 0);
    p.vel.y = 5;
    p.pos.y = 10;
    resolveYCollision(p, level);
    expect(p.onGround).toBe(true);
    expect(p.vel.y).toBe(0);
  });
});

describe('Engine - Stomp Detection', () => {
  it('detects stomp when player falls onto enemy top', () => {
    const p = createPlayer(0, 30);
    p.vel.y = 2;
    const e = {
      pos: { x: 0, y: 40 },
      vel: { x: 0, y: 0 },
      width: 14,
      height: 14,
      patrolLeft: 0,
      patrolRight: 50,
      speed: 1,
      dead: false,
    };
    expect(isStomp(p, e)).toBe(true);
  });

  it('stompEnemy marks enemy dead and awards score', () => {
    const p = createPlayer(0, 0);
    const e = {
      pos: { x: 0, y: 0 },
      vel: { x: 0, y: 0 },
      width: 14,
      height: 14,
      patrolLeft: 0,
      patrolRight: 50,
      speed: 1,
      dead: false,
    };
    stompEnemy(p, e);
    expect(e.dead).toBe(true);
    expect(p.score).toBe(200);
  });
});

describe('Engine - Coin Pickup', () => {
  it('collects coin on overlap and awards points', () => {
    const p = createPlayer(0, 0);
    const coin = { pos: { x: 0, y: 0 }, collected: false, width: 10, height: 10 };
    const result = collectCoin(p, coin);
    expect(result).toBe(true);
    expect(coin.collected).toBe(true);
    expect(p.score).toBe(100);
  });

  it('extra life awarded at score threshold 1000', () => {
    const p = createPlayer(0, 0);
    p.score = 900;
    p.lives = 3;
    const coin = { pos: { x: 0, y: 0 }, collected: false, width: 10, height: 10 };
    collectCoin(p, coin);
    expect(p.score).toBe(1000);
    expect(p.lives).toBe(4);
  });
});

describe('Engine - Level Win', () => {
  it('detects flag reach', () => {
    const level = parseLevel(['F']);
    const p = createPlayer(0, 0);
    expect(checkLevelWin(p, level)).toBe(true);
  });
});

describe('Engine - Coyote Time & Jump Buffer', () => {
  it('coyote timer decrements', () => {
    const p = createPlayer(0, 0);
    p.coyoteTimer = COYOTE_TIME;
    updateCoyoteAndJumpBuffer(p);
    expect(p.coyoteTimer).toBe(COYOTE_TIME - 1);
  });
});

describe('Engine - Lives & Death', () => {
  it('killPlayer reduces lives and marks dead', () => {
    const p = createPlayer(0, 0);
    expect(p.lives).toBe(3);
    killPlayer(p);
    expect(p.dead).toBe(true);
    expect(p.lives).toBe(2);
  });
});

describe('Engine - Level Data', () => {
  it('createDefaultLevels returns 3 levels', () => {
    const levels = createDefaultLevels();
    expect(levels.length).toBe(3);
  });

  it('findPlayerStart finds P position', () => {
    const level = parseLevel(['  P ']);
    const start = findPlayerStart(level);
    expect(start.x).toBe(32);
    expect(start.y).toBe(0);
  });

  it('findCoins extracts coins', () => {
    const level = parseLevel(['C C']);
    const coins = findCoins(level);
    expect(coins.length).toBe(2);
  });

  it('findEnemies extracts enemies', () => {
    const level = parseLevel(['E']);
    const enemies = findEnemies(level);
    expect(enemies.length).toBe(1);
  });
});
