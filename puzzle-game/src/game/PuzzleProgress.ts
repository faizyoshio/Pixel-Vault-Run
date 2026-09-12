const SAVE_KEY = 'puzzle-game-progress';

type Save = { key: boolean; won: boolean; currentRoom: string; plateActivated: boolean; portalOpen: boolean };

export class PuzzleProgress {
  private state: Save;

  constructor() {
    try {
      this.state = { key: false, won: false, currentRoom: 'key-room', plateActivated: false, portalOpen: false, ...JSON.parse(localStorage.getItem(SAVE_KEY) ?? '{}') };
    } catch {
      this.state = { key: false, won: false, currentRoom: 'key-room', plateActivated: false, portalOpen: false };
    }
  }

  get hasKey(): boolean { return this.state.key; }
  get won(): boolean { return this.state.won; }
  get currentRoom(): string { return this.state.currentRoom; }
  get plateActivated(): boolean { return this.state.plateActivated; }
  get portalOpen(): boolean { return this.state.portalOpen; }
  canExit(): boolean { return this.state.key && !this.state.won; }
  collectKey(): void { this.state.key = true; this.save(); }
  goToPlateRoom(): void { this.state.currentRoom = 'plate-room'; this.save(); }
  activatePlate(): void { this.state.plateActivated = true; this.state.portalOpen = true; this.save(); }
  enterPortal(): void { if (this.state.portalOpen) { this.state.won = true; this.save(); } }
  reset(): void { this.state = { key: false, won: false, currentRoom: 'key-room', plateActivated: false, portalOpen: false }; localStorage.removeItem(SAVE_KEY); }

  private save(): void { localStorage.setItem(SAVE_KEY, JSON.stringify(this.state)); }
}
