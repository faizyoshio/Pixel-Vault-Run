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
  private renderer: THREE.WebGLRenderer;
  private isReady = false;

  constructor(options: SceneManagerOptions = {}) {
    const { canvas, width = window.innerWidth, height = window.innerHeight } = options;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Add basic lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);

    this.isReady = true;
  }

  initialize(): void {
    if (!this.isReady) {
      throw new Error('SceneManager not initialized properly');
    }

    // Add the renderer to the DOM if not provided
    if (!this.renderer.domElement.parentElement) {
      document.body.appendChild(this.renderer.domElement);
    }

    // Set up resize handler
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  private handleResize(): void {
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

  getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  dispose(): void {
    window.removeEventListener('resize', this.handleResize.bind(this));
    this.renderer.dispose();
    this.scene.clear();
    this.isReady = false;
  }
}

export const sceneManager = new SceneManager();