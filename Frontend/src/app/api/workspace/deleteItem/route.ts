import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { scanProjectStructure } from '@/lib/projects-fs';

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

const deleteDirectoryRecursive = async (dirPath: string) => {
    if (!fs.existsSync(dirPath)) return;

    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            await deleteDirectoryRecursive(fullPath);
        } else {
            await fs.promises.unlink(fullPath);
        }
    }

    await fs.promises.rmdir(dirPath);
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { projectRootPath, itemId } = body;

        if (!projectRootPath) {
            return NextResponse.json({ message: 'Missing project root path' }, { status: 400 });
        }

        // Clean up the project path to avoid duplication
        const cleanProjectPath = projectRootPath.replace(/^GHOST_Proyectos[\/\\]/, '');
        const projectFullPath = path.join(GHOST_PROJECTS_ROOT, cleanProjectPath);
        
        // Ensure the project directory exists
        if (!fs.existsSync(projectFullPath)) {
            return NextResponse.json({ message: 'Project directory not found' }, { status: 404 });
        }

        // If itemId is null, delete the entire project
        if (!itemId) {
            await deleteDirectoryRecursive(projectFullPath);
            return NextResponse.json({ success: true, message: 'Project deleted successfully' });
        }

        // Get the specific file/folder path from manifest
        const manifest = getProjectManifest(projectFullPath);
        const itemRelativePath = manifest[itemId];
        
        if (!itemRelativePath) {
            return NextResponse.json({ message: 'Item not found in manifest' }, { status: 404 });
        }

        const itemFullPath = path.join(projectFullPath, itemRelativePath);
        
        if (!fs.existsSync(itemFullPath)) {
            return NextResponse.json({ message: 'Item not found in file system' }, { status: 404 });
        }

        // Delete the file or directory
        const stats = fs.statSync(itemFullPath);
        if (stats.isDirectory()) {
            await deleteDirectoryRecursive(itemFullPath);
        } else {
            await fs.promises.unlink(itemFullPath);
        }

        // Update the manifest by removing the deleted item and its children
        delete manifest[itemId];
        // Remove any child items from the manifest
        for (const [key, value] of Object.entries(manifest)) {
            if (value.startsWith(itemRelativePath + path.sep)) {
                delete manifest[key];
            }
        }

        // Save the updated manifest
        const manifestPath = path.join(projectFullPath, MANIFEST_FILE);
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

        // If we're not deleting the entire project, return the updated project structure
        const updatedProject = await scanProjectStructure(projectRootPath);
        return NextResponse.json({ success: true, updatedProject });

    } catch (error: any) {
        console.error('[API/deleteItem] Error:', error);
        return NextResponse.json({ 
            message: 'Failed to delete item', 
            details: error.message
        }, { status: 500 });
    }
} 