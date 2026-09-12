import * as THREE from 'three';
import { PuzzleProgress } from './game/PuzzleProgress';

const progress = new PuzzleProgress();
const hud = document.querySelector<HTMLElement>('#hud')!;
const message = document.querySelector<HTMLElement>('#message')!;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
document.querySelector('#game-container')!.append(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101723);
const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 1.65, 6);
scene.add(new THREE.HemisphereLight(0xaac8ff, 0x1b1720, 2));
const lamp = new THREE.PointLight(0xffd9a0, 25, 20);
lamp.position.set(0, 4, 1);
scene.add(lamp);

const material = (color: number) => new THREE.MeshStandardMaterial({ color, roughness: .75 });
const box = (size: THREE.Vector3, position: THREE.Vector3, color: number) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), material(color));
  mesh.position.copy(position); scene.add(mesh); return mesh;
};

// Room 1: key-room
box(new THREE.Vector3(12, .2, 12), new THREE.Vector3(0, 0, 0), 0x303846);
box(new THREE.Vector3(12, 5, .2), new THREE.Vector3(0, 2.5, -6), 0x273246);
box(new THREE.Vector3(.2, 5, 12), new THREE.Vector3(-6, 2.5, 0), 0x273246);
box(new THREE.Vector3(.2, 5, 12), new THREE.Vector3(6, 2.5, 0), 0x273246);
box(new THREE.Vector3(12, .2, 12), new THREE.Vector3(0, 5, 0), 0x1c2533);

// Room 2: plate-room, connected through the unlocked exit
box(new THREE.Vector3(12, .2, 12), new THREE.Vector3(14, 0, -6), 0x303846);
box(new THREE.Vector3(12, 5, .2), new THREE.Vector3(14, 2.5, -12), 0x273246);
box(new THREE.Vector3(.2, 5, 12), new THREE.Vector3(8, 2.5, -6), 0x273246);
box(new THREE.Vector3(.2, 5, 12), new THREE.Vector3(20, 2.5, -6), 0x273246);
box(new THREE.Vector3(12, .2, 12), new THREE.Vector3(14, 5, -6), 0x1c2533);

const key = new THREE.Mesh(new THREE.TorusGeometry(.23, .07, 10, 24), material(0xffcc33));
key.position.set(-2, 1.25, -1); key.rotation.x = Math.PI / 2; scene.add(key);
const exit = new THREE.Mesh(new THREE.BoxGeometry(1.6, 3, .25), material(0x90333b));
exit.position.set(0, 1.5, -5.82); scene.add(exit);

// Pressure plate in room 2 — stepping on it opens the final portal
const plate = new THREE.Mesh(new THREE.CylinderGeometry(.5, .6, .12, 16), material(0x7a5a1a));
plate.position.set(14, 0.06, -6); scene.add(plate);
const plateRing = new THREE.Mesh(new THREE.TorusGeometry(.62, .05, 16, 24), material(0xffcc33));
plateRing.position.set(14, 0.12, -6); plateRing.rotation.x = Math.PI / 2; scene.add(plateRing);

// Final portal — appears once the plate is pressed
const portal = new THREE.Mesh(new THREE.BoxGeometry(2, 3.2, .2), material(0x4dbd75));
portal.position.set(14, 1.6, -11.8); portal.visible = false; scene.add(portal);

const raycaster = new THREE.Raycaster();
const keys = new Set<string>();
let yaw = 0, pitch = 0, last = performance.now(), notice = '', won = progress.won;

function updateHud() {
  hud.textContent = won ? 'ESCAPED — Progress saved' : `KEY: ${progress.hasKey ? 'FOUND' : 'MISSING'}   EXIT: ${progress.hasKey ? 'UNLOCKED' : 'LOCKED'}   ROOM: ${progress.currentRoom}   PORTAL: ${progress.portalOpen ? 'OPEN' : 'CLOSED'}`;
  message.textContent = notice || (document.pointerLockElement ? 'WASD move · click / E interact' : 'Click to begin');
}
function interact() {
  raycaster.setFromCamera(new THREE.Vector2(), camera);
  const hit = raycaster.intersectObjects([key, exit, plate, portal], false)[0]?.object;
  if (hit === key && !progress.hasKey) { progress.collectKey(); scene.remove(key); notice = 'Key collected. Find the exit.'; }
  else if (hit === exit) {
    if (progress.canExit()) { progress.goToPlateRoom(); exit.material = material(0x4dbd75); notice = 'Exit unlocked. Cross to the next room.'; }
    else notice = 'The exit needs a key.';
  }
  else if (hit === plate && !progress.plateActivated) { progress.activatePlate(); notice = 'The pressure plate activates the portal.'; }
  else if (hit === portal && progress.portalOpen) { progress.enterPortal(); won = true; notice = 'You escaped.'; }
  updateHud();
}
function checkPlate() {
  if (progress.plateActivated) return;
  const dx = camera.position.x - 14, dz = camera.position.z - (-6);
  if (Math.hypot(dx, dz) < 0.7) progress.activatePlate();
}
addEventListener('keydown', event => { keys.add(event.key.toLowerCase()); if (event.key.toLowerCase() === 'e') interact(); });
addEventListener('keyup', event => keys.delete(event.key.toLowerCase()));
renderer.domElement.addEventListener('click', () => {
  if (document.pointerLockElement !== renderer.domElement) renderer.domElement.requestPointerLock(); else interact();
});
addEventListener('mousemove', event => {
  if (document.pointerLockElement === renderer.domElement) {
    yaw -= event.movementX * .002; pitch = THREE.MathUtils.clamp(pitch - event.movementY * .002, -1.4, 1.4);
  }
});
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
if (progress.hasKey) scene.remove(key);
if (progress.won) { exit.material = material(0x4dbd75); portal.visible = true; }
if (progress.portalOpen) portal.visible = true;
updateHud();
function frame(now: number) {
  const dt = Math.min((now - last) / 1000, .05); last = now;
  const move = new THREE.Vector3((keys.has('d') ? 1 : 0) - (keys.has('a') ? 1 : 0), 0, (keys.has('s') ? 1 : 0) - (keys.has('w') ? 1 : 0));
  if (move.lengthSq()) { move.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw); camera.position.addScaledVector(move, 3 * dt); camera.position.x = THREE.MathUtils.clamp(camera.position.x, -5.3, 19.7); camera.position.z = THREE.MathUtils.clamp(camera.position.z, -5.3, -0.7); }
  camera.rotation.set(pitch, yaw, 0, 'YXZ');
  if (!progress.hasKey) { key.rotation.z += dt; key.position.y = 1.25 + Math.sin(now / 350) * .1; }
  checkPlate();
  if (progress.portalOpen) portal.visible = true;
  renderer.render(scene, camera); requestAnimationFrame(frame);
}
requestAnimationFrame(frame);