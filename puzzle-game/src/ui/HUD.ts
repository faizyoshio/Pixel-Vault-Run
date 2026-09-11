export class HUD {
  updateScore(score: number): void {
    const el = document.getElementById('score-display');
    if (el) el.textContent = `Score: ${score}`;
  }

  updateHealth(health: number): void {
    const el = document.getElementById('health-display');
    if (el) el.textContent = `Health: ${health}`;
  }

  getScoreDisplay(): string {
    return document.getElementById('score-display')?.textContent || '';
  }

  getHealthDisplay(): string {
    return document.getElementById('health-display')?.textContent || '';
  }
}
