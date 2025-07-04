import { NextRequest, NextResponse } from 'next/server'
import { readdir, stat, readFile } from 'fs/promises'
import { join } from 'path'

// Common content file extensions
const CONTENT_EXTENSIONS = [
  '.md', '.txt', '.pdf', '.doc', '.docx', 
  '.rtf', '.odt', '.pages', '.tex', '.rst',
  '.html', '.htm', '.xml', '.json', '.csv',
  '.yaml', '.yml', '.toml', '.ini', '.cfg'
];

// GET /api/projects/context - Get project context content
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectPath = searchParams.get('path');
    const specificFile = searchParams.get('file'); // New parameter for specific file

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

      let contextContent = '';

      if (specificFile) {
        // Read specific file content
        const fullFilePath = join(process.cwd(), '..', specificFile);
        try {
          const fileStats = await stat(fullFilePath);
          if (fileStats.isFile()) {
            const content = await readFile(fullFilePath, 'utf-8');
            const fileName = specificFile.split('/').pop() || specificFile;
            contextContent = `=== PROJECT CONTEXT: ${fileName} ===\n\n${content}\n\n=== END CONTEXT ===`;
          }
        } catch (error) {
          console.error(`Error reading specific file ${specificFile}:`, error);
        }
      }

      // If no specific file or file not found, fall back to recursive search
      if (!contextContent) {
        contextContent = await searchForContentFiles(fullProjectPath, projectPath);
      }

      if (!contextContent) {
        return NextResponse.json({
          success: true,
          data: {
            projectPath,
            specificFile,
            content: "No content found in this project.",
            contextType: specificFile ? 'specific_file' : 'recursive_search'
          }
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          projectPath,
          specificFile,
          content: contextContent,
          contextType: specificFile ? 'specific_file' : 'recursive_search'
        }
      });

    } catch (error) {
      console.error(`Error reading project context for ${projectPath}:`, error);
      return NextResponse.json(
        { success: false, error: 'Failed to read project context' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Failed to get project context:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get project context' },
      { status: 500 }
    );
  }
}

async function searchForContentFiles(dirPath: string, relativePath: string): Promise<string> {
  try {
    const files = await readdir(dirPath);
    let content = '';

    for (const file of files) {
      const fullPath = join(dirPath, file);
      const relativeFilePath = join(relativePath, file);
      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        // Recursively search subdirectories
        const subContent = await searchForContentFiles(fullPath, relativeFilePath);
        if (subContent) {
          content += subContent;
        }
      } else if (stats.isFile()) {
        // Check if it's a content file
        const extension = file.includes('.') ? file.split('.').pop()?.toLowerCase() : '';
        const hasExtension = file.includes('.');
        
        const isContentFile = (
          CONTENT_EXTENSIONS.includes(`.${extension}`) || 
          (!hasExtension && !file.startsWith('.')) // Files without extension
        ) && !file.startsWith('.');

        if (isContentFile) {
          try {
            const fileContent = await readFile(fullPath, 'utf-8');
            if (fileContent.trim()) {
              const fileName = file;
              content += `=== FILE: ${fileName} ===\n\n${fileContent}\n\n=== END FILE ===\n\n`;
            }
          } catch (error) {
            console.error(`Error reading file ${fullPath}:`, error);
          }
        }
      }
    }

    return content;
  } catch (error) {
    console.error(`Error searching directory ${dirPath}:`, error);
    return '';
  }
} 