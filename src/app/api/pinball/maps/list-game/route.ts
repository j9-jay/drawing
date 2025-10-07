import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const mapsDir = path.join(process.cwd(), 'data/pinball/maps');

    // Create directory if it doesn't exist
    try {
      await fs.mkdir(mapsDir, { recursive: true });
    } catch (err) {
      // Ignore if already exists
    }

    // Read file list
    let files: string[];
    try {
      files = await fs.readdir(mapsDir);
    } catch (err) {
      // Return empty array if directory is empty or unreadable
      return NextResponse.json([]);
    }

    const jsonFiles = files.filter(file => file.endsWith('.json'));

    // Collect file information with meta.name
    const mapList = await Promise.all(
      jsonFiles.map(async (file) => {
        const filePath = path.join(mapsDir, file);
        const stats = await fs.stat(filePath);

        // Read file to get meta.name
        let displayName = file.replace('.json', '');
        try {
          const fileContent = await fs.readFile(filePath, 'utf-8');
          const mapData = JSON.parse(fileContent);
          if (mapData.meta?.name) {
            displayName = mapData.meta.name;
          }
        } catch (error) {
          console.warn(`Failed to read meta.name from ${file}:`, error);
        }

        return {
          name: file.replace('.json', ''),
          displayName,
          lastModified: stats.mtime.toISOString(),
          size: stats.size
        };
      })
    );

    return NextResponse.json(mapList);
  } catch (error) {
    console.error('Failed to fetch game map list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch map list' },
      { status: 500 }
    );
  }
}
