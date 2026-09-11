import { describe, expect, test, beforeEach, vi } from 'vitest';
import { HUD } from '../../src/ui/HUD';
import { Inventory } from '../../src/ui/Inventory';
import { PauseMenu } from '../../src/ui/PauseMenu';
import { UIManager } from '../../src/ui/UIManager';

describe('UI System', () => {
  describe('HUD', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="score-display"></div>
        <div id="health-display"></div>
      `;
    });

    test('HUD updates score display', () => {
      const hud = new HUD();
      hud.updateScore(100);
      expect(hud.getScoreDisplay()).toContain('Score: 100');
    });

    test('HUD updates health display', () => {
      const hud = new HUD();
      hud.updateHealth(3);
      expect(hud.getHealthDisplay()).toContain('Health: 3');
    });

    test('HUD handles missing elements gracefully', () => {
      document.body.innerHTML = '';
      const hud = new HUD();
      expect(() => hud.updateScore(50)).not.toThrow();
      expect(() => hud.updateHealth(2)).not.toThrow();
      expect(hud.getScoreDisplay()).toBe('');
      expect(hud.getHealthDisplay()).toBe('');
    });
  });

  describe('Inventory', () => {
    beforeEach(() => {
      document.body.innerHTML = '<div id="inventory-container"></div>';
    });

    test('Inventory adds items', () => {
      const inventory = new Inventory();
      inventory.addItem('key');
      inventory.addItem('coin');
      expect(inventory.getItems()).toContain('key');
      expect(inventory.getItems()).toContain('coin');
    });

    test('Inventory removes items', () => {
      const inventory = new Inventory();
      inventory.addItem('key');
      inventory.removeItem('key');
      expect(inventory.getItems()).not.toContain('key');
    });

    test('Inventory checks for item', () => {
      const inventory = new Inventory();
      inventory.addItem('key');
      expect(inventory.hasItem('key')).toBe(true);
      expect(inventory.hasItem('coin')).toBe(false);
    });

    test('Inventory clears all items', () => {
      const inventory = new Inventory();
      inventory.addItem('key');
      inventory.addItem('coin');
      inventory.clear();
      expect(inventory.getItems()).toHaveLength(0);
    });

    test('Inventory handles missing container gracefully', () => {
      document.body.innerHTML = '';
      const inventory = new Inventory();
      expect(() => inventory.addItem('key')).not.toThrow();
      expect(() => inventory.removeItem('key')).not.toThrow();
      expect(inventory.getItems()).toHaveLength(0);
    });
  });

  describe('PauseMenu', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="pause-menu" style="display: none;">
          <button id="resume-btn">Resume</button>
          <button id="restart-btn">Restart</button>
          <button id="quit-btn">Quit</button>
        </div>
      `;
    });

    test('PauseMenu shows and hides', () => {
      const pauseMenu = new PauseMenu();
      expect(pauseMenu.isVisible()).toBe(false);
      
      pauseMenu.show();
      expect(pauseMenu.isVisible()).toBe(true);
      
      pauseMenu.hide();
      expect(pauseMenu.isVisible()).toBe(false);
    });

    test('PauseMenu callbacks', () => {
      const pauseMenu = new PauseMenu();
      const resumeFn = vi.fn();
      const restartFn = vi.fn();
      const quitFn = vi.fn();
      
      pauseMenu.onResume(resumeFn);
      pauseMenu.onRestart(restartFn);
      pauseMenu.onQuit(quitFn);
      
      pauseMenu.show();
      document.getElementById('resume-btn')?.click();
      document.getElementById('restart-btn')?.click();
      document.getElementById('quit-btn')?.click();
      
      expect(resumeFn).toHaveBeenCalled();
      expect(restartFn).toHaveBeenCalled();
      expect(quitFn).toHaveBeenCalled();
    });

    test('PauseMenu handles missing elements gracefully', () => {
      document.body.innerHTML = '';
      const pauseMenu = new PauseMenu();
      expect(() => pauseMenu.show()).not.toThrow();
      expect(() => pauseMenu.hide()).not.toThrow();
      expect(pauseMenu.isVisible()).toBe(false);
    });
  });

  describe('UIManager', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="score-display"></div>
        <div id="health-display"></div>
        <div id="inventory-container"></div>
        <div id="pause-menu" style="display: none;">
          <button id="resume-btn">Resume</button>
          <button id="restart-btn">Restart</button>
          <button id="quit-btn">Quit</button>
        </div>
      `;
    });

    test('UIManager initializes all components', () => {
      const uiManager = new UIManager();
      expect(uiManager.getHUD()).toBeInstanceOf(HUD);
      expect(uiManager.getInventory()).toBeInstanceOf(Inventory);
      expect(uiManager.getPauseMenu()).toBeInstanceOf(PauseMenu);
    });

    test('UIManager delegates HUD updates', () => {
      const uiManager = new UIManager();
      uiManager.updateScore(200);
      uiManager.updateHealth(5);
      expect(uiManager.getHUD().getScoreDisplay()).toContain('Score: 200');
      expect(uiManager.getHUD().getHealthDisplay()).toContain('Health: 5');
    });

    test('UIManager delegates inventory operations', () => {
      const uiManager = new UIManager();
      uiManager.addToInventory('gem');
      expect(uiManager.getInventory().hasItem('gem')).toBe(true);
    });

    test('UIManager delegates pause menu', () => {
      const uiManager = new UIManager();
      uiManager.showPauseMenu();
      expect(uiManager.getPauseMenu().isVisible()).toBe(true);
      uiManager.hidePauseMenu();
      expect(uiManager.getPauseMenu().isVisible()).toBe(false);
    });

    test('UIManager handles missing DOM gracefully', () => {
      document.body.innerHTML = '';
      const uiManager = new UIManager();
      expect(() => uiManager.updateScore(100)).not.toThrow();
      expect(() => uiManager.addToInventory('item')).not.toThrow();
      expect(() => uiManager.showPauseMenu()).not.toThrow();
    });
  });
});
