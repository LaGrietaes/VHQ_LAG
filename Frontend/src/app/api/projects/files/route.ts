import { NextRequest, NextResponse } from 'next/server'
import { readdir, stat } from 'fs/promises'
import { join } from 'path'

interface ProjectFile {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  extension?: string;
  isContentFile: boolean;
}

// Common content file extensions
const CONTENT_EXTENSIONS = [
  '.md', '.txt', '.pdf', '.doc', '.docx', 
  '.rtf', '.odt', '.pages', '.tex', '.rst',
  '.html', '.htm', '.xml', '.json', '.csv',
  '.yaml', '.yml', '.toml', '.ini', '.cfg'
];

// GET /api/projects/files - Get files within a project
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectPath = searchParams.get('path');

    if (!projectPath) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: path' },
        { status: 400 }
      );
    }

    const fullProjectPath = join(process.cwd(), '..', projectPath);
    
    try {
      // Check if project directory exists
      const projectStats = await stat(fullProjectPath);
      if (!projectStats.isDirectory()) {
        throw new Error('Project path is not a directory');
      }

      const files = await readdir(fullProjectPath);
      const projectFiles: ProjectFile[] = [];

      for (const file of files) {
        const filePath = join(fullProjectPath, file);
        const fileStats = await stat(filePath);
        
        const isDirectory = fileStats.isDirectory();
        const extension = file.includes('.') ? file.split('.').pop()?.toLowerCase() : '';
        const hasExtension = file.includes('.');
        
        // Only show directories and common content files
        const isContentFile = !isDirectory && (
          CONTENT_EXTENSIONS.includes(`.${extension}`) || 
          (!hasExtension && !file.startsWith('.')) // Files without extension
        );

        // Skip hidden files and non-content files
        if (file.startsWith('.') && !isDirectory) {
          continue;
        }

        // Only include directories and content files
        if (isDirectory || isContentFile) {
          projectFiles.push({
            name: file,
            path: join(projectPath, file),
            type: isDirectory ? 'directory' : 'file',
            size: isDirectory ? undefined : fileStats.size,
            extension,
            isContentFile
          });
        }
      }

      // Sort: directories first, then content files alphabetically
      projectFiles.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

      return NextResponse.json({
        success: true,
        data: {
          projectPath,
          files: projectFiles
        }
      });

    } catch (error) {
      console.error(`Error reading project files for ${projectPath}:`, error);
      return NextResponse.json(
        { success: false, error: 'Failed to read project files' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Failed to get project files:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get project files' },
      { status: 500 }
    );
  }
} 