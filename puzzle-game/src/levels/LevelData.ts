import * as THREE from 'three';
import { Puzzle, PuzzleFactory } from '../puzzles/PuzzleLogic';
import { Collectible } from '../objects/Collectible';

export class LevelRoom {
    constructor(
        public id: string,
        public position: THREE.Vector3,
        public size: THREE.Vector3,
        public connections: string[] = []
    ) {}
}

export interface LevelDataJson {
    rooms: { id: string, position: { x: number, y: number, z: number }, size: { x: number, y: number, z: number }, connections?: string[] }[];
    puzzles: any[];
    collectibles: any[];
    difficulty: number;
}

export class LevelData {
    rooms: LevelRoom[];
    puzzles: Puzzle[];
    collectibles: Collectible[];
    difficulty: number;
    
    constructor(data: LevelDataJson) {
        this.rooms = data.rooms.map(r => new LevelRoom(
            r.id,
            new THREE.Vector3(r.position.x, r.position.y, r.position.z),
            new THREE.Vector3(r.size.x, r.size.y, r.size.z),
            r.connections || []
        ));
        this.puzzles = data.puzzles.map(p => PuzzleFactory.create(p));
        this.collectibles = data.collectibles.map(c => new Collectible(c.type || 'generic', new THREE.Vector3(c.position?.x || 0, c.position?.y || 0, c.position?.z || 0)));
        this.difficulty = data.difficulty || 1;
    }
}