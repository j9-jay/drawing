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

    const editorDir = path.join(process.cwd(), 'data/pinball/maps/editor');
    const gameDir = path.join(process.cwd(), 'data/pinball/maps/game');

    const editorFilePath = path.join(editorDir, `${name}.json`);
    const gameFilePath = path.join(gameDir, `${name}_game.json`);

    let deletedFiles = 0;

    // 에디터 맵 삭제
    try {
      await fs.unlink(editorFilePath);
      deletedFiles++;
    } catch (err) {
      // 파일이 없으면 무시
    }

    // 게임 맵 삭제
    try {
      await fs.unlink(gameFilePath);
      deletedFiles++;
    } catch (err) {
      // 파일이 없으면 무시
    }

    if (deletedFiles === 0) {
      return NextResponse.json(
        { error: 'Map not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Map deleted successfully (${deletedFiles} file(s))`,
      deletedFiles
    });
  } catch (error) {
    console.error('Failed to delete map:', error);
    return NextResponse.json(
      { error: 'Failed to delete map' },
      { status: 500 }
    );
  }
}
