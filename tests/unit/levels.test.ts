import { LevelData, LevelRoom } from '../../src/levels/LevelData';
import { LevelManager } from '../../src/levels/LevelManager';
import { LevelLoader } from '../../src/levels/LevelLoader';

describe('Level System', () => {
    test('LevelData initialization', () => {
        const testData = {
            rooms: [{
                id: 'room1',
                position: {x:0, y:0, z:0},
                size: {x:10, y:10, z:10},
                connections: []
            }],
            puzzles: [],
            collectibles: [],
            difficulty: 1
        };
        
        const level = new LevelData(testData);
        expect(level.rooms.length).toBe(1);
        expect(level.puzzles.length).toBe(0);
        expect(level.collectibles.length).toBe(0);
        expect(level.difficulty).toBe(1);
    });
    
    test('LevelManager loading', async () => {
        const manager = new LevelManager();
        const level = await manager.loadLevel('test');
        expect(level).toBeInstanceOf(LevelData);
    });
    
    test('LevelLoader loading', async () => {
        const level = await LevelLoader.loadLevel('test');
        expect(level).toBeInstanceOf(LevelData);
    });
});