import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import { join } from 'path'

// GET /api/projects/file-content - Get content from a specific file
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: path' },
        { status: 400 }
      );
    }

    const fullFilePath = join(process.cwd(), '..', filePath);
    
    try {
      // Check if file exists
      const fileStats = await stat(fullFilePath);
      if (!fileStats.isFile()) {
        throw new Error('Path is not a file');
      }

      // Read file content
      const content = await readFile(fullFilePath, 'utf-8');
      const fileName = filePath.split('/').pop() || filePath.split('\\').pop() || 'Unknown';

      return NextResponse.json({
        success: true,
        data: {
          fileName,
          filePath,
          content,
          size: fileStats.size,
          lastModified: fileStats.mtime.toISOString()
        }
      });

    } catch (error) {
      console.error(`Error reading file content for ${filePath}:`, error);
      return NextResponse.json(
        { success: false, error: 'Failed to read file content' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Failed to get file content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get file content' },
      { status: 500 }
    );
  }
} 