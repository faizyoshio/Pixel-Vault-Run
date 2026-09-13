import { GameEngine } from '../engine/engine';
import { parseLevel } from '../level/level';
import { Sfx } from '../audio/sfx';
import { TileType, LevelData, TILE_SIZE } from '../types';

interface EntityData {
  type: 'coin' | 'enemy' | 'goal';
  x: number;
  y: number;
  collected: boolean;
  alive: boolean;
  reached: boolean;
  vx: number;
}

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private scale: number;
  
  constructor(canvas: HTMLCanvasElement, scale = 3) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D not supported');
    this.ctx = ctx;
    this.scale = scale;
  }
  
  render(canvas: HTMLCanvasElement, engine: GameEngine, level: LevelData, player: { x: number; y: number; vx: number; vy: number; facingRight: boolean }, entities: EntityData[], cameraX: number): void {
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(this.scale, this.scale);
    
    // Camera transform
    const camX = Math.round(-cameraX);
    ctx.translate(camX, 0);
    
    // Sky
    ctx.fillStyle = '#4a90e2';
    ctx.fillRect(-1000, 0, 4000, 240);
    
    // Tiles
    for (let y = 0; y < level.height; y++) {
      for (let x = 0; x < level.width; x++) {
        const tile = level.tiles[y][x];
        if (tile === 'ground') {
          this.drawGroundTile(x * TILE_SIZE, y * TILE_SIZE);
        }
      }
    }
    
    // Entities
    for (const e of entities) {
      if (e.type === 'coin' && !e.collected) this.drawCoin(e.x, e.y);
      else if (e.type === 'enemy' && e.alive) this.drawEnemy(e.x, e.y);
      else if (e.type === 'goal' && !e.reached) this.drawGoal(e.x, e.y);
    }
    
    // Player
    if (engine.state === 'playing' || engine.state === 'dead') {
      this.drawPlayer(player);
    }
    
    ctx.restore();
  }
  
  private drawGroundTile(x: number, y: number): void {
    const ctx = this.ctx;
    ctx.fillStyle = '#8B5A2B';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    ctx.strokeStyle = '#5a3a1a';
    ctx.strokeRect(x + 0.5, y + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
    // Texture details
    ctx.fillStyle = '#a07040';
    ctx.fillRect(x + 3, y + 4, 4, 3);
    ctx.fillRect(x + 10, y + 10, 3, 3);
  }
  
  private drawCoin(x: number, y: number): void {
    const ctx = this.ctx;
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(x + 8, y + 8, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  
  private drawEnemy(x: number, y: number): void {
    const ctx = this.ctx;
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(x, y + 3, 14, 11);
    ctx.fillStyle = '#8e1d1d';
    ctx.fillRect(x + 2, y + 6, 4, 4);
    ctx.fillRect(x + 8, y + 6, 4, 4);
  }
  
  private drawGoal(x: number, y: number): void {
    const ctx = this.ctx;
    ctx.fillStyle = '#8e44ad';
    ctx.fillRect(x + 6, y, 4, 32);
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.moveTo(x + 10, y);
    ctx.lineTo(x + 14, y + 6);
    ctx.lineTo(x + 10, y + 12);
    ctx.closePath();
    ctx.fill();
  }
  
  private drawPlayer(p: { x: number; y: number; facingRight: boolean }): void {
    const ctx = this.ctx;
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(p.x + 2, p.y, 10, 12);
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(p.x + 1, p.y + 12, 12, 4);
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(p.x + 2, p.y - 3, 10, 3);
    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(p.x + (p.facingRight ? 8 : 2), p.y + 2, 3, 3);
  }
}