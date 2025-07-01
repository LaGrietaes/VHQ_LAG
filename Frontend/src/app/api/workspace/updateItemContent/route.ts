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

        if (!projectRootPath || !itemId || content === undefined) {
            return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
        }

        // projectRootPath is like "GHOST_Proyectos/libros/TESTER"
        // We need to get just the project directory part: "libros/TESTER"
        const projectRelativePath = projectRootPath.replace('GHOST_Proyectos/', '');
        const projectFullPath = path.join(GHOST_PROJECTS_ROOT, projectRelativePath);
        const manifest = getProjectManifest(projectFullPath);

        const itemRelativePath = manifest[itemId];
        if (!itemRelativePath) {
            return NextResponse.json({ message: 'Item not found in manifest' }, { status: 404 });
        }

        const itemPath = path.join(projectFullPath, itemRelativePath);
        
        // It's a good practice to check if it's a file, but we'll trust the manifest for now.
        // A more robust solution might store item type in the manifest.

        await fs.promises.writeFile(itemPath, content, 'utf-8');

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[API/updateItemContent] Error:', error);
        return NextResponse.json({ message: 'Failed to update item content', details: error.message }, { status: 500 });
    }
} 