import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const mapsDir = path.join(process.cwd(), 'data/pinball/maps');

    // 디렉토리 생성 (없으면)
    try {
      await fs.mkdir(mapsDir, { recursive: true });
    } catch (err) {
      // 이미 존재하는 경우 무시
    }

    // 파일 목록 읽기
    let files: string[];
    try {
      files = await fs.readdir(mapsDir);
    } catch (err) {
      // 디렉토리가 비어있거나 읽을 수 없으면 빈 배열 반환
      return NextResponse.json([]);
    }

    const jsonFiles = files.filter(file => file.endsWith('.json'));

    // 파일 정보 수집 (displayName 포함)
    const mapList = await Promise.all(
      jsonFiles.map(async (file) => {
        const filePath = path.join(mapsDir, file);
        const stats = await fs.stat(filePath);

        // Read file to get meta.name for displayName
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
    console.error('Failed to fetch map list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch map list' },
      { status: 500 }
    );
  }
}
