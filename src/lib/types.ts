export type Vector3 = { x: number; y: number; z: number };

export type GameStateData = {
  currentLevel: string;
  collectedItems: string[];
  solvedPuzzles: string[];
  playerPosition: Vector3;
  playerRotation: Vector3;
  health: number;
  score: number;
  isInitialized: boolean;
};

export type GameObject = {
  id: string;
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  visible: boolean;
  update(deltaTime: number): void;
  dispose(): void;
};

export type PuzzlePieceData = {
  id: string;
  position: Vector3;
  targetPosition: Vector3;
  isCollected: boolean;
};

export type LevelRoomData = {
  id: string;
  name: string;
  position: Vector3;
  dimensions: Vector3;
  exits: string[];
  objects: GameObject[];
};

export type LevelDataJson = {
  rooms: LevelRoomData[];
  puzzles: PuzzlePieceData[];
  collectibles: string[];
  difficulty: number;
};