import { LevelData, LevelDataJson } from './LevelData';

export class LevelManager {
    private levels: Map<string, LevelData> = new Map();
    
    async loadLevel(levelId: string): Promise<LevelData> {
        if (!this.levels.has(levelId)) {
            const data = await this.loadLevelData(levelId);
            this.levels.set(levelId, new LevelData(data));
        }
        return this.levels.get(levelId)!;
    }
    
    private async loadLevelData(levelId: string): Promise<LevelDataJson> {
        // Mock implementation for testing
        return {
            rooms: [],
            puzzles: [],
            collectibles: [],
            difficulty: 1
        };
    }
}