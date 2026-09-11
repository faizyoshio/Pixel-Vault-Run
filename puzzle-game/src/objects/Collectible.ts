import * as THREE from 'three';
import { GameObject } from './GameObject';

export class Collectible implements GameObject {
    position: THREE.Vector3;
    rotation: THREE.Euler = new THREE.Euler();
    scale: THREE.Vector3 = new THREE.Vector3(1,1,1);
    isCollected = false;
    constructor(public type: string, initialPos: THREE.Vector3) {
        this.position = initialPos.clone();
    }
    collect(): void { this.isCollected = true; }
    update(_deltaTime: number) {}
    render() {}
    onCollision(_other: GameObject) {}
}
