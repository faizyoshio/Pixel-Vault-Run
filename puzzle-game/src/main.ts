import * as THREE from 'three';
import { PuzzleProgress } from './game/PuzzleProgress';
import { traceLaser } from './game/laserPath';

const progress = new PuzzleProgress();
const hud = document.querySelector<HTMLElement>('#hud')!;
const message = document.querySelector<HTMLElement>('#message')!;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio); renderer.setSize(innerWidth, innerHeight);
document.querySelector('#game-container')!.append(renderer.domElement);

const scene = new THREE.Scene(); scene.background = new THREE.Color(0x101723);
const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 1.65, 6);
scene.add(new THREE.HemisphereLight(0xaac8ff, 0x1b1720, 2));
const lamp = new THREE.PointLight(0xffd9a0, 25, 20); lamp.position.set(0, 4, 1); scene.add(lamp);

const material = (color: number, emissive = 0) => new THREE.MeshStandardMaterial({ color, emissive, roughness: .75 });
const box = (size: THREE.Vector3, position: THREE.Vector3, color: number) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), material(color));
  mesh.position.copy(position); scene.add(mesh); return mesh;
};
const room = (x: number, z: number) => {
  box(new THREE.Vector3(12, .2, 12), new THREE.Vector3(x, 0, z), 0x303846);
  box(new THREE.Vector3(12, 5, .2), new THREE.Vector3(x, 2.5, z - 6), 0x273246);
  box(new THREE.Vector3(.2, 5, 12), new THREE.Vector3(x - 6, 2.5, z), 0x273246);
  box(new THREE.Vector3(.2, 5, 12), new THREE.Vector3(x + 6, 2.5, z), 0x273246);
  box(new THREE.Vector3(12, .2, 12), new THREE.Vector3(x, 5, z), 0x1c2533);
};

// Room 1: key-room. Room 2: plate-room. Room 3: laser-room.
room(0, 0); room(14, -6); room(26, -6);
const key = new THREE.Mesh(new THREE.TorusGeometry(.23, .07, 10, 24), material(0xffcc33));
key.position.set(-2, 1.25, -1); key.rotation.x = Math.PI / 2; scene.add(key);
const exit = new THREE.Mesh(new THREE.BoxGeometry(1.6, 3, .25), material(0x90333b)); exit.position.set(0, 1.5, -5.82); scene.add(exit);
const plate = new THREE.Mesh(new THREE.CylinderGeometry(.5, .6, .12, 16), material(0x7a5a1a)); plate.position.set(14, .06, -6); scene.add(plate);
const plateRing = new THREE.Mesh(new THREE.TorusGeometry(.62, .05, 16, 24), material(0xffcc33)); plateRing.position.set(14, .12, -6); plateRing.rotation.x = Math.PI / 2; scene.add(plateRing);
const portal = new THREE.Mesh(new THREE.BoxGeometry(2, 3.2, .2), material(0x4dbd75, 0x164d30)); portal.position.set(14, 1.6, -11.8); portal.visible = false; scene.add(portal);

// Laser-room: broad mirror panels give stable 90-degree reflections.
const emitter = new THREE.Mesh(new THREE.CylinderGeometry(.28, .28, 1.2, 16), material(0xff3344, 0x661111)); emitter.position.set(23, .6, -6); emitter.rotation.x = Math.PI / 2; scene.add(emitter);
const makeMirror = (x: number, z: number) => {
  const pivot = new THREE.Group(); pivot.position.set(x, 1.1, z);
  const panel = new THREE.Mesh(new THREE.BoxGeometry(.14, 1.8, 2), material(0xc8e4ff, 0x153050)); pivot.add(panel); scene.add(pivot); return pivot;
};
const mirror1 = makeMirror(26, -6); const mirror2 = makeMirror(26, -9);
const target = new THREE.Mesh(new THREE.SphereGeometry(.45, 20, 12), material(0x7d2630, 0x26080a)); target.position.set(29, 1.1, -9); scene.add(target);
const finalExit = new THREE.Mesh(new THREE.BoxGeometry(1.6, 3, .25), material(0x542934)); finalExit.position.set(31.82, 1.5, -9); scene.add(finalExit);
const beam = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xff3344 })); scene.add(beam);

const raycaster = new THREE.Raycaster(); const keys = new Set<string>();
let yaw = 0, pitch = 0, last = performance.now(), notice = '', won = progress.won;
function syncLaser() {
  mirror1.rotation.y = THREE.MathUtils.degToRad(progress.mirror1Angle);
  mirror2.rotation.y = THREE.MathUtils.degToRad(progress.mirror2Angle);
  const path = traceLaser(progress.mirror1Angle, progress.mirror2Angle);
  beam.geometry.setFromPoints(path.points.map(point => new THREE.Vector3(point.x, 1.1, point.z)));
  if (path.targetHit) progress.hitTarget();
  (target.material as THREE.MeshStandardMaterial).color.set(progress.targetHit ? 0x40e878 : 0x7d2630);
  (target.material as THREE.MeshStandardMaterial).emissive.set(progress.targetHit ? 0x147a32 : 0x26080a);
  (finalExit.material as THREE.MeshStandardMaterial).color.set(progress.targetHit ? 0x40a86a : 0x542934);
}
function updateHud() {
  hud.textContent = won ? 'ESCAPED — Progress saved' : `KEY: ${progress.hasKey ? 'FOUND' : 'MISSING'}   ROOM: ${progress.currentRoom}   LASER: ${progress.targetHit ? 'TARGET ACTIVE' : 'ALIGN MIRRORS'}`;
  message.textContent = notice || (document.pointerLockElement ? 'WASD move · click / E interact · mirrors rotate 90°' : 'Click to begin');
}
function enterLaserRoom() { progress.goToLaserRoom(); camera.position.set(23, 1.65, -3); notice = 'Laser room: rotate mirrors to guide the beam.'; syncLaser(); }
function interact() {
  raycaster.setFromCamera(new THREE.Vector2(), camera);
  const hit = raycaster.intersectObjects([key, exit, plate, portal, mirror1, mirror2, finalExit], true)[0]?.object;
  if (hit === key && !progress.hasKey) { progress.collectKey(); scene.remove(key); notice = 'Key collected. Find the exit.'; }
  else if (hit === exit) { if (progress.canExit()) { progress.goToPlateRoom(); exit.material = material(0x4dbd75); notice = 'Exit unlocked. Cross to the next room.'; } else notice = 'The exit needs a key.'; }
  else if (hit === plate && !progress.plateActivated) { progress.activatePlate(); notice = 'The pressure plate activates the portal.'; }
  else if (hit === portal && progress.portalOpen) enterLaserRoom();
  else if (hit && (hit === mirror1.children[0] || hit.parent === mirror1)) { progress.rotateMirror(1); notice = 'Mirror rotated 90°.'; syncLaser(); }
  else if (hit && (hit === mirror2.children[0] || hit.parent === mirror2)) { progress.rotateMirror(2); notice = 'Mirror rotated 90°.'; syncLaser(); }
  else if (hit === finalExit) { if (progress.canUseFinalExit()) { progress.useFinalExit(); won = true; notice = 'You escaped.'; } else notice = 'The receptor needs laser power.'; }
  updateHud();
}
function checkPlate() { if (!progress.plateActivated && Math.hypot(camera.position.x - 14, camera.position.z + 6) < .7) progress.activatePlate(); }
addEventListener('keydown', event => { keys.add(event.key.toLowerCase()); if (event.key.toLowerCase() === 'e') interact(); });
addEventListener('keyup', event => keys.delete(event.key.toLowerCase()));
renderer.domElement.addEventListener('click', () => { if (document.pointerLockElement !== renderer.domElement) renderer.domElement.requestPointerLock(); else interact(); });
addEventListener('mousemove', event => { if (document.pointerLockElement === renderer.domElement) { yaw -= event.movementX * .002; pitch = THREE.MathUtils.clamp(pitch - event.movementY * .002, -1.4, 1.4); } });
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
if (progress.hasKey) scene.remove(key); if (progress.won) exit.material = material(0x4dbd75); if (progress.portalOpen) portal.visible = true;
if (progress.currentRoom === 'laser-room') camera.position.set(23, 1.65, -3); syncLaser(); updateHud();
function frame(now: number) {
  const dt = Math.min((now - last) / 1000, .05); last = now;
  const move = new THREE.Vector3((keys.has('d') ? 1 : 0) - (keys.has('a') ? 1 : 0), 0, (keys.has('s') ? 1 : 0) - (keys.has('w') ? 1 : 0));
  if (move.lengthSq()) { move.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw); camera.position.addScaledVector(move, 3 * dt); camera.position.x = THREE.MathUtils.clamp(camera.position.x, -5.3, 31.7); camera.position.z = THREE.MathUtils.clamp(camera.position.z, -11.3, -0.7); }
  camera.rotation.set(pitch, yaw, 0, 'YXZ'); if (!progress.hasKey) { key.rotation.z += dt; key.position.y = 1.25 + Math.sin(now / 350) * .1; }
  checkPlate(); if (progress.portalOpen) portal.visible = true; renderer.render(scene, camera); requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
