import { NextResponse } from 'next/server';

export async function GET() {
  const defaultMap = {
    meta: {
      name: 'Default Map',
      canvasSize: { width: 1200, height: 1600 },
      gridSize: 20,
      spawnPoint: { x: 600, y: 100 }
    },
    objects: [
      {
        id: 'edge-1',
        type: 'edge',
        vertices: [
          { x: 50, y: 50 },
          { x: 1150, y: 50 },
          { x: 1150, y: 1550 },
          { x: 50, y: 1550 },
          { x: 50, y: 50 }
        ]
      },
      {
        id: 'finish-1',
        type: 'finishLine',
        a: { x: 400, y: 1500 },
        b: { x: 800, y: 1500 }
      }
    ]
  };

  return NextResponse.json(defaultMap);
}
