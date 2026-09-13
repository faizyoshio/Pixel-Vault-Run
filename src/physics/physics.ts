import { Vec2, Rect, TileType, LevelData, Size, TILE_SIZE, GRAVITY, MAX_FALL_SPEED, MOVE_ACCEL, MAX_SPEED, JUMP_FORCE, JUMP_HOLD_FORCE, COYOTE_TIME, JUMP_BUFFER } from '../types';

export function aabbCollide(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y;
}

export function getTileAt(level: LevelData, x: number, y: number): TileType {
  const tx = Math.floor(x / TILE_SIZE);
  const ty = Math.floor(y / TILE_SIZE);
  if (tx < 0 || tx >= level.width || ty < 0 || ty >= level.height) return 'ground';
  return level.tiles[ty][tx];
}

export function checkCollision(level: LevelData, rect: Rect): { x: number; y: number } {
  let pushX = 0;
  let pushY = 0;
  
  const left = Math.floor(rect.x / TILE_SIZE);
  const right = Math.floor((rect.x + rect.w - 0.01) / TILE_SIZE);
  const top = Math.floor(rect.y / TILE_SIZE);
  const bottom = Math.floor((rect.y + rect.h - 0.01) / TILE_SIZE);
  
  for (let ty = top; ty <= bottom; ty++) {
    for (let tx = left; tx <= right; tx++) {
      const tile = getTileAt(level, tx * TILE_SIZE, ty * TILE_SIZE);
      if (tile === 'ground') {
        const tileRect: Rect = { x: tx * TILE_SIZE, y: ty * TILE_SIZE, w: TILE_SIZE, h: TILE_SIZE };
        if (aabbCollide(rect, tileRect)) {
          const overlapX = Math.min(rect.x + rect.w, tileRect.x + tileRect.w) - Math.max(rect.x, tileRect.x);
          const overlapY = Math.min(rect.y + rect.h, tileRect.y + tileRect.h) - Math.max(rect.y, tileRect.y);
          
          if (overlapX < overlapY) {
            if (rect.x < tileRect.x) pushX = Math.min(pushX, -overlapX);
            else pushX = Math.max(pushX, overlapX);
          } else {
            if (rect.y < tileRect.y) pushY = Math.min(pushY, -overlapY);
            else pushY = Math.max(pushY, overlapY);
          }
        }
      }
    }
  }
  return { x: pushX, y: pushY };
}

export interface PhysicsEntity {
  pos: Vec2;
  vel: Vec2;
  size: Size;
}

export function applyPhysics(entity: PhysicsEntity, level: LevelData, dt: number, input: { left: boolean; right: boolean; jump: boolean; jumpHeld: boolean }, grounded: boolean, coyote: number, jumpBuffer: number): { grounded: boolean; coyote: number; jumpBuffer: number } {
  // Horizontal movement
  if (input.left) entity.vel.x = Math.max(entity.vel.x - MOVE_ACCEL * dt, -MAX_SPEED);
  else if (input.right) entity.vel.x = Math.min(entity.vel.x + MOVE_ACCEL * dt, MAX_SPEED);
  else {
    if (entity.vel.x > 0) entity.vel.x = Math.max(entity.vel.x - MOVE_ACCEL * dt * 2, 0);
    else if (entity.vel.x < 0) entity.vel.x = Math.min(entity.vel.x + MOVE_ACCEL * dt * 2, 0);
  }
  
  // Gravity
  if (!grounded) {
    entity.vel.y = Math.min(entity.vel.y + GRAVITY * dt, MAX_FALL_SPEED);
    coyote = Math.max(coyote - dt, 0);
  } else {
    coyote = COYOTE_TIME;
  }
  
  // Jump buffer
  if (input.jump) jumpBuffer = JUMP_BUFFER;
  else jumpBuffer = Math.max(jumpBuffer - dt, 0);
  
  // Perform jump
  if (jumpBuffer > 0 && (grounded || coyote > 0)) {
    entity.vel.y = JUMP_FORCE;
    grounded = false;
    coyote = 0;
    jumpBuffer = 0;
  }
  
  // Variable jump height (hold jump)
  if (input.jumpHeld && entity.vel.y < 0) {
    entity.vel.y += JUMP_HOLD_FORCE * dt;
  }
  
  // Apply velocity
  entity.pos.x += entity.vel.x * dt;
  entity.pos.y += entity.vel.y * dt;
  
  // Collision resolution
  const rect: Rect = { x: entity.pos.x, y: entity.pos.y, w: entity.size.w, h: entity.size.h };
  const push = checkCollision(level, rect);
  
  if (push.x !== 0) {
    entity.pos.x += push.x;
    entity.vel.x = 0;
  }
  
  grounded = false;
  if (push.y !== 0) {
    entity.pos.y += push.y;
    if (push.y < 0) grounded = true; // Hit ground
    entity.vel.y = 0;
  }
  
  return { grounded, coyote, jumpBuffer };
}

export function checkStomp(player: Rect & { vel: Vec2 }, enemy: Rect): boolean {
  const playerBottom = player.y + player.h;
  const enemyTop = enemy.y;
  const playerCenterX = player.x + player.w / 2;
  
  return player.vel.y > 0 && 
         playerBottom <= enemyTop + 8 &&
         playerCenterX > enemy.x &&
         playerCenterX < enemy.x + enemy.w;
}