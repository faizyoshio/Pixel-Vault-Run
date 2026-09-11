import * as THREE from 'three';
import { Collectible } from '../objects/Collectible';
import { Puzzle } from './PuzzleLogic';

export class ItemCollectionPuzzle implements Puzzle {
    id: string;
    type: string;
    position: THREE.Vector3;
    solved: boolean = false;

    constructor(private items: Collectible[], id?: string) {
        this.id = id || `item_puzzle_${Math.random()}`;
        this.type = 'item_collection';
        this.position = new THREE.Vector3();
        if (items.length > 0) {
            this.position.copy(items[0].position);
        }
    }
    
    isValid(): boolean {
        return this.items.every(item => item.isCollected);
    }
    
    start(): void {
        this.items.forEach(item => {
            item.collect();
        });
    }
    
    reset(): void {
        this.items.forEach(item => {
            // Need a reset mechanism in Collectible
        });
    }
}
