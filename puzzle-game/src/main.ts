import {
  createPlayer,
  parseLevel,
  aabbOverlap,
  isSolidTile,
  updatePlayerHorizontal,
  updateGravity,
  tryJump,
  bufferJump,
  updateCoyoteAndJumpBuffer,
  applyJumpBuffer,
  resolveXCollision,
  resolveYCollision,
  updateEnemy,
  isStomp,
  stompEnemy,
  checkEnemySideContact,
  collectCoin,
  checkLevelWin,
  killPlayer,
  findPlayerStart,
  findCoins,
  findEnemies,
  createDefaultLevels,
  Player,
  Enemy,
  Coin,
  Level,
  TILE_W,
  TILE_H,
} from './game/engine';

const CANVAS_W = 320;
const CANVAS_H = 240;
const SCALE = 3;

const canvas = document.createElement('canvas');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;
canvas.style.width = `${CANVAS_W * SCALE}px`;
canvas.style.height = `${CANVAS_H * SCALE}px`;
canvas.style.imageRendering = 'pixelated';
canvas.style.display = 'block';
canvas.style.margin = '0 auto';
document.getElementById('game-container')?.appendChild(canvas);
const ctx = canvas.getContext('2d')!;

const hud = document.getElementById('hud')!;
const message = document.getElementById('message')!;

let levels = createDefaultLevels();
let levelIndex = 0;
let level = levels[levelIndex];

let player = createPlayer(0, 0);
let enemies: Enemy[] = [];
let coins: Coin[] = [];

let state: 'playing' | 'dead' | 'gameover' | 'win' | 'level-transition' = 'playing';
let levelTransitionTimer = 0;

const keys = { left: false, right: false, jump: false, jumpHeld: false, restart: false };
const keysPressed = new Set<string>();

function resetLevel(resetLives = false) {
  level = levels[levelIndex];
  const start = findPlayerStart(level);
  player = createPlayer(start.x, start.y);
  if (resetLives) {
    player.lives = 3;
    player.score = 0;
  }
  enemies = findEnemies(level);
  coins = findCoins(level);
  state = 'playing';
}

function initAudio() {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return ctx;
}

let audioCtx: AudioContext | null = null;
const audioUnlocked = () => {
  if (audioCtx) return;
  audioCtx = initAudio();
  document.removeEventListener('click', audioUnlocked);
  document.removeEventListener('keydown', audioUnlocked);
};
document.addEventListener('click', audioUnlocked);
document.addEventListener('keydown', audioUnlocked);

function playTone(freq: number, duration: number, type: OscillatorType = 'square', volume = 0.15) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.stop(audioCtx.currentTime + duration);
}

function sfxJump() { playTone(440, 0.12, 'square', 0.12); }
function sfxCoin() { playTone(880, 0.08, 'sine', 0.1); }
function sfxStomp() { playTone(220, 0.1, 'square', 0.15); }
function sfxHurt() { playTone(150, 0.2, 'sawtooth', 0.15); }
function sfxWin() {
  playTone(523, 0.15, 'sine', 0.1);
  setTimeout(() => playTone(659, 0.15, 'sine', 0.1), 100);
  setTimeout(() => playTone(784, 0.2, 'sine', 0.1), 200);
  setTimeout(() => playTone(1047, 0.3, 'sine', 0.1), 300);
}

window.addEventListener('keydown', (e) => {
  keysPressed.add(e.code);
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
  if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'KeyZ') {
    keys.jump = true;
    keys.jumpHeld = true;
    bufferJump(player);
  }
  if (e.code === 'KeyR') keys.restart = true;
  e.preventDefault();
});

window.addEventListener('keyup', (e) => {
  keysPressed.delete(e.code);
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
  if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'KeyZ') {
    keys.jump = false;
    keys.jumpHeld = false;
    player.isJumping = false;
  }
  if (e.code === 'KeyR') keys.restart = false;
});

function updateHUD() {
  hud.innerHTML = `LIVES: ${player.lives}  SCORE: ${player.score}  LEVEL: ${levelIndex + 1}`;
}

function drawRect(x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawOutlineRect(x: number, y: number, w: number, h: number, color: string, outline = '#000') {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = outline;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
}

function drawTile(x: number, y: number, ch: string) {
  const tx = x * TILE_W;
  const ty = y * TILE_H;
  switch (ch) {
    case '#':
    case 'B':
    case '?':
    case 'D':
      drawOutlineRect(tx, ty, TILE_W, TILE_H, '#8b6e4e', '#5d4a37');
      // Pattern
      ctx.fillStyle = '#a8845a';
      ctx.fillRect(tx + 2, ty + 2, TILE_W - 4, TILE_H - 4);
      ctx.strokeStyle = '#000';
      ctx.strokeRect(tx + 2.5, ty + 2.5, TILE_W - 5, TILE_H - 5);
      break;
    case 'F':
      // Flag pole
      ctx.fillStyle = '#666';
      ctx.fillRect(tx + 6, ty, 4, TILE_H * 2);
      // Flag
      ctx.fillStyle = '#e00';
      ctx.beginPath();
      ctx.moveTo(tx + 10, ty);
      ctx.lineTo(tx + 20, ty + 6);
      ctx.lineTo(tx + 10, ty + 12);
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.stroke();
      break;
  }
}

function drawPlayer() {
  if (player.dead && state !== 'dead') return;
  const x = player.pos.x;
  const y = player.pos.y;
  const w = player.width;
  const h = player.height;
  // Body
  drawOutlineRect(x, y + 4, w, h - 4, '#ff6b6b', '#8b0000');
  // Head
  drawOutlineRect(x + 2, y, w - 4, 6, '#ffe0b2', '#000');
  // Eyes
  ctx.fillStyle = '#000';
  const eyeX = player.facingRight ? x + 8 : x + 4;
  ctx.fillRect(eyeX, y + 2, 2, 2);
  // Buttons
  ctx.fillStyle = '#fff';
  ctx.fillRect(x + 3, y + 8, 2, 2);
  ctx.fillRect(x + 7, y + 8, 2, 2);
}

function drawEnemy(enemy: Enemy) {
  if (enemy.dead) return;
  const x = enemy.pos.x;
  const y = enemy.pos.y;
  const w = enemy.width;
  const h = enemy.height;
  // Body
  drawOutlineRect(x, y + 2, w, h - 2, '#4ecdc4', '#006d68');
  // Feet
  drawOutlineRect(x + 2, y + h - 2, 4, 2, '#006d68', '#000');
  drawOutlineRect(x + 8, y + h - 2, 4, 2, '#006d68', '#000');
  // Eyes
  ctx.fillStyle = '#fff';
  ctx.fillRect(x + 3, y + 3, 3, 3);
  ctx.fillRect(x + 8, y + 3, 3, 3);
  ctx.fillStyle = '#000';
  ctx.fillRect(x + 4, y + 4, 1, 1);
  ctx.fillRect(x + 9, y + 4, 1, 1);
}

function drawCoin(coin: Coin) {
  if (coin.collected) return;
  const x = coin.pos.x + coin.width / 2;
  const y = coin.pos.y + coin.height / 2;
  const r = 5;
  // Spin animation
  const t = Date.now() / 200;
  const scale = Math.abs(Math.sin(t));
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.ellipse(x, y, r * scale, r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#b8860b';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x - 1, y - 1, 1, 0, Math.PI * 2);
  ctx.fill();
}

function drawLevel() {
  for (let y = 0; y < level.height; y++) {
    for (let x = 0; x < level.width; x++) {
      const ch = level.map[y]?.[x];
      if (ch && ch !== ' ' && ch !== 'P' && ch !== 'C' && ch !== 'E') {
        drawTile(x, y, ch);
      }
    }
  }
  coins.forEach(drawCoin);
  enemies.forEach(drawEnemy);
  drawPlayer();
}

function update() {
  if (state === 'playing') {
    if (keys.restart) {
      resetLevel(true);
      return;
    }

    updatePlayerHorizontal(player, keys.left, keys.right);
    updateGravity(player, keys.jumpHeld);
    applyJumpBuffer(player);
    updateCoyoteAndJumpBuffer(player);

    player.pos.x += player.vel.x;
    resolveXCollision(player, level);
    player.pos.y += player.vel.y;
    resolveYCollision(player, level);

    enemies.forEach(e => updateEnemy(e, level));

    // Stomp / side contact
    for (const enemy of enemies) {
      if (enemy.dead) continue;
      if (isStomp(player, enemy)) {
        stompEnemy(player, enemy);
        sfxStomp();
      } else if (checkEnemySideContact(player, enemy)) {
        killPlayer(player);
        sfxHurt();
        state = 'dead';
      }
    }

    // Coins
    for (const coin of coins) {
      if (!coin.collected && collectCoin(player, coin)) {
        sfxCoin();
      }
    }

    // Level win
    if (checkLevelWin(player, level)) {
      state = 'level-transition';
      levelTransitionTimer = 60;
      sfxWin();
    }

    // Fall death
    if (player.pos.y > level.height * TILE_H + 50) {
      killPlayer(player);
      sfxHurt();
      state = 'dead';
    }
  } else if (state === 'dead') {
    if (player.lives <= 0) {
      state = 'gameover';
    } else {
      state = 'level-transition';
      levelTransitionTimer = 60;
    }
  } else if (state === 'level-transition') {
    levelTransitionTimer--;
    if (levelTransitionTimer <= 0) {
      if (state === 'level-transition' && levelIndex < levels.length - 1 && checkLevelWin(player, level)) {
        levelIndex++;
        resetLevel(false);
      } else {
        resetLevel(false);
      }
    }
  } else if (state === 'gameover' || state === 'win') {
    if (keys.restart) {
      levelIndex = 0;
      resetLevel(true);
    }
  }

  updateHUD();
}

function render() {
  ctx.fillStyle = '#5c94fc';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Background hills
  ctx.fillStyle = '#8fc93a';
  for (let i = 0; i < 4; i++) {
    const x = (i * 100 - Date.now() / 100) % 400;
    ctx.beginPath();
    ctx.ellipse(x, 200, 80, 40, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawLevel();

  if (state === 'dead') {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('YOU DIED', CANVAS_W / 2, CANVAS_H / 2 - 10);
    ctx.font = '12px monospace';
    ctx.fillText(`LIVES LEFT: ${player.lives}`, CANVAS_W / 2, CANVAS_H / 2 + 10);
    ctx.fillText('Press R to continue', CANVAS_W / 2, CANVAS_H / 2 + 26);
  } else if (state === 'gameover') {
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', CANVAS_W / 2, CANVAS_H / 2 - 15);
    ctx.fillStyle = '#fff';
    ctx.font = '12px monospace';
    ctx.fillText(`FINAL SCORE: ${player.score}`, CANVAS_W / 2, CANVAS_H / 2 + 10);
    ctx.fillText('Press R to restart', CANVAS_W / 2, CANVAS_H / 2 + 26);
  } else if (state === 'win') {
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('YOU WIN!', CANVAS_W / 2, CANVAS_H / 2 - 15);
    ctx.fillStyle = '#fff';
    ctx.font = '12px monospace';
    ctx.fillText(`FINAL SCORE: ${player.score}`, CANVAS_W / 2, CANVAS_H / 2 + 10);
    ctx.fillText('Press R to restart', CANVAS_W / 2, CANVAS_H / 2 + 26);
  }
}

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

resetLevel(true);
loop();