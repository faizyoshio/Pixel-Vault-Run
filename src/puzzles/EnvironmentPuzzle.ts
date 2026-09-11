import * as THREE from 'three';
import { EnvironmentObject } from '../objects/EnvironmentObject';
import { Puzzle } from './PuzzleLogic';

export class EnvironmentPuzzle implements Puzzle {
    constructor(private objects: EnvironmentObject[], private constraints: any) {}
    
    isValid(): boolean {
        return this.objects.every(obj => obj.isSolid);
    }
    
    start(): void {
    }
    
    reset(): void {
    }
}