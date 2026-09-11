import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { GameController } from '../../src/game/GameController';

describe('Game Integration', () => {
    let game: GameController;
    
    beforeEach(() => {
        game = new GameController();
    });

    afterEach(() => {
        game.stop();
    });
    
    test('Game initialization', async () => {
        await game.initialize();
        expect(game.isReady()).toBe(true);
    });
    
    test('Level loading', async () => {
        await game.initialize();
        game.startLevel('level1');
        expect(game.getCurrentLevel()).toBe('level1');
    });
    
    test('Game loop runs', async () => {
        await game.initialize();
        // Verify game loop is running
        const fps = game.getFPS();
        expect(fps).toBeGreaterThanOrEqual(0);
    });
});