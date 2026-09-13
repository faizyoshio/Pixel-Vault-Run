import { Vec2, Size, Rect, TileType, LevelData } from '../types';
import { applyPhysics, checkCollision, checkStomp } from '../physics/physics';

export class Player {
  pos: Vec2;
  vel: Vec2;
  size: Size = { w: 14, h: 16 };
  alive = true;
  grounded = false;
  coyote = 0;
  jumpBuffer = 0;
  score = 0;
  lives = 3;
  facingRight = true;
  animFrame = 0;
  animTimer = 0;
  
  constructor(start: Vec2) {
    this.pos = { ...start };
    this.vel = { x: 0, y: 0 };
  }
  
  get rect(): Rect & { vel: Vec2 } {
    return { x: this.pos.x, y: this.pos.y, w: this.size.w, h: this.size.h, vel: this.vel };
  }
  
  update(dt: number, input: { left: boolean; right: boolean; jump: boolean; jumpHeld: boolean }, level: LevelData): void {
    const result = applyPhysics(this, level, dt, input, this.grounded, this.coyote, this.jumpBuffer);
    this.grounded = result.grounded;
    this.coyote = result.coyote;
    this.jumpBuffer = result.jumpBuffer;
    
    // Animation
    if (Math.abs(this.vel.x) > 0.1) {
      this.animTimer += dt;
      if (this.animTimer > 100) {
        this.animFrame = (this.animFrame + 1) % 3;
        this.animTimer = 0;
      }
      this.facingRight = this.vel.x > 0;
    } else {
      this.animFrame = 0;
      this.animTimer = 0;
    }
  }
  
  collectCoin(): void {
    this.score += 100;
    if (this.score % 1000 === 0) this.lives++;
  }
  
  stomp(): void {
    this.vel.y = -5;
  }
  
  die(): void {
    this.lives--;
    this.alive = this.lives > 0;
  }
  
  reset(start: Vec2): void {
    this.pos = { ...start };
    this.vel = { x: 0, y: 0 };
    this.grounded = false;
    this.coyote = 0;
    this.jumpBuffer = 0;
    this.animFrame = 0;
    this.animTimer = 0;
  }
}

export class Enemy {
  pos: Vec2;
  vel: Vec2;
  size: Size = { w: 14, h: 14 };
  alive = true;
  patrolLeft: number;
  patrolRight: number;
  speed = 0.6;
  animFrame = 0;
  animTimer = 0;
  
  constructor(pos: Vec2, left: number, right: number) {
    this.pos = { ...pos };
    this.vel = { x: this.speed, y: 0 };
    this.patrolLeft = left;
    this.patrolRight = right;
  }
  
  get rect(): Rect & { vel: Vec2 } {
    return { x: this.pos.x, y: this.pos.y, w: this.size.w, h: this.size.h, vel: this.vel };
  }
  
  update(dt: number, level: LevelData): void {
    // Apply gravity
    this.vel.y = Math.min(this.vel.y + 0.45 * dt, 8);
    
    // Patrol
    if (this.pos.x <= this.patrolLeft) this.vel.x = Math.abs(this.vel.x);
    if (this.pos.x >= this.patrolRight) this.vel.x = -Math.abs(this.vel.x);
    
    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
    
    // Collision
    const rect: Rect = { x: this.pos.x, y: this.pos.y, w: this.size.w, h: this.size.h };
    const push = checkCollision(level, rect);
    if (push.x !== 0) {
      this.pos.x += push.x;
      this.vel.x = -this.vel.x;
    }
    if (push.y !== 0) {
      this.pos.y += push.y;
      this.vel.y = 0;
    }
    
    // Animation
    this.animTimer += dt;
    if (this.animTimer > 200) {
      this.animFrame = (this.animFrame + 1) % 2;
      this.animTimer = 0;
    }
  }
}

export class Coin {
  pos: Vec2;
  vel: Vec2 = { x: 0, y: 0 };
  size: Size = { w: 12, h: 12 };
  alive = true;
  collected = false;
  animFrame = 0;
  animTimer = 0;
  bobOffset = 0;
  bobDir = 1;
  
  constructor(pos: Vec2) {
    this.pos = { ...pos };
  }
  
  get rect(): Rect & { vel: Vec2 } {
    return { x: this.pos.x, y: this.pos.y, w: this.size.w, h: this.size.h, vel: this.vel };
  }
  
  update(dt: number): void {
    this.animTimer += dt;
    if (this.animTimer > 150) {
      this.animFrame = (this.animFrame + 1) % 4;
      this.animTimer = 0;
    }
    
    // Bobbing animation
    this.bobOffset += this.bobDir * dt * 0.02;
    if (Math.abs(this.bobOffset) > 2) this.bobDir *= -1;
  }
}

export class Goal {
  pos: Vec2;
  vel: Vec2 = { x: 0, y: 0 };
  size: Size = { w: 16, h: 32 };
  alive = true;
  reached = false;
  animFrame = 0;
  animTimer = 0;
  
  constructor(pos: Vec2) {
    this.pos = { ...pos };
  }
  
  get rect(): Rect & { vel: Vec2 } {
    return { x: this.pos.x, y: this.pos.y, w: this.size.w, h: this.size.h, vel: this.vel };
  }
  
  update(dt: number): void {
    this.animTimer += dt;
    if (this.animTimer > 300) {
      this.animFrame = (this.animFrame + 1) % 4;
      this.animTimer = 0;
    }
  }
}