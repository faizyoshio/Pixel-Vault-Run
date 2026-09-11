import { GameLoop } from './GameLoop';
import { SceneManager } from '../scene/SceneManager';
import { InputManager } from '../inputs/InputManager';
import { LevelManager } from '../levels/LevelManager';
import { GameState as GameStateType } from '../lib/game-state';

interface GameState {
    currentLevel: string;
    isInitialized: boolean;
}

export class GameController {
    private gameState: GameState = {
        currentLevel: '',
        isInitialized: false
    };
    private gameLoop: GameLoop;
    private sceneManager: SceneManager;
    private inputManager: InputManager;
    private levelManager: LevelManager;
    
    constructor() {
        this.sceneManager = new SceneManager();
        this.inputManager = new InputManager();
        this.levelManager = new LevelManager();
        this.gameLoop = new GameLoop(this.update.bind(this));
    }
    
    async initialize(): Promise<void> {
        await this.sceneManager.initialize();
        this.inputManager.setup();
        this.gameState.isInitialized = true;
        this.gameLoop.start();
    }
    
    isReady(): boolean {
        return this.gameState.isInitialized;
    }
    
    startLevel(levelId: string): void {
        this.gameState.currentLevel = levelId;
        this.sceneManager.loadLevel(levelId);
    }
    
    getCurrentLevel(): string {
        return this.gameState.currentLevel;
    }
    
    private update(deltaTime: number): void {
        this.sceneManager.update(deltaTime);
        this.inputManager.update();
    }
}