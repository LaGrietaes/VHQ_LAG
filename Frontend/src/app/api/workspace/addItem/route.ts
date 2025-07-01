import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { OutlineItem } from '@/lib/ghost-agent-data';
import { scanProjectStructure } from '@/lib/projects-fs';

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
    const { projectRootPath, parentId, item } = body;
    const { id: newItemId, title, type: itemType } = item;

    if (!projectRootPath || !item) {
      return NextResponse.json({ message: 'Missing required parameters: projectRootPath, item' }, { status: 400 });
    }

    const baseDir = path.join(process.cwd(), '..');
    const projectPath = path.join(baseDir, projectRootPath);

    const projectStructure = await scanProjectStructure(projectRootPath);
    if (!projectStructure) {
        return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    let parentPath = projectPath;
    if (parentId) {
        const parentItem = findItemInTree(projectStructure.outline, parentId);
        if (parentItem?.path) {
            parentPath = parentItem.path;
        } else if (parentItem) {
            // This is a fallback if the item exists but has no path, which would be unusual
            // We can try to construct it, but for now let's log an error
            console.error(`Parent item with id ${parentId} found, but it has no path.`);
            // Defaulting to project root if parent path can't be determined
        }
    }
    
    const newPath = path.join(parentPath, title);

    if (itemType === 'folder') {
      await fs.promises.mkdir(newPath, { recursive: true });
    } else {
      await fs.promises.writeFile(newPath, item.content || '');
    }

    // After modification, re-scan the project to get the updated structure
    const updatedProject = await scanProjectStructure(projectRootPath);

    return NextResponse.json({ success: true, updatedProject });

  } catch (error: any) {
    console.error('[API/addItem] Error:', error);
    return NextResponse.json({ message: 'Failed to create item', details: error.message }, { status: 500 });
  }
} 