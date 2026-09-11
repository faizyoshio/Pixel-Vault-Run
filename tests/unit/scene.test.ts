import { expect, test } from 'vitest';
import * as THREE from 'three';
import { SceneInitializer } from '../../src/scene/SceneInitializer';

test('SceneInitializer.createScene returns a valid Three.js scene', () => {
  const scene = SceneInitializer.createScene();
  expect(scene).not.toBeNull();
  expect(scene).toBeInstanceOf(THREE.Scene);
  expect(scene.background).toBeDefined();
  expect(scene.background).toBeInstanceOf(THREE.Color);
});

test('SceneInitializer.createScene sets sky blue background', () => {
  const scene = SceneInitializer.createScene();
  expect(scene.background?.getHex()).toBe(0x87CEEB);
});