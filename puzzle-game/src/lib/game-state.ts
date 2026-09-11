import { GameStateData, Vector3 } from './types';

const SAVE_KEY = '3d-puzzle-game-save';

const defaultState: GameStateData = {
  currentLevel: 'level1',
  collectedItems: [],
  solvedPuzzles: [],
  playerPosition: { x: 0, y: 0, z: 0 },
  playerRotation: { x: 0, y: 0, z: 0 },
  health: 3,
  score: 0,
  isInitialized: false,
};

export class GameState {
  private state: GameStateData;

  constructor() {
    this.state = this.load();
  }

  private load(): GameStateData {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        return { ...defaultState, ...JSON.parse(saved) };
      }
    } catch {
      // Ignore parse errors, use default
    }
    return { ...defaultState };
  }

  private save(): void {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
    } catch {
      // Ignore save errors (quota exceeded, etc.)
    }
  }

  get currentLevel(): string {
    return this.state.currentLevel;
  }

  set currentLevel(level: string) {
    this.state.currentLevel = level;
    this.save();
  }

  get collectedItems(): string[] {
    return [...this.state.collectedItems];
  }

  addCollectedItem(itemId: string): void {
    if (!this.state.collectedItems.includes(itemId)) {
      this.state.collectedItems.push(itemId);
      this.save();
    }
  }

  get solvedPuzzles(): string[] {
    return [...this.state.solvedPuzzles];
  }

  addSolvedPuzzle(puzzleId: string): void {
    if (!this.state.solvedPuzzles.includes(puzzleId)) {
      this.state.solvedPuzzles.push(puzzleId);
      this.save();
    }
  }

  get playerPosition(): Vector3 {
    return { ...this.state.playerPosition };
  }

  set playerPosition(pos: Vector3) {
    this.state.playerPosition = { ...pos };
    this.save();
  }

  get playerRotation(): Vector3 {
    return { ...this.state.playerRotation };
  }

  set playerRotation(rot: Vector3) {
    this.state.playerRotation = { ...rot };
    this.save();
  }

  get health(): number {
    return this.state.health;
  }

  set health(value: number) {
    this.state.health = Math.max(0, Math.min(3, value));
    this.save();
  }

  get score(): number {
    return this.state.score;
  }

  addScore(points: number): void {
    this.state.score += points;
    this.save();
  }

  get isInitialized(): boolean {
    return this.state.isInitialized;
  }

  set isInitialized(value: boolean) {
    this.state.isInitialized = value;
    this.save();
  }

  reset(): void {
    this.state = { ...defaultState };
    this.save();
  }
}

export const gameState = new GameState();