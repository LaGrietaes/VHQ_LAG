import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { scanProjectStructure } from '@/lib/projects-fs';
import { OutlineItem } from '@/lib/ghost-agent-data';

function findItemInTree(nodes: OutlineItem[], id: string): OutlineItem | null {
    for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
            const found = findItemInTree(node.children, id);
            if (found) return found;
        }
    }
    return null;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { projectRootPath, itemId, newTitle } = body;

        if (!projectRootPath || !itemId || !newTitle) {
            return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
        }

        const projectData = await scanProjectStructure(projectRootPath);
        if (!projectData) {
            return NextResponse.json({ message: 'Project not found' }, { status: 404 });
        }
        
        const itemToRename = findItemInTree(projectData.outline, itemId);

        if (!itemToRename || !itemToRename.path) {
            return NextResponse.json({ message: 'Item not found or path is missing' }, { status: 404 });
        }

        const oldPath = itemToRename.path;
        const newPath = path.join(path.dirname(oldPath), newTitle);

        if (fs.existsSync(newPath)) {
            return NextResponse.json({ message: 'An item with the new name already exists' }, { status: 409 });
        }
        
        await fs.promises.rename(oldPath, newPath);

        const updatedProject = await scanProjectStructure(projectRootPath);

        return NextResponse.json({ success: true, updatedProject });

    } catch (error: any) {
        console.error('[API/renameItem] Error:', error);
        return NextResponse.json({ message: 'Failed to rename item', details: error.message }, { status: 500 });
    }
} 