import { NextRequest, NextResponse } from 'next/server';
import { getProjectById, scanProjectStructure } from '@/lib/projects-fs';

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

    try {
        const detailedProject = await scanProjectStructure(projectInfo.path);
        
        if (!detailedProject) {
            return NextResponse.json({ error: 'Failed to scan project structure' }, { status: 500 });
        }

        return NextResponse.json({ project: detailedProject });
    } catch (error: any) {
        console.error(`[API/structure] Failed to get project structure for ${projectId}:`, error);
        return NextResponse.json({ error: 'Failed to read project directory.', details: error.message }, { status: 500 });
    }
} 