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
        // Ensure the directory exists before writing
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
        const { projectRootPath, parentId, item } = body;

        console.log('[API/addItem] Request:', { projectRootPath, parentId, item: { ...item, content: item.content ? '[CONTENT]' : 'no content' } });

        if (!projectRootPath || !item) {
            return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
        }

        // Clean up the project path to avoid duplication
        const cleanProjectPath = projectRootPath.replace(/^GHOST_Proyectos[\/\\]/, '');
        const projectFullPath = path.join(GHOST_PROJECTS_ROOT, cleanProjectPath);
        
        console.log('[API/addItem] Project full path:', projectFullPath);
        
        // Ensure the project directory exists
        if (!fs.existsSync(projectFullPath)) {
            console.error('[API/addItem] Project directory not found:', projectFullPath);
            return NextResponse.json({ message: 'Project directory not found' }, { status: 404 });
        }

        const manifest = getProjectManifest(projectFullPath);
        console.log('[API/addItem] Current manifest:', manifest);
        
        let parentPath = projectFullPath;
        if (parentId) {
            const parentRelativePath = manifest[parentId];
            if (parentRelativePath) {
                parentPath = path.join(projectFullPath, parentRelativePath);
                // Ensure parent directory exists
                if (!fs.existsSync(parentPath)) {
                    console.error('[API/addItem] Parent directory not found:', parentPath);
                    return NextResponse.json({ message: 'Parent directory not found' }, { status: 404 });
                }
            } else {
                console.error('[API/addItem] Parent item not found in manifest:', parentId);
                return NextResponse.json({ message: 'Parent item not found in manifest' }, { status: 404 });
            }
        }
        
        const newItemPath = path.join(parentPath, item.title);
        const newItemRelativePath = path.relative(projectFullPath, newItemPath).replace(/\\/g, '/');

        console.log('[API/addItem] New item path:', newItemPath);
        console.log('[API/addItem] New item relative path:', newItemRelativePath);

        if (fs.existsSync(newItemPath)) {
            console.error('[API/addItem] Item already exists:', newItemPath);
            return NextResponse.json({ message: 'Item with this name already exists' }, { status: 409 });
        }

        // Ensure parent directory exists before creating the new item
        const itemParentDir = path.dirname(newItemPath);
        if (!fs.existsSync(itemParentDir)) {
            await fs.promises.mkdir(itemParentDir, { recursive: true });
        }

        if (item.type === 'folder') {
            await fs.promises.mkdir(newItemPath);
            console.log('[API/addItem] Created folder:', newItemPath);
        } else {
            await fs.promises.writeFile(newItemPath, item.content || '', 'utf-8');
            console.log('[API/addItem] Created file:', newItemPath);
        }

        // Update manifest
        manifest[item.id] = newItemRelativePath;
        saveProjectManifest(projectFullPath, manifest);
        console.log('[API/addItem] Updated manifest:', manifest);

        const updatedProject = await scanProjectStructure(projectRootPath);
        console.log('[API/addItem] Updated project structure:', updatedProject ? 'success' : 'failed');

        return NextResponse.json({ success: true, updatedProject });

    } catch (error: any) {
        console.error('[API/addItem] Error:', error);
        return NextResponse.json({ 
            message: 'Failed to create item', 
            details: error.message
        }, { status: 500 });
    }
}