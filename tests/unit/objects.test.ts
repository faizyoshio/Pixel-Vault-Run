import * as THREE from 'three';
import { GameObject } from './GameObject';

describe('Game Object System', () => {
    test('PuzzlePiece collect interaction', () => {
        const piece = new PuzzlePiece({ position: new THREE.Vector3(0, 0, 0) });
        expect(piece.canBeCollected()).toBe(true);
        piece.collect();
        expect(piece.isCollected()).toBe(true);
    });

    test('Player movement and collision', () => {
        const player = new Player(new THREE.Vector3(0, 0, 0));
        expect(player.position.x).toBe(0);
        player.move(new THREE.Vector3(1, 0, 0));
        expect(player.position.x).toBe(1);
    });

    test('Collectible item detection', () => {
        const item = new Collectible('key', new THREE.Vector3(5, 0, 0));
        expect(item.type).toBe('key');
        expect(item.isCollected).toBe(false);
        item.collect();
        expect(item.isCollected).toBe(true);
    });

    test('EnvironmentObject static properties', () => {
        const wall = new EnvironmentObject('wall', new THREE.Vector3(0, 0, 0), true);
        expect(wall.isSolid).toBe(true);
    });
});
