export class SpatialPuzzle {
    constructor(private pieces: PuzzlePiece[], private targetPosition: THREE.Vector3) {}
    
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