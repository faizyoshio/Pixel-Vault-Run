export interface Vec2 {
  x: number;
  y: number;
}

export interface AABB {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type TileKind = 'empty' | 'block' | 'coin' | 'flag' | 'enemy-spawn' | 'player';

export interface Tile {
  kind: TileKind;
  solid: boolean;
}

export interface Player {
  pos: Vec2;
  vel: Vec2;
  width: number;
  height: number;
  lives: number;
  score: number;
  onGround: boolean;
  facingRight: boolean;
  coyoteTimer: number;
  jumpBufferTimer: number;
  isJumping: boolean;
  dead: boolean;
  stompCooldown: number;
}

export interface Enemy {
  pos: Vec2;
  vel: Vec2;
  width: number;
  height: number;
  patrolLeft: number;
  patrolRight: number;
  speed: number;
  dead: boolean;
  isDeadTimer?: number;
}

export interface Coin {
  pos: Vec2;
  collected: boolean;
  width: number;
  height: number;
}

export interface Level {
  map: string[];
  width: number;
  height: number;
  tileW: number;
  tileH: number;
}

export const TILE_W = 16;
export const TILE_H = 16;
export const GRAVITY = 0.45;
export const MAX_FALL_SPEED = 8;
export const MOVE_ACCEL = 0.4;
export const MOVE_MAX_SPEED = 2.5;
export const FRICTION = 0.82;
export const JUMP_FORCE = -7.5;
export const JUMP_HOLD_GRAVITY = 0.22;
export const COYOTE_TIME = 6;
export const JUMP_BUFFER_TIME = 6;
export const STOMP_DEATH_HEIGHT = 8;
export const COIN_SCORE = 100;
export const ENEMY_SCORE = 200;
export const EXTRA_LIFE_SCORE = 1000;

export function createPlayer(startX: number, startY: number): Player {
  return {
    pos: { x: startX, y: startY },
    vel: { x: 0, y: 0 },
    width: 12,
    height: 14,
    lives: 3,
    score: 0,
    onGround: false,
    facingRight: true,
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    isJumping: false,
    dead: false,
    stompCooldown: 0,
  };
}

export function createTile(kind: TileKind, solid: boolean): Tile {
  return { kind, solid };
}

export function parseLevel(map: string[]): Level {
  const width = Math.max(...map.map((l) => l.length));
  const height = map.length;
  return { map, width, height, tileW: TILE_W, tileH: TILE_H };
}

export function aabbOverlap(a: AABB, b: AABB): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

export function isSolidTile(ch: string | undefined): boolean {
  return ch === '#' || ch === 'B' || ch === '?' || ch === 'D';
}

export function updatePlayerHorizontal(player: Player, left: boolean, right: boolean): void {
  if (player.dead) return;
  if (left && !right) {
    player.vel.x -= MOVE_ACCEL;
    player.facingRight = false;
  } else if (right && !left) {
    player.vel.x += MOVE_ACCEL;
    player.facingRight = true;
  } else {
    player.vel.x *= FRICTION;
    if (Math.abs(player.vel.x) < 0.05) player.vel.x = 0;
  }

  if (player.vel.x > MOVE_MAX_SPEED) player.vel.x = MOVE_MAX_SPEED;
  if (player.vel.x < -MOVE_MAX_SPEED) player.vel.x = -MOVE_MAX_SPEED;
}

export function updateGravity(player: Player, jumpHeld: boolean): void {
  if (player.dead) return;
  const g = player.isJumping && jumpHeld && player.vel.y < 0 ? JUMP_HOLD_GRAVITY : GRAVITY;
  player.vel.y += g;
  if (player.vel.y > MAX_FALL_SPEED) player.vel.y = MAX_FALL_SPEED;
}

export function tryJump(player: Player): boolean {
  if (player.dead) return false;
  if (player.onGround || player.coyoteTimer > 0) {
    player.vel.y = JUMP_FORCE;
    player.onGround = false;
    player.coyoteTimer = 0;
    player.isJumping = true;
    return true;
  }
  return false;
}

export function bufferJump(player: Player): void {
  if (!player.dead) {
    player.jumpBufferTimer = JUMP_BUFFER_TIME;
  }
}

export function updateCoyoteAndJumpBuffer(player: Player): void {
  if (player.onGround) {
    player.coyoteTimer = COYOTE_TIME;
  } else if (player.coyoteTimer > 0) {
    player.coyoteTimer--;
  }

  if (player.jumpBufferTimer > 0) {
    player.jumpBufferTimer--;
  }

  if (player.stompCooldown > 0) {
    player.stompCooldown--;
  }
}

export function applyJumpBuffer(player: Player): boolean {
  if (player.jumpBufferTimer > 0 && (player.onGround || player.coyoteTimer > 0)) {
    const jumped = tryJump(player);
    if (jumped) {
      player.jumpBufferTimer = 0;
      return true;
    }
  }
  return false;
}

export function resolveXCollision(player: Player, level: Level): void {
  const tileX1 = Math.floor(player.pos.x / level.tileW);
  const tileX2 = Math.floor((player.pos.x + player.width - 0.1) / level.tileW);
  const tileY1 = Math.floor(player.pos.y / level.tileH);
  const tileY2 = Math.floor((player.pos.y + player.height - 0.1) / level.tileH);

  // Check collision in direction of movement only
  if (player.vel.x > 0) {
    // Moving right - check rightmost tiles
    for (let ty = tileY1; ty <= tileY2; ty++) {
      const tx = tileX2;
      if (tx < 0 || ty < 0 || tx >= level.width || ty >= level.height) continue;
      const ch = level.map[ty]?.[tx];
      if (isSolidTile(ch)) {
        const tileAABB: AABB = { x: tx * level.tileW, y: ty * level.tileH, w: level.tileW, h: level.tileH };
        const playerAABB: AABB = { x: player.pos.x, y: player.pos.y, w: player.width, h: player.height };
        if (aabbOverlap(playerAABB, tileAABB)) {
          player.pos.x = tx * level.tileW - player.width;
          player.vel.x = 0;
          return;
        }
      }
    }
  } else if (player.vel.x < 0) {
    // Moving left - check leftmost tiles
    for (let ty = tileY1; ty <= tileY2; ty++) {
      const tx = tileX1;
      if (tx < 0 || ty < 0 || tx >= level.width || ty >= level.height) continue;
      const ch = level.map[ty]?.[tx];
      if (isSolidTile(ch)) {
        const tileAABB: AABB = { x: tx * level.tileW, y: ty * level.tileH, w: level.tileW, h: level.tileH };
        const playerAABB: AABB = { x: player.pos.x, y: player.pos.y, w: player.width, h: player.height };
        if (aabbOverlap(playerAABB, tileAABB)) {
          player.pos.x = (tx + 1) * level.tileW;
          player.vel.x = 0;
          return;
        }
      }
    }
  }
}

export function resolveYCollision(player: Player, level: Level): void {
  const tileX1 = Math.floor(player.pos.x / level.tileW);
  const tileX2 = Math.floor((player.pos.x + player.width - 0.1) / level.tileW);
  const tileY1 = Math.floor(player.pos.y / level.tileH);
  const tileY2 = Math.floor((player.pos.y + player.height - 0.1) / level.tileH);

  player.onGround = false;

  for (let ty = tileY1; ty <= tileY2; ty++) {
    for (let tx = tileX1; tx <= tileX2; tx++) {
      if (tx < 0 || ty < 0 || tx >= level.width || ty >= level.height) continue;
      const ch = level.map[ty]?.[tx];
      if (isSolidTile(ch)) {
        const tileAABB: AABB = { x: tx * level.tileW, y: ty * level.tileH, w: level.tileW, h: level.tileH };
        const playerAABB: AABB = { x: player.pos.x, y: player.pos.y, w: player.width, h: player.height };

        if (aabbOverlap(playerAABB, tileAABB)) {
          if (player.vel.y > 0) {
            player.pos.y = ty * level.tileH - player.height;
            player.onGround = true;
            player.isJumping = false;
            player.vel.y = 0;
          } else if (player.vel.y < 0) {
            player.pos.y = (ty + 1) * level.tileH;
            player.vel.y = 0;
          }
        }
      }
    }
  }

  if (player.onGround && !player.isJumping) {
    player.coyoteTimer = COYOTE_TIME;
  }
}

export function updateEnemy(enemy: Enemy, level: Level): void {
  if (enemy.dead) return;
  enemy.pos.x += enemy.speed;

  if (enemy.pos.x < enemy.patrolLeft) {
    enemy.pos.x = enemy.patrolLeft;
    enemy.speed = Math.abs(enemy.speed);
  } else if (enemy.pos.x + enemy.width > enemy.patrolRight) {
    enemy.pos.x = enemy.patrolRight - enemy.width;
    enemy.speed = -Math.abs(enemy.speed);
  }

  // Also turn around on solid walls
  const tx = enemy.speed > 0 ? Math.floor((enemy.pos.x + enemy.width) / level.tileW) : Math.floor(enemy.pos.x / level.tileW);
  const ty = Math.floor((enemy.pos.y + enemy.height / 2) / level.tileH);
  if (tx >= 0 && tx < level.width && ty >= 0 && ty < level.height) {
    if (isSolidTile(level.map[ty]?.[tx])) {
      enemy.speed = -enemy.speed;
    }
  }
}

export function isStomp(player: Player, enemy: Enemy): boolean {
  if (player.dead || enemy.dead) return false;
  if (player.stompCooldown > 0) return false;

  const playerBottom = player.pos.y + player.height;
  const enemyTop = enemy.pos.y;
  const isFalling = player.vel.y > 0;
  const hitsTop = playerBottom <= enemyTop + STOMP_DEATH_HEIGHT;

  const playerAABB: AABB = { x: player.pos.x, y: player.pos.y, w: player.width, h: player.height };
  const enemyAABB: AABB = { x: enemy.pos.x, y: enemy.pos.y, w: enemy.width, h: enemy.height };

  return isFalling && hitsTop && aabbOverlap(playerAABB, enemyAABB);
}

export function stompEnemy(player: Player, enemy: Enemy): boolean {
  enemy.dead = true;
  player.stompCooldown = 12;
  player.vel.y = -5.5; // bounce up
  const oldThreshold = Math.floor(player.score / EXTRA_LIFE_SCORE);
  player.score += ENEMY_SCORE;
  const newThreshold = Math.floor(player.score / EXTRA_LIFE_SCORE);
  if (newThreshold > oldThreshold) {
    player.lives += (newThreshold - oldThreshold);
  }
  return true;
}

export function checkEnemySideContact(player: Player, enemy: Enemy): boolean {
  if (player.dead || enemy.dead) return false;
  const playerAABB: AABB = { x: player.pos.x, y: player.pos.y, w: player.width, h: player.height };
  const enemyAABB: AABB = { x: enemy.pos.x, y: enemy.pos.y, w: enemy.width, h: enemy.height };
  return aabbOverlap(playerAABB, enemyAABB);
}

export function collectCoin(player: Player, coin: Coin): boolean {
  if (player.dead || coin.collected) return false;
  const playerAABB: AABB = { x: player.pos.x, y: player.pos.y, w: player.width, h: player.height };
  const coinAABB: AABB = { x: coin.pos.x, y: coin.pos.y, w: coin.width, h: coin.height };

  if (aabbOverlap(playerAABB, coinAABB)) {
    coin.collected = true;
    const oldThreshold = Math.floor(player.score / EXTRA_LIFE_SCORE);
    player.score += COIN_SCORE;
    const newThreshold = Math.floor(player.score / EXTRA_LIFE_SCORE);
    if (newThreshold > oldThreshold) {
      player.lives += (newThreshold - oldThreshold);
    }
    return true;
  }
  return false;
}

export function checkLevelWin(player: Player, level: Level): boolean {
  if (player.dead) return false;
  const playerAABB: AABB = { x: player.pos.x, y: player.pos.y, w: player.width, h: player.height };
  for (let y = 0; y < level.height; y++) {
    for (let x = 0; x < level.width; x++) {
      if (level.map[y]?.[x] === 'F') {
        const flagAABB: AABB = { x: x * level.tileW, y: y * level.tileH, w: level.tileW, h: level.tileH };
        if (aabbOverlap(playerAABB, flagAABB)) {
          return true;
        }
      }
    }
  }
  return false;
}

export function killPlayer(player: Player): void {
  if (player.dead) return;
  player.dead = true;
  player.lives--;
  player.vel.y = -6;
}

export function findPlayerStart(level: Level): Vec2 {
  for (let y = 0; y < level.height; y++) {
    for (let x = 0; x < level.width; x++) {
      if (level.map[y]?.[x] === 'P') {
        return { x: x * level.tileW, y: y * level.tileH };
      }
    }
  }
  return { x: 32, y: 160 };
}

export function findCoins(level: Level): Coin[] {
  const coins: Coin[] = [];
  for (let y = 0; y < level.height; y++) {
    for (let x = 0; x < level.width; x++) {
      if (level.map[y]?.[x] === 'C') {
        coins.push({
          pos: { x: x * level.tileW + 3, y: y * level.tileH + 3 },
          collected: false,
          width: 10,
          height: 10,
        });
      }
    }
  }
  return coins;
}

export function findEnemies(level: Level): Enemy[] {
  const enemies: Enemy[] = [];
  for (let y = 0; y < level.height; y++) {
    for (let x = 0; x < level.width; x++) {
      if (level.map[y]?.[x] === 'E') {
        enemies.push({
          pos: { x: x * level.tileW, y: y * level.tileH + 2 },
          vel: { x: 0, y: 0 },
          width: 14,
          height: 14,
          patrolLeft: Math.max(0, (x - 2) * level.tileW),
          patrolRight: Math.min(level.width * level.tileW, (x + 3) * level.tileW),
          speed: 0.6,
          dead: false,
        });
      }
    }
  }
  return enemies;
}

export function createDefaultLevels(): Level[] {
  return [
    parseLevel([
      '                                                                ',
      '                                                                ',
      '                                                                ',
      '                                              C   C        F    ',
      '                                           ##############       ',
      '             C  C  C                     ##                     ',
      '           ###########                 ##                       ',
      '                                     ##                         ',
      '      E                     E      ##                           ',
      '    #####                 #####  ##                             ',
      '                                                                ',
      '  P        C    C    C                                          ',
      '################################################################',
      '################################################################',
      '################################################################',
    ]),
    parseLevel([
      '                                                                ',
      '                                                            F   ',
      '                                                          ####  ',
      '                                                      C         ',
      '                                                    ####        ',
      '                                            C  C                ',
      '                   C  C                   ########              ',
      '                 ########                                       ',
      '        E                   E     E                             ',
      '     #######             #############                          ',
      '                                                                ',
      '  P             C                                               ',
      '################################################################',
      '################################################################',
      '################################################################',
    ]),
    parseLevel([
      '                                                                ',
      '                                                                ',
      '                                                              F ',
      '                                                      C C C  ###',
      '                                                    #######     ',
      '                                            E                   ',
      '                            C   C        #######                ',
      '                         #########                              ',
      '                E                                               ',
      '             #######                                            ',
      '                                                                ',
      '  P     C C                                                     ',
      '################################################################',
      '################################################################',
      '################################################################',
    ]),
  ];
}
