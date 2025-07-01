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
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { projectRootPath, parentId, item } = body;

        if (!projectRootPath || !item) {
            return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
        }

        const projectRelativePath = projectRootPath.replace('GHOST_Proyectos/', '');
        const projectFullPath = path.join(GHOST_PROJECTS_ROOT, projectRelativePath);
        const manifest = getProjectManifest(projectFullPath);
        
        let parentPath = projectFullPath;
        if (parentId) {
            const parentRelativePath = manifest[parentId];
            if (parentRelativePath) {
                parentPath = path.join(projectFullPath, parentRelativePath);
            }
        }
        
        const newItemPath = path.join(parentPath, item.title);
        const newItemRelativePath = path.relative(projectFullPath, newItemPath);

        if (fs.existsSync(newItemPath)) {
            return NextResponse.json({ message: 'Item with this name already exists' }, { status: 409 });
        }

        if (item.type === 'folder') {
            await fs.promises.mkdir(newItemPath);
        } else {
            await fs.promises.writeFile(newItemPath, item.content || '', 'utf-8');
        }

        manifest[item.id] = newItemRelativePath;
        saveProjectManifest(projectFullPath, manifest);

        const updatedProject = await scanProjectStructure(projectRootPath);

        return NextResponse.json({ success: true, updatedProject });

    } catch (error: any) {
        console.error('[API/addItem] Error:', error);
        return NextResponse.json({ message: 'Failed to create item', details: error.message }, { status: 500 });
    }
}