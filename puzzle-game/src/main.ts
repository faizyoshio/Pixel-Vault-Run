import { Renderer } from './renderer/renderer';
import { GameEngine } from './engine/engine';
import { getLevel, parseLevel } from './level/level';
import { Sfx } from './audio/sfx';
import { applyPhysics, checkCollision, checkStomp } from './physics/physics';
import { TILE_SIZE } from './types';

// HTML elements
const container = document.getElementById('game-container')!;
const hud = document.getElementById('hud')!;

// Canvas setup
const canvas = document.createElement('canvas');
canvas.width = 320 * 3;
canvas.height = 240 * 3;
container.appendChild(canvas);

// Game setup
const sfx = new Sfx();
const engine = new GameEngine(sfx);
const renderer = new Renderer(canvas, 3);

// Current level state
let level = getLevel(0);
let player = { 
  x: level.playerStart.x, 
  y: level.playerStart.y, 
  vx: 0, 
  vy: 0, 
  facingRight: true,
  grounded: false,
  coyote: 0,
  jumpBuffer: 0
};
let entities: { type: 'coin' | 'enemy' | 'goal'; x: number; y: number; collected: boolean; alive: boolean; reached: boolean; vx: number }[] = [];
let cameraX = 0;

// Load level entities
function loadLevelEntities(idx: number): void {
  level = getLevel(idx);
  player = { 
    x: level.playerStart.x, 
    y: level.playerStart.y, 
    vx: 0, 
    vy: 0, 
    facingRight: true,
    grounded: false,
    coyote: 6,
    jumpBuffer: 0
  };
  entities = [];
  
  for (let y = 0; y < level.height; y++) {
    for (let x = 0; x < level.width; x++) {
      const tile = level.tiles[y][x];
      if (tile === 'coin') {
        entities.push({ type: 'coin', x: x * TILE_SIZE, y: y * TILE_SIZE, collected: false, alive: true, reached: false, vx: 0 });
      } else if (tile === 'enemy') {
        entities.push({ type: 'enemy', x: x * TILE_SIZE, y: y * TILE_SIZE, collected: false, alive: true, reached: false, vx: 0.6 });
      } else if (tile === 'goal') {
        entities.push({ type: 'goal', x: x * TILE_SIZE, y: y * TILE_SIZE, collected: false, alive: true, reached: false, vx: 0 });
      }
    }
  }
}

engine.onLevelLoad = (idx) => loadLevelEntities(idx);
loadLevelEntities(0);

// Keyboard input
const keys: Record<string, boolean> = {};

window.addEventListener('keydown', (e) => {
  sfx.unlock();
  keys[e.code] = true;
  if (e.code === 'KeyR') {
    engine.reset();
    loadLevelEntities(0);
  }
});

window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

// Touch / click unlock
window.addEventListener('click', () => sfx.unlock());

// Main Loop
let lastTime = performance.now();

function loop(now: number): void {
  const dt = Math.min((now - lastTime) / 16.667, 2); // Cap delta time
  lastTime = now;
  
  // Input state
  const left = !!(keys['ArrowLeft'] || keys['KeyA']);
  const right = !!(keys['ArrowRight'] || keys['KeyD']);
  const jump = !!(keys['Space'] || keys['ArrowUp'] || keys['KeyW'] || keys['KeyZ']);
  const jumpHeld = jump;
  
  engine.setInput({ left, right, jump, jumpHeld });
  
  // Game logic updates
  if (engine.state === 'playing') {
    // Apply physics with proper tile collision
    const physEntity = { pos: { x: player.x, y: player.y }, vel: { x: player.vx, y: player.vy }, size: { w: 14, h: 16 } };
    const result = applyPhysics(physEntity, level, dt, { left, right, jump, jumpHeld }, player.grounded, player.coyote, player.jumpBuffer);
    
    player.x = physEntity.pos.x;
    player.y = physEntity.pos.y;
    player.vx = physEntity.vel.x;
    player.vy = physEntity.vel.y;
    player.grounded = result.grounded;
    player.coyote = result.coyote;
    player.jumpBuffer = result.jumpBuffer;
    
    // Jump sound
    if (jump && result.grounded && player.vy < 0) {
      sfx.play('jump');
    }
    
    // Camera follow player
    cameraX = Math.max(0, Math.min(player.x - 160 + 8, level.width * TILE_SIZE - 320));
    
    // Update entities & check collisions
    for (const e of entities) {
      if (e.type === 'enemy' && e.alive) {
        e.x += e.vx * dt;
        if (e.x <= 50 || e.x >= level.width * TILE_SIZE - 50) e.vx = -e.vx;
        
        // Player collision
        const pRect = { x: player.x, y: player.y, w: 14, h: 16, vel: { x: player.vx, y: player.vy } };
        const eRect = { x: e.x, y: e.y, w: 14, h: 14 };
        
        if (pRect.x < eRect.x + eRect.w && pRect.x + pRect.w > eRect.x &&
            pRect.y < eRect.y + eRect.h && pRect.y + pRect.h > eRect.y) {
          
          if (checkStomp(pRect, eRect)) {
            // Stomp
            e.alive = false;
            player.vy = -5;
            engine.score += 100;
            sfx.play('stomp');
          } else {
            // Hurt
            engine.lives--;
            sfx.play('hurt');
            if (engine.lives <= 0) {
              engine.state = 'gameover';
            } else {
              player.x = level.playerStart.x;
              player.y = level.playerStart.y;
              player.vx = 0;
              player.vy = 0;
            }
          }
        }
      } else if (e.type === 'coin' && !e.collected) {
        const dx = Math.abs((player.x + 7) - (e.x + 8));
        const dy = Math.abs((player.y + 8) - (e.y + 8));
        if (dx < 12 && dy < 12) {
          e.collected = true;
          engine.score += 100;
          sfx.play('coin');
        }
      } else if (e.type === 'goal' && !e.reached) {
        const dx = Math.abs((player.x + 7) - (e.x + 8));
        const dy = Math.abs((player.y + 8) - (e.y + 16));
        if (dx < 16 && dy < 20) {
          e.reached = true;
          sfx.play('win');
          if (engine.levelIndex < 2) {
            engine.loadLevel(engine.levelIndex + 1);
          } else {
            engine.state = 'win';
          }
        }
      }
    }
  }
  
  // Render frame
  renderer.render(canvas, engine, level, player, entities, cameraX);
  
  // Update HUD
  if (engine.state === 'win') {
    hud.textContent = `YOU WIN! SCORE: ${engine.score} | PRESS R TO RESTART`;
  } else if (engine.state === 'gameover') {
    hud.textContent = `GAME OVER! PRESS R TO RESTART`;
  } else {
    hud.textContent = `LIVES: ${engine.lives} | SCORE: ${engine.score} | LEVEL: ${engine.levelIndex + 1}`;
  }
  
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);