import * as THREE from 'three';
import { EnvironmentObject } from '../objects/EnvironmentObject';
import { Puzzle } from './PuzzleLogic';

export class EnvironmentPuzzle implements Puzzle {
    id: string;
    type: string;
    position: THREE.Vector3;
    solved: boolean = false;

    constructor(private objects: EnvironmentObject[], private constraints: any, id?: string) {
        this.id = id || `env_puzzle_${Math.random()}`;
        this.type = 'environment';
        this.position = new THREE.Vector3();
        if (objects.length > 0) {
            this.position.copy(objects[0].position);
        }
    }
    
    isValid(): boolean {
        return this.objects.every(obj => obj.isSolid);
    }
    
    start(): void {
    }
    
    reset(): void {
    }
}
