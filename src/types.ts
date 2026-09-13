export type TileType = 'empty' | 'ground' | 'coin' | 'enemy' | 'goal' | 'player_start';

export interface Vec2 {
  x: number;
  y: number;
}

export interface Size {
  w: number;
  h: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LevelData {
  tiles: TileType[][];
  width: number;
  height: number;
  playerStart: Vec2;
}

export interface Entity {
  pos: Vec2;
  vel: Vec2;
  size: Size;
  alive: boolean;
  update(dt: number, ...args: unknown[]): void;
}

export const TILE_SIZE = 16;
export const GRAVITY = 0.45;
export const MAX_FALL_SPEED = 8;
export const MOVE_ACCEL = 0.4;
export const MAX_SPEED = 2.5;
export const JUMP_FORCE = -7.5;
export const JUMP_HOLD_FORCE = -0.3;
export const COYOTE_TIME = 6; // frames
export const JUMP_BUFFER = 6; // frames