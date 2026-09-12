const SAVE_KEY = 'puzzle-game-progress';

type Save = {
  key: boolean; won: boolean; currentRoom: string; plateActivated: boolean; portalOpen: boolean;
  mirror1Angle: number; mirror2Angle: number; targetHit: boolean;
};

const initialState = (): Save => ({
  key: false, won: false, currentRoom: 'key-room', plateActivated: false, portalOpen: false,
  mirror1Angle: 0, mirror2Angle: 0, targetHit: false,
});

export class PuzzleProgress {
  private state: Save;

  constructor() {
    try { this.state = { ...initialState(), ...JSON.parse(localStorage.getItem(SAVE_KEY) ?? '{}') }; }
    catch { this.state = initialState(); }
  }

  get hasKey(): boolean { return this.state.key; }
  get won(): boolean { return this.state.won; }
  get currentRoom(): string { return this.state.currentRoom; }
  get plateActivated(): boolean { return this.state.plateActivated; }
  get portalOpen(): boolean { return this.state.portalOpen; }
  get mirror1Angle(): number { return this.state.mirror1Angle; }
  get mirror2Angle(): number { return this.state.mirror2Angle; }
  get targetHit(): boolean { return this.state.targetHit; }
  canExit(): boolean { return this.state.key && !this.state.won; }
  canUseFinalExit(): boolean { return this.state.targetHit && !this.state.won; }
  collectKey(): void { this.state.key = true; this.save(); }
  goToPlateRoom(): void { this.state.currentRoom = 'plate-room'; this.save(); }
  activatePlate(): void { this.state.plateActivated = true; this.state.portalOpen = true; this.save(); }
  enterPortal(): void { if (this.state.portalOpen) { this.state.won = true; this.save(); } }
  goToLaserRoom(): void { this.state.currentRoom = 'laser-room'; this.save(); }
  rotateMirror(mirror: 1 | 2): void {
    const key = mirror === 1 ? 'mirror1Angle' : 'mirror2Angle';
    this.state[key] = (this.state[key] + 90) % 360;
    this.save();
  }
  hitTarget(): void { if (!this.state.targetHit) { this.state.targetHit = true; this.save(); } }
  useFinalExit(): void { if (this.canUseFinalExit()) { this.state.won = true; this.save(); } }
  reset(): void { this.state = initialState(); localStorage.removeItem(SAVE_KEY); }

  private save(): void { localStorage.setItem(SAVE_KEY, JSON.stringify(this.state)); }
}
