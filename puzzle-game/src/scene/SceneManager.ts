import * as THREE from 'three';
import { GameObject } from '../lib/types';
import { engineCore } from '../engine/core';

interface SceneManagerOptions {
  canvas?: HTMLCanvasElement;
  width?: number;
  height?: number;
}

export class SceneManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer | null = null;
  private isReady = false;

  constructor(options: SceneManagerOptions = {}) {
    const { canvas, width = 800, height = 600 } = options;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    
    // Check if WebGL is available (browser environment)
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      try {
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.setSize(width, height);
        if (typeof window !== 'undefined') {
          this.renderer.setPixelRatio(window.devicePixelRatio);
        }
      } catch (e) {
        console.warn('WebGL not available, using mock renderer');
        this.renderer = null;
      }
    }

    // Add basic lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);

    this.isReady = true;
  }

  async initialize(): Promise<void> {
    if (!this.isReady) {
      throw new Error('SceneManager not initialized properly');
    }

    // Add the renderer to the DOM if not provided
    if (typeof document !== 'undefined' && this.renderer && this.renderer.domElement.parentElement === null) {
      document.body.appendChild(this.renderer.domElement);
    }

    // Set up resize handler
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.handleResize.bind(this));
    }
  }

  private handleResize(): void {
    if (typeof window === 'undefined' || !this.renderer) return;
    
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  addGameObject(obj: GameObject): void {
    if (obj instanceof THREE.Object3D) {
      this.scene.add(obj);
      engineCore.addGameObject(obj);
    }
  }

  removeGameObject(obj: GameObject): void {
    if (obj instanceof THREE.Object3D) {
      this.scene.remove(obj);
      engineCore.removeGameObject(obj);
    }
  }

  getScene(): THREE.Scene {
    return this.scene;
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  getRenderer(): THREE.WebGLRenderer | null {
    return this.renderer;
  }

  isReadyState(): boolean {
    return this.isReady;
  }

  loadLevel(levelId: string): void {
    // Load level assets into scene
  }

  update(deltaTime: number): void {
    // Per-frame scene updates (animations, physics) hook here in later tasks
  }

  dispose(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.handleResize.bind(this));
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    this.scene.clear();
    this.isReady = false;
  }
}

export const sceneManager = new SceneManager();