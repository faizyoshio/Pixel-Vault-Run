import * as THREE from 'three';
import { PuzzlePiece } from '../objects/PuzzlePiece';
import { Puzzle } from './PuzzleLogic';

export class SpatialPuzzle implements Puzzle {
    id: string;
    type: string;
    position: THREE.Vector3;
    solved: boolean = false;

    constructor(private pieces: PuzzlePiece[], private targetPosition: THREE.Vector3, id?: string) {
        this.id = id || `spatial_puzzle_${Math.random()}`;
        this.type = 'spatial';
        this.position = targetPosition.clone();
    }
    
    isValid(): boolean {
        return this.pieces.every(piece => 
            piece.isCollected() && 
            this.isPieceAtTarget(piece, this.targetPosition)
        );
    }
    
    movePiece(pieceIndex: number, newPosition: THREE.Vector3): void {
        if (pieceIndex >= 0 && pieceIndex < this.pieces.length) {
            this.pieces[pieceIndex].position.copy(newPosition);
        }
    }
    
    private isPieceAtTarget(piece: PuzzlePiece, target: THREE.Vector3): boolean {
        return piece.position.distanceTo(target) < 0.5;
    }
}
