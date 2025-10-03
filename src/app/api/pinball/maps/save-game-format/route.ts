import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, mapSpec } = body;

    if (!name || !mapSpec) {
      return NextResponse.json(
        { error: 'Missing required fields: name, mapSpec' },
        { status: 400 }
      );
    }

    // Validate and parse JSON
    let gameMapData;
    try {
      gameMapData = typeof mapSpec === 'string' ? JSON.parse(mapSpec) : mapSpec;
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      );
    }

    // Validate game map structure
    if (!gameMapData.size || !gameMapData.spawn) {
      return NextResponse.json(
        { error: 'Invalid game map structure: must have size and spawn' },
        { status: 400 }
      );
    }

    // 디렉토리 생성
    const mapsDir = path.join(process.cwd(), 'data/pinball/maps/game');
    await fs.mkdir(mapsDir, { recursive: true });

    // 파일명 생성 (안전한 문자만 사용)
    const sanitizedName = name
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .toLowerCase() || 'untitled_map';

    const filePath = path.join(mapsDir, `${sanitizedName}_game.json`);

    // 파일 저장 (validated data)
    await fs.writeFile(filePath, JSON.stringify(gameMapData, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Game map saved successfully',
      filename: `${sanitizedName}_game.json`
    });
  } catch (error) {
    console.error('Failed to save game map:', error);
    return NextResponse.json(
      { error: 'Failed to save game map' },
      { status: 500 }
    );
  }
}
