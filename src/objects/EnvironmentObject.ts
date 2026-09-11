import * as THREE from 'three';
import { GameObject } from './GameObject';

export class EnvironmentObject implements GameObject {
    position: THREE.Vector3;
    rotation: THREE.Euler = new THREE.Euler();
    scale: THREE.Vector3 = new THREE.Vector3(1,1,1);
    constructor(public type: string, initialPos: THREE.Vector3, public isSolid: boolean) {
        this.position = initialPos.clone();
    }
    update(_deltaTime: number) {}
    render() {}
    onCollision(_other: GameObject) {}
}
