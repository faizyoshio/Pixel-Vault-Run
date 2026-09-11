import * as THREE from 'three';

export class SceneInitializer {
    static createScene(): THREE.Scene {
        const scene = new THREE.Scene();

        // Set background color (sky blue)
        scene.background = new THREE.Color(0x87CEEB);

        return scene;
    }
}