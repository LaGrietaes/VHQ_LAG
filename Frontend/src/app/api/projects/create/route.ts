import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const GHOST_PROYECTOS_PATH = path.join(process.cwd(), '..', 'GHOST_Proyectos');

const typeToDirMap = {
    book: 'libros',
    blog: 'blog_posts',
    script: 'scripts'
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, type } = body;

        if (!name || !type) {
            return NextResponse.json({ error: 'Missing required parameters: name and type' }, { status: 400 });
        }

        const dirName = typeToDirMap[type];
        if (!dirName) {
            return NextResponse.json({ error: 'Invalid project type' }, { status: 400 });
        }

        // Sanitize project name to create a valid directory name
        const sanitizedName = name.replace(/[^a-z0-9_ -]/gi, '').replace(/\s+/g, '_');
        if (!sanitizedName) {
            return NextResponse.json({ error: 'Invalid project name' }, { status: 400 });
        }
        
        const projectPath = path.join(GHOST_PROYECTOS_PATH, dirName, sanitizedName);

        if (fs.existsSync(projectPath)) {
            return NextResponse.json({ error: 'Project with this name already exists' }, { status: 409 });
        }

        await fs.promises.mkdir(projectPath, { recursive: true });

        return NextResponse.json({ success: true, path: projectPath });

    } catch (error) {
        console.error('Failed to create project:', error);
        return NextResponse.json({ error: 'Failed to create project directory' }, { status: 500 });
    }
} 