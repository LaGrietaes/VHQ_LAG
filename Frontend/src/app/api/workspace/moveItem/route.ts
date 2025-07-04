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

const saveProjectManifest = (projectFullPath: string, manifest: Manifest) => {
    const manifestPath = path.join(projectFullPath, MANIFEST_FILE);
    try {
        const manifestDir = path.dirname(manifestPath);
        if (!fs.existsSync(manifestDir)) {
            fs.mkdirSync(manifestDir, { recursive: true });
        }
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    } catch (e) {
        console.error(`Error saving manifest for ${projectFullPath}`, e);
    }
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { projectRootPath, itemId, targetParentId } = body;

        console.log('[API/moveItem] Request:', { projectRootPath, itemId, targetParentId });

        if (!projectRootPath || !itemId) {
            return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
        }

        // Clean up the project path
        const cleanProjectPath = projectRootPath.replace(/^GHOST_Proyectos[\/\\]/, '');
        const projectFullPath = path.join(GHOST_PROJECTS_ROOT, cleanProjectPath);
        
        console.log('[API/moveItem] Project full path:', projectFullPath);
        
        if (!fs.existsSync(projectFullPath)) {
            console.error('[API/moveItem] Project directory not found:', projectFullPath);
            return NextResponse.json({ message: 'Project directory not found' }, { status: 404 });
        }

        const manifest = getProjectManifest(projectFullPath);
        console.log('[API/moveItem] Current manifest:', manifest);
        
        // Get the item to move
        const itemRelativePath = manifest[itemId];
        if (!itemRelativePath) {
            console.error('[API/moveItem] Item not found in manifest:', itemId);
            return NextResponse.json({ message: 'Item not found in manifest' }, { status: 404 });
        }

        const itemFullPath = path.join(projectFullPath, itemRelativePath);
        if (!fs.existsSync(itemFullPath)) {
            console.error('[API/moveItem] Item not found in filesystem:', itemFullPath);
            return NextResponse.json({ message: 'Item not found in filesystem' }, { status: 404 });
        }

        // Determine target parent path
        let targetParentPath = projectFullPath; // Default to project root
        if (targetParentId) {
            const targetParentRelativePath = manifest[targetParentId];
            if (targetParentRelativePath) {
                targetParentPath = path.join(projectFullPath, targetParentRelativePath);
                if (!fs.existsSync(targetParentPath)) {
                    console.error('[API/moveItem] Target parent not found:', targetParentPath);
                    return NextResponse.json({ message: 'Target parent not found' }, { status: 404 });
                }
            } else {
                console.error('[API/moveItem] Target parent not found in manifest:', targetParentId);
                return NextResponse.json({ message: 'Target parent not found in manifest' }, { status: 404 });
            }
        }

        // Get item name and new path
        const itemName = path.basename(itemFullPath);
        const newItemPath = path.join(targetParentPath, itemName);
        const newItemRelativePath = path.relative(projectFullPath, newItemPath).replace(/\\/g, '/');

        console.log('[API/moveItem] Moving:', {
            from: itemFullPath,
            to: newItemPath,
            newRelativePath: newItemRelativePath
        });

        // Check if target already exists
        if (fs.existsSync(newItemPath)) {
            console.error('[API/moveItem] Target path already exists:', newItemPath);
            return NextResponse.json({ message: 'An item with this name already exists in the target location' }, { status: 409 });
        }

        // Ensure target parent directory exists
        const targetParentDir = path.dirname(newItemPath);
        if (!fs.existsSync(targetParentDir)) {
            await fs.promises.mkdir(targetParentDir, { recursive: true });
        }

        // Move the item
        await fs.promises.rename(itemFullPath, newItemPath);
        console.log('[API/moveItem] Item moved successfully');

        // Update manifest
        manifest[itemId] = newItemRelativePath;
        
        // Update any child items in the manifest
        const oldRelativePath = itemRelativePath;
        for (const [childId, childPath] of Object.entries(manifest)) {
            if (childPath.startsWith(oldRelativePath + path.sep)) {
                const childName = path.relative(oldRelativePath, childPath);
                const newChildPath = path.join(newItemRelativePath, childName).replace(/\\/g, '/');
                manifest[childId] = newChildPath;
                console.log(`[API/moveItem] Updated child path: ${childId} -> ${newChildPath}`);
            }
        }

        saveProjectManifest(projectFullPath, manifest);
        console.log('[API/moveItem] Manifest updated:', manifest);

        // Get updated project structure
        const updatedProject = await scanProjectStructure(projectRootPath);
        console.log('[API/moveItem] Updated project structure:', updatedProject ? 'success' : 'failed');

        return NextResponse.json({ success: true, updatedProject });

    } catch (error: any) {
        console.error('[API/moveItem] Error:', error);
        return NextResponse.json({ 
            message: 'Failed to move item', 
            details: error.message
        }, { status: 500 });
    }
} 