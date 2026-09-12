# Escape Platform

> 2D platformer mirip Mario Bros — Canvas 2D, TypeScript, zero game engine.

## Controls
- **← → / A D** — gerak
- **Space / ↑ / W / Z** — lompat (tahan untuk lompat tinggi)
- **R** — restart level

## Features
- Tile-based level (ASCII map → grid)
- Player physics: gravitasi, akselerasi, coyote time, jump buffering
- Enemy patroller (squasheable: lompat di atasnya = musuh mati, sentuh samping = mati)
- Collectible coin (score + 100)
- Flag goal → next level (3 level)
- Lives system (3 nyawa, extra di 1000 poin)
- Game over / win screen
- Sfx procedural Web Audio (jump, coin, stomp, hurt, win)

## Test
- Pure logic di `src/game/engine.ts` (unit-testable, no DOM)
- `npm test`, `npx tsc --noEmit`, `npm run build`

## Asset
- Semua grafis digambar via Canvas primitives (no asset files)
- Art style: flat color + outline, 16px tile, resolusi 320x240 di-scale 3x