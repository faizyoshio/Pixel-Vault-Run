export interface Puzzle {
    id: string;
    type: string;
    position: THREE.Vector3;
    solved: boolean;
}

export interface Collectible {
    id: string;
    type: string;
    position: THREE.Vector3;
    collected: boolean;
}

export class PuzzleFactory {
    static create(data: any): Puzzle {
        return {
            id: data.id || `puzzle_${Math.random()}`,
            type: data.type || 'generic',
            position: new THREE.Vector3(data.position?.x || 0, data.position?.y || 0, data.position?.z || 0),
            solved: false
        };
    }
}