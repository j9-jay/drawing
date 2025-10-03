import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, json } = body;

    if (!name || !json) {
      return NextResponse.json(
        { error: 'Missing required fields: name, json' },
        { status: 400 }
      );
    }

    // Validate and parse JSON
    let mapData;
    try {
      mapData = typeof json === 'string' ? JSON.parse(json) : json;
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      );
    }

    // Validate map structure
    if (!mapData.meta || !mapData.objects || !Array.isArray(mapData.objects)) {
      return NextResponse.json(
        { error: 'Invalid map structure: must have meta and objects array' },
        { status: 400 }
      );
    }

    // 디렉토리 생성
    const mapsDir = path.join(process.cwd(), 'data/pinball/maps/editor');
    await fs.mkdir(mapsDir, { recursive: true });

    // 파일명 생성 (안전한 문자만 사용)
    const sanitizedName = name
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .toLowerCase() || 'untitled_map';

    const filePath = path.join(mapsDir, `${sanitizedName}.json`);

    // 파일 저장 (validated data)
    await fs.writeFile(filePath, JSON.stringify(mapData, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Map saved successfully',
      filename: `${sanitizedName}.json`
    });
  } catch (error) {
    console.error('Failed to save map:', error);
    return NextResponse.json(
      { error: 'Failed to save map' },
      { status: 500 }
    );
  }
}
