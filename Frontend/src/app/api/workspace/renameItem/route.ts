import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { scanProjectStructure } from '@/lib/projects-fs';
import { OutlineItem } from '@/lib/ghost-agent-data';

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

const saveProjectManifest = (projectFullPath: string, manifest: Manifest) => {
    const manifestPath = path.join(projectFullPath, MANIFEST_FILE);
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { projectRootPath, itemId, newTitle } = body;

        console.log('[API/renameItem] Request body:', { projectRootPath, itemId, newTitle });

        if (!projectRootPath || !itemId || !newTitle) {
            console.log('[API/renameItem] Missing parameters:', { projectRootPath: !!projectRootPath, itemId: !!itemId, newTitle: !!newTitle });
            return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
        }

        // Clean up the project path to avoid duplication
        const cleanProjectPath = projectRootPath.replace(/^GHOST_Proyectos[\/\\]/, '');
        const projectFullPath = path.join(GHOST_PROJECTS_ROOT, cleanProjectPath);

        // Ensure project directory exists
        if (!fs.existsSync(projectFullPath)) {
            console.error('[API/renameItem] Project directory not found:', projectFullPath);
            return NextResponse.json({ message: 'Project directory not found' }, { status: 404 });
        }
        
        const manifest = getProjectManifest(projectFullPath);
        
        const oldRelativePath = manifest[itemId];
        if (!oldRelativePath) {
            console.error('[API/renameItem] Item not found in manifest:', { itemId, manifest });
            return NextResponse.json({ message: 'Item not found in manifest' }, { status: 404 });
        }

        const oldPath = path.join(projectFullPath, oldRelativePath);
        if (!fs.existsSync(oldPath)) {
            console.error('[API/renameItem] Old path does not exist:', oldPath);
            return NextResponse.json({ message: 'Item not found on disk' }, { status: 404 });
        }

        const newPath = path.join(path.dirname(oldPath), newTitle);
        const newRelativePath = path.relative(projectFullPath, newPath);

        if (fs.existsSync(newPath)) {
            console.error('[API/renameItem] New path already exists:', newPath);
            return NextResponse.json({ message: 'An item with the new name already exists' }, { status: 409 });
        }

        // Ensure parent directory exists
        await fs.promises.mkdir(path.dirname(newPath), { recursive: true });
        
        // Rename the file/folder
        await fs.promises.rename(oldPath, newPath);

        // Update and save the manifest
        manifest[itemId] = newRelativePath;
        saveProjectManifest(projectFullPath, manifest);

        const updatedProject = await scanProjectStructure(projectRootPath);

        return NextResponse.json({ success: true, updatedProject });

    } catch (error: any) {
        console.error('[API/renameItem] Error:', error);
        return NextResponse.json({ 
            message: 'Failed to rename item', 
            details: error.message,
            path: error.path // Include path in error for debugging
        }, { status: 500 });
    }
} 