import { NextRequest, NextResponse } from 'next/server';
import { readFile, readdir, stat } from 'fs/promises';
import { join } from 'path';
import { TemplateFile } from '@/lib/template-manager';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectPath = searchParams.get('projectPath');
    
    if (!projectPath) {
      return NextResponse.json({ 
        success: false, 
        message: 'Project path is required' 
      }, { status: 400 });
    }

    const fullProjectPath = join(process.cwd(), '..', projectPath);
    
    // Check if project directory exists
    try {
      await stat(fullProjectPath);
    } catch (error) {
      return NextResponse.json({ 
        success: false, 
        message: 'Project directory not found' 
      }, { status: 404 });
    }

    const templates: TemplateFile[] = [];
    
    // Scan for template files
    const templateFiles = await scanForTemplateFiles(fullProjectPath);
    
    for (const filePath of templateFiles) {
      try {
        const content = await readFile(filePath, 'utf-8');
        const relativePath = filePath.replace(fullProjectPath, '').replace(/^[\\/]/, '');
        
        const template = await parseTemplateFile(relativePath, content, projectPath);
        if (template) {
          templates.push(template);
        }
      } catch (error) {
        console.warn(`Could not read template file ${filePath}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      templates,
      count: templates.length,
      projectPath
    });

  } catch (error: any) {
    console.error('[API/templates/project] Error:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Failed to load project templates', 
      error: error.message 
    }, { status: 500 });
  }
}

async function scanForTemplateFiles(projectPath: string): Promise<string[]> {
  const templateFiles: string[] = [];
  
  async function scanDirectory(dirPath: string) {
    try {
      const entries = await readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          // Skip certain directories
          if (!['node_modules', '.git', '.vscode', 'dist', 'build'].includes(entry.name)) {
            await scanDirectory(fullPath);
          }
        } else if (entry.isFile()) {
          // Check if it's a template file
          if (isTemplateFile(entry.name)) {
            templateFiles.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.warn(`Could not scan directory ${dirPath}:`, error);
    }
  }
  
  await scanDirectory(projectPath);
  return templateFiles;
}

function isTemplateFile(filename: string): boolean {
  const templatePatterns = [
    /template\.md$/i,
    /_template\.md$/i,
    /template_/i,
    /sample\.md$/i,
    /example\.md$/i,
    /guide\.md$/i,
    /\.template\./i
  ];
  
  return templatePatterns.some(pattern => pattern.test(filename));
}

async function parseTemplateFile(filePath: string, content: string, projectPath: string): Promise<TemplateFile | null> {
  try {
    // Extract metadata from content or filename
    const metadata = extractTemplateMetadata(filePath, content);
    
    // Extract variables from content
    const variables = extractVariables(content);
    
    // Generate unique ID
    const id = `${projectPath.replace(/[^a-zA-Z0-9]/g, '_')}_${filePath.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    const template: TemplateFile = {
      id,
      name: metadata.name || filePath.replace(/\.md$/, ''),
      nameEn: metadata.nameEn || metadata.name || filePath.replace(/\.md$/, ''),
      description: metadata.description || `Template from ${filePath}`,
      descriptionEn: metadata.descriptionEn || metadata.description || `Template from ${filePath}`,
      type: metadata.type || 'template',
      category: metadata.category || 'general',
      content,
      variables,
      language: metadata.language || 'both',
      tags: metadata.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usage: 0
    };
    
    return template;
  } catch (error) {
    console.warn(`Could not parse template file ${filePath}:`, error);
    return null;
  }
}

function extractTemplateMetadata(filePath: string, content: string): {
  name?: string;
  nameEn?: string;
  description?: string;
  descriptionEn?: string;
  type?: string;
  category?: string;
  language?: string;
  tags?: string[];
} {
  const metadata: any = {};
  
  // Try to extract metadata from frontmatter
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    const lines = frontmatter.split('\n');
    
    for (const line of lines) {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        const value = valueParts.join(':').trim();
        metadata[key.trim()] = value;
      }
    }
  }
  
  // Extract from filename
  const filename = filePath.split('/').pop() || '';
  if (filename.includes('template')) {
    metadata.type = 'template';
  } else if (filename.includes('sample')) {
    metadata.type = 'sample';
  } else if (filename.includes('example')) {
    metadata.type = 'example';
  } else if (filename.includes('guide')) {
    metadata.type = 'guide';
  }
  
  // Extract category from path
  const pathParts = filePath.split('/');
  if (pathParts.length > 1) {
    metadata.category = pathParts[0];
  }
  
  // Extract name from first heading
  const headingMatch = content.match(/^#\s+(.+)$/m);
  if (headingMatch) {
    metadata.name = headingMatch[1].trim();
  }
  
  return metadata;
}

function extractVariables(content: string): string[] {
  const variableRegex = /\{([^}]+)\}/g;
  const variables = new Set<string>();
  let match;

  while ((match = variableRegex.exec(content)) !== null) {
    variables.add(match[1]);
  }

  return Array.from(variables);
} 