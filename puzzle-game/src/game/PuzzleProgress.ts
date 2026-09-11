const SAVE_KEY = 'puzzle-game-progress';

type Save = { key: boolean; won: boolean };

export class PuzzleProgress {
  private state: Save;

  constructor() {
    try {
      this.state = { key: false, won: false, ...JSON.parse(localStorage.getItem(SAVE_KEY) ?? '{}') };
    } catch {
      this.state = { key: false, won: false };
    }
  }

  get hasKey(): boolean { return this.state.key; }
  get won(): boolean { return this.state.won; }
  canExit(): boolean { return this.state.key && !this.state.won; }
  collectKey(): void { this.state.key = true; this.save(); }
  win(): void { if (this.state.key) { this.state.won = true; this.save(); } }
  reset(): void { this.state = { key: false, won: false }; localStorage.removeItem(SAVE_KEY); }

  private save(): void { localStorage.setItem(SAVE_KEY, JSON.stringify(this.state)); }
}
