import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const GHOST_PROJECTS_ROOT = path.resolve(process.cwd(), '..', 'GHOST_Proyectos');
const MANIFEST_FILE = '.ghost_manifest.json';

type Manifest = Record<string, string>;

const getProjectManifest = (projectFullPath: string): Manifest => {
    const manifestPath = path.join(projectFullPath, MANIFEST_FILE);
    if (fs.existsSync(manifestPath)) {
        try {
            return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        } catch (e) {
            console.error(`Error reading manifest for ${projectFullPath}`, e);
            return {};
        }
    }
    return {};
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { projectRootPath, itemId, content } = body;

        console.log('[API/updateItemContent] Request:', { 
            projectRootPath, 
            itemId, 
            contentLength: content ? content.length : 0 
        });

        if (!projectRootPath || !itemId || content === undefined) {
            return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
        }

        // Clean up the project path to avoid duplication
        const cleanProjectPath = projectRootPath.replace(/^GHOST_Proyectos[\/\\]/, '');
        const projectFullPath = path.join(GHOST_PROJECTS_ROOT, cleanProjectPath);
        
        console.log('[API/updateItemContent] Project full path:', projectFullPath);
        
        // Ensure the project directory exists
        if (!fs.existsSync(projectFullPath)) {
            console.error('[API/updateItemContent] Project directory not found:', projectFullPath);
            return NextResponse.json({ message: 'Project directory not found' }, { status: 404 });
        }

        const manifest = getProjectManifest(projectFullPath);
        console.log('[API/updateItemContent] Manifest:', manifest);
        
        const itemRelativePath = manifest[itemId];
        
        if (!itemRelativePath) {
            console.error('[API/updateItemContent] Item not found in manifest:', itemId);
            return NextResponse.json({ message: 'Item not found in manifest' }, { status: 404 });
        }

        const itemFullPath = path.join(projectFullPath, itemRelativePath);
        console.log('[API/updateItemContent] Item full path:', itemFullPath);
        
        // Ensure the file exists and is a file (not a directory)
        if (!fs.existsSync(itemFullPath)) {
            console.error('[API/updateItemContent] File not found in filesystem:', itemFullPath);
            return NextResponse.json({ message: 'File not found in filesystem' }, { status: 404 });
        }

        const stats = fs.statSync(itemFullPath);
        if (stats.isDirectory()) {
            console.error('[API/updateItemContent] Cannot save content to directory:', itemFullPath);
            return NextResponse.json({ message: 'Cannot save content to a directory' }, { status: 400 });
        }

        // Save content to file
        await fs.promises.writeFile(itemFullPath, content, 'utf-8');
        console.log('[API/updateItemContent] Content saved successfully');

        // Get file stats for response
        const newStats = fs.statSync(itemFullPath);
        
        return NextResponse.json({ 
            success: true, 
            message: 'Content saved successfully',
            fileSize: newStats.size,
            lastModified: newStats.mtime.toISOString()
        });

    } catch (error: any) {
        console.error('[API/updateItemContent] Error:', error);
        return NextResponse.json({ 
            message: 'Failed to save content', 
            details: error.message
        }, { status: 500 });
    }
} 