import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getProjectById } from '@/lib/projects-fs';

const GHOST_PROYECTOS_PATH = path.join(process.cwd(), '..', 'GHOST_Proyectos');

const getProjectStructure = async (dirPath: string): Promise<any[]> => {
    try {
        const items = await fs.promises.readdir(dirPath, { withFileTypes: true });
        const structure = [];

        for (const item of items) {
            const fullPath = path.join(dirPath, item.name);
            if (item.name.startsWith('.')) continue;

            const outlineItem: any = {
                id: fullPath,
                title: item.name,
                type: item.isDirectory() ? 'folder' : 'file',
                children: [],
            };

            if (item.isDirectory()) {
                outlineItem.children = await getProjectStructure(fullPath);
            } else {
                outlineItem.content = ""; 
            }
            structure.push(outlineItem);
        }

        return structure;
    } catch (error) {
        // If the directory doesn't exist, return an empty structure
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
};


export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('id');

    if (!projectId) {
        return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const projectInfo = getProjectById(projectId);

    if (!projectInfo) {
        return NextResponse.json({ error: `Project with id "${projectId}" not found.` }, { status: 404 });
    }
    
    const projectRootPath = path.join(process.cwd(), '..', projectInfo.path);

    try {
        const outline = await getProjectStructure(projectRootPath);
        const detailedProject = {
            ...projectInfo,
            outline: outline,
        };
        return NextResponse.json({ project: detailedProject });
    } catch (error) {
        console.error(`[API/structure] Failed to get project structure for ${projectId}:`, error);
        return NextResponse.json({ error: 'Failed to read project directory.', details: error.message }, { status: 500 });
    }
} 