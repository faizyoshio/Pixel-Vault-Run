export type RoomId = 'key-room' | 'plate-room' | 'laser-room';

export interface RoomDefinition {
  cameraX?: number;
  cameraZ?: number;
  label: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export const ROOMS: Record<RoomId, RoomDefinition> = {
  'key-room': {
    cameraX: 0,
    cameraZ: 6,
    label: 'Key Room',
    minX: -6, maxX: 6, minZ: -6, maxZ: 6,
  },
  'plate-room': {
    cameraX: 14,
    cameraZ: 0,
    label: 'Plate Room',
    minX: 6, maxX: 22, minZ: -11, maxZ: -1,
  },
  'laser-room': {
    cameraX: 23,
    cameraZ: -3,
    label: 'Laser Room',
    minX: 22, maxX: 32, minZ: -12, maxZ: -6,
  },
};

export const roomCameraPosition = (room: string) => {
  const cfg = ROOMS[room as RoomId] || ROOMS['key-room'];
  return { x: cfg.cameraX ?? 0, y: 1.65, z: cfg.cameraZ ?? 0 };
};

export const roomLabel = (room: string) => {
  const cfg = ROOMS[room as RoomId] || ROOMS['key-room'];
  return cfg.label;
};

export const resolveCameraPosition = (room: string, saved: { x: number; z: number } | null) => {
  if (saved) return { x: saved.x, y: 1.65, z: saved.z };
  return roomCameraPosition(room);
};
