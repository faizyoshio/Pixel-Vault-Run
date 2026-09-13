import { Renderer } from './renderer/renderer';
import { GameEngine } from './engine/engine';
import { getLevel, parseLevel } from './level/level';
import { Sfx } from './audio/sfx';

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
let player = { x: level.playerStart.x, y: level.playerStart.y, vx: 0, vy: 0, facingRight: true };
let entities: { type: 'coin' | 'enemy' | 'goal'; x: number; y: number; collected: boolean; alive: boolean; reached: boolean; vx: number }[] = [];
let cameraX = 0;

// Load level entities
function loadLevelEntities(idx: number): void {
  level = getLevel(idx);
  player = { x: level.playerStart.x, y: level.playerStart.y, vx: 0, vy: 0, facingRight: true };
  entities = [];
  
  for (let y = 0; y < level.height; y++) {
    for (let x = 0; x < level.width; x++) {
      const tile = level.tiles[y][x];
      if (tile === 'coin') {
        entities.push({ type: 'coin', x: x * 16, y: y * 16, collected: false, alive: true, reached: false, vx: 0 });
      } else if (tile === 'enemy') {
        entities.push({ type: 'enemy', x: x * 16, y: y * 16, collected: false, alive: true, reached: false, vx: 0.6 });
      } else if (tile === 'goal') {
        entities.push({ type: 'goal', x: x * 16, y: y * 16, collected: false, alive: true, reached: false, vx: 0 });
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
    // Basic player movement inline
    if (left) {
      player.vx = Math.max(player.vx - 0.4 * dt, -2.5);
      player.facingRight = false;
    } else if (right) {
      player.vx = Math.min(player.vx + 0.4 * dt, 2.5);
      player.facingRight = true;
    } else {
      player.vx *= 0.8;
    }
    
    player.vy = Math.min(player.vy + 0.45 * dt, 8); // Gravity
    
    // Simple jump
    if (jump && player.y >= 200) {
      player.vy = -7.5;
      sfx.play('jump');
    }
    
    player.x += player.vx * dt;
    player.y += player.vy * dt;
    
    // Bounds & floor collision
    if (player.y > 200) {
      player.y = 200;
      player.vy = 0;
    }
    if (player.x < 0) player.x = 0;
    
    // Camera follow player
    cameraX = Math.max(0, player.x - 160 + 8);
    
    // Update entities & check collisions
    for (const e of entities) {
      if (e.type === 'enemy' && e.alive) {
        e.x += e.vx * dt;
        if (e.x <= 50 || e.x >= 250) e.vx = -e.vx; // Patrol bounds
        
        // Player collision
        const dx = Math.abs((player.x + 7) - (e.x + 7));
        const dy = Math.abs((player.y + 8) - (e.y + 7));
        if (dx < 12 && dy < 12) {
          if (player.vy > 0 && player.y < e.y) {
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