import * as THREE from 'three';
import { GameObject } from './GameObject';

export class PuzzlePiece implements GameObject {
    position: THREE.Vector3;
    rotation: THREE.Euler = new THREE.Euler();
    scale: THREE.Vector3 = new THREE.Vector3(1,1,1);
    private collected = false;

    constructor(position: THREE.Vector3) {
        this.position = position.clone();
    }
    canBeCollected(): boolean {
        return !this.collected;
    }
    collect(): void {
        this.collected = true;
    }
    isCollected(): boolean {
        return this.collected;
    }
    update(_deltaTime: number) {}
    render() {}
    onCollision(_other: GameObject) {}
}
