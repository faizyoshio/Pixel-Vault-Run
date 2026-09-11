import * as THREE from 'three';
import { GameObject } from './GameObject';

export class Player implements GameObject {
    position: THREE.Vector3;
    rotation: THREE.Euler = new THREE.Euler();
    scale: THREE.Vector3 = new THREE.Vector3(1,1,1);
    constructor(initialPos: THREE.Vector3) {
        this.position = initialPos.clone();
    }
    move(delta: THREE.Vector3) {
        this.position.add(delta);
    }
    update(_deltaTime: number) {}
    render() {}
    onCollision(_other: GameObject) {}
}
