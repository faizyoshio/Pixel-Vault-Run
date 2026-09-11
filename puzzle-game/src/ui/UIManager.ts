import { HUD } from './HUD';
import { Inventory } from './Inventory';
import { PauseMenu } from './PauseMenu';

export class UIManager {
  private hud: HUD;
  private inventory: Inventory;
  private pauseMenu: PauseMenu;

  constructor() {
    this.hud = new HUD();
    this.inventory = new Inventory();
    this.pauseMenu = new PauseMenu();
  }

  getHUD(): HUD {
    return this.hud;
  }

  getInventory(): Inventory {
    return this.inventory;
  }

  getPauseMenu(): PauseMenu {
    return this.pauseMenu;
  }

  updateScore(score: number): void {
    this.hud.updateScore(score);
  }

  updateHealth(health: number): void {
    this.hud.updateHealth(health);
  }

  addToInventory(item: string): void {
    this.inventory.addItem(item);
  }

  showPauseMenu(): void {
    this.pauseMenu.show();
  }

  hidePauseMenu(): void {
    this.pauseMenu.hide();
  }
}
