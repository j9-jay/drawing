import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;

    // Validate name to prevent path traversal
    if (!name || /[\/\\]|\.\./.test(name)) {
      return NextResponse.json(
        { error: 'Invalid map name' },
        { status: 400 }
      );
    }

    const mapsDir = path.join(process.cwd(), 'data/pinball/maps');
    const filePath = path.join(mapsDir, `${name}.json`);

    // 맵 삭제
    try {
      await fs.unlink(filePath);
    } catch (err) {
      return NextResponse.json(
        { error: 'Map not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Map deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete map:', error);
    return NextResponse.json(
      { error: 'Failed to delete map' },
      { status: 500 }
    );
  }
}
