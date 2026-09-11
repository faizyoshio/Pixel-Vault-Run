import { GameObject } from '../lib/types';
import { gameState } from '../lib/game-state';

export class EngineCore {
  private running = false;
  private lastTime = 0;
  private gameObjects: GameObject[] = [];
  private animationFrameId: number | null = null;

  addGameObject(obj: GameObject): void {
    this.gameObjects.push(obj);
  }

  removeGameObject(obj: GameObject): void {
    const index = this.gameObjects.indexOf(obj);
    if (index !== -1) {
      this.gameObjects.splice(index, 1);
    }
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.loop();
  }

  stop(): void {
    this.running = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private loop = (): void => {
    if (!this.running) return;

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000; // seconds
    this.lastTime = currentTime;

    this.update(deltaTime);

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private update(deltaTime: number): void {
    for (const obj of this.gameObjects) {
      obj.update(deltaTime);
    }
  }

  dispose(): void {
    this.stop();
    for (const obj of this.gameObjects) {
      obj.dispose();
    }
    this.gameObjects = [];
  }

  isRunning(): boolean {
    return this.running;
  }
}

export const engineCore = new EngineCore();