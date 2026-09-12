export type LaserPoint = { x: number; z: number };
export type LaserPath = { points: LaserPoint[]; reflections: number; targetHit: boolean };

const emitter = { x: 23, z: -6 };
const mirror1 = { x: 26, z: -6 };
const mirror2 = { x: 26, z: -9 };
const target = { x: 29, z: -9 };

/** Fixed broad mirror colliders keep this puzzle deterministic. */
export function traceLaser(mirror1Angle: number, mirror2Angle: number, maxReflections = 4): LaserPath {
  const points = [emitter, mirror1];
  if (maxReflections < 1 || mirror1Angle !== 0) return { points, reflections: 0, targetHit: false };
  points.push(mirror2);
  if (maxReflections < 2 || mirror2Angle !== 270) return { points, reflections: 1, targetHit: false };
  points.push(target);
  return { points, reflections: 2, targetHit: true };
}
