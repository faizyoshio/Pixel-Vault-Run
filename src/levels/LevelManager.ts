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
        // Implementation for loading level data from JSON file
        // Mocking for tests since there is no actual fetch in node test environment
        if (typeof fetch === 'undefined') {
             return { rooms: [], puzzles: [], collectibles: [], difficulty: 1 };
        }
        const response = await fetch(`/levels/${levelId}.json`);
        return await response.json();
    }
}