import * as THREE from 'three';
import { Collectible } from '../objects/Collectible';
import { Puzzle } from './PuzzleLogic';

export class ItemCollectionPuzzle implements Puzzle {
    constructor(private items: Collectible[]) {}
    
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
            item.collect();
        });
    }
}