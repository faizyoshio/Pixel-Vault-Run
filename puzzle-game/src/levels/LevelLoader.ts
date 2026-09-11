import { LevelManager } from './LevelManager';
import { LevelData } from './LevelData';

export class LevelLoader {
    static async loadLevel(levelId: string): Promise<LevelData> {
        const levelManager = new LevelManager();
        return await levelManager.loadLevel(levelId);
    }
}