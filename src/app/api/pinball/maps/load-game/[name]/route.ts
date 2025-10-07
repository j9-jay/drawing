import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
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

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json(
        { error: 'Map not found' },
        { status: 404 }
      );
    }

    const fileContent = await fs.readFile(filePath, 'utf-8');

    // Parse JSON with error handling
    let mapJson;
    try {
      mapJson = JSON.parse(fileContent);
    } catch (parseError) {
      console.error('Invalid JSON in map file:', parseError);
      return NextResponse.json(
        { error: 'Map file is corrupted' },
        { status: 422 }
      );
    }

    return NextResponse.json(mapJson);
  } catch (error) {
    console.error('Failed to load game map:', error);
    return NextResponse.json(
      { error: 'Failed to load map' },
      { status: 500 }
    );
  }
}
