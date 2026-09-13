import { Sfx } from '../audio/sfx';

interface GameInput {
  left: boolean;
  right: boolean;
  jump: boolean;
  jumpHeld: boolean;
}

export class GameEngine {
  // Game state
  lives: number;
  score: number;
  levelIndex: number;
  state: 'menu' | 'playing' | 'dead' | 'gameover' | 'win';
  
  // Physics state
  playerX: number;
  playerY: number;
  playerVX: number;
  playerVY: number;
  grounded: boolean;
  coyote: number;
  jumpBuffer: number;
  
  // Level entities (parsed from ASCII)
  tiles: string[][];
  coins: { x: number; y: number; collected: boolean }[];
  enemies: { x: number; y: number; vx: number; alive: boolean }[];
  goal: { x: number; y: number; reached: boolean };
  
  // Constants
  readonly TILE = 16;
  readonly GRAVITY = 0.45;
  readonly MAX_FALL = 8;
  readonly ACCEL = 0.4;
  readonly MAX_SPEED = 2.5;
  readonly JUMP_FORCE = -7.5;
  readonly COYOTE_TIME = 6;
  readonly JUMP_BUFFER_TIME = 6;
  
  private input: GameInput = { left: false, right: false, jump: false, jumpHeld: false };
  private sfx: Sfx;
  
  constructor(sfx?: Sfx) {
    this.sfx = sfx || new Sfx();
    this.lives = 3;
    this.score = 0;
    this.levelIndex = 0;
    this.state = 'menu';
    this.playerX = 0;
    this.playerY = 0;
    this.playerVX = 0;
    this.playerVY = 0;
    this.grounded = false;
    this.coyote = 0;
    this.jumpBuffer = 0;
    this.tiles = [];
    this.coins = [];
    this.enemies = [];
    this.goal = { x: 0, y: 0, reached: false };
  }
  
  getWorldPos(x: number, y: number): number {
    return y * x;
  }
  
  getTile(x: number, y: number): string {
    const tx = Math.floor(x / this.TILE);
    const ty = Math.floor(y / this.TILE);
    if (ty < 0 || ty >= this.tiles.length) return '.';
    if (tx < 0 || tx >= this.tiles[ty].length) return '.';
    return this.tiles[ty][tx];
  }
  
  setInput(patch: Partial<GameInput>): void {
    this.input = { ...this.input, ...patch };
  }
  
  loadLevel(index: number): void {
    this.levelIndex = index;
    this.state = 'playing';
    // Load level from ASCII in main.ts via callback
    if (this.onLevelLoad) this.onLevelLoad(index);
  }
  
  onLevelLoad: ((index: number) => void) | null = null;
  
  reset(): void {
    this.lives = 3;
    this.score = 0;
    this.levelIndex = 0;
    this.state = 'playing';
    this.playerX = 0;
    this.playerY = 0;
    this.playerVX = 0;
    this.playerVY = 0;
    this.grounded = false;
    this.coyote = 0;
    this.jumpBuffer = 0;
  }
}