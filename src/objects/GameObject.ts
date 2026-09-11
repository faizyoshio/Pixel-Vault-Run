export interface GameObject {
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
    update(deltaTime: number): void;
    render(): void;
    onCollision(other: GameObject): void;
}