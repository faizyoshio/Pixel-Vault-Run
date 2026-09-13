import { LevelData, TileType, Vec2, TILE_SIZE } from '../types';

const LEVELS_ASCII: string[] = [
  `....................
....................
....................
....................
....................
....................
.........@..........
....................
....G...............
..=========......===
....................
....=====...........
............========
====================`,
  `....................
....................
...........@........
....................
....G...............
..=========......===
............========
....=====...........
...........========.
....................
....===============.
.................F..
====================`,
  `....................
...........@........
....................
....G....G..........
..=========......===
............========
....=====....G......
...........========.
....===============.
....................
.................F..
====================`
];

const CHAR_MAP: Record<string, TileType> = {
  '.': 'empty',
  '=': 'ground',
  '@': 'player_start',
  'C': 'coin',
  'G': 'enemy',
  'F': 'goal'
};

export function parseLevel(ascii: string): LevelData {
  const lines = ascii.trim().split('\n');
  const height = lines.length;
  const width = lines[0].length;
  const tiles: TileType[][] = [];
  let playerStart: Vec2 = { x: 0, y: 0 };
  
  for (let y = 0; y < height; y++) {
    const row: TileType[] = [];
    for (let x = 0; x < width; x++) {
      const char = lines[y][x];
      const type = CHAR_MAP[char] || 'empty';
      row.push(type);
      if (type === 'player_start') {
        playerStart = { x: x * TILE_SIZE, y: y * TILE_SIZE };
      }
    }
    tiles.push(row);
  }
  
  return { tiles, width, height, playerStart };
}

export function getLevels(): LevelData[] {
  return LEVELS_ASCII.map(parseLevel);
}

export function getLevel(index: number): LevelData {
  return parseLevel(LEVELS_ASCII[Math.min(index, LEVELS_ASCII.length - 1)]);
}