import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { fileSystemManager } from '@/lib/file-system-manager';
import fs from 'fs-extra'; // Added import for fs-extra

const GHOST_PROJECTS_ROOT = path.resolve(process.cwd(), '..', 'GHOST_Proyectos');

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, projectPath, ...params } = body;

        console.log('[API/file-operations] Request:', { action, projectPath, params });

        if (!action || !projectPath) {
            return NextResponse.json({ 
                success: false, 
                message: 'Missing required parameters: action and projectPath' 
            }, { status: 400 });
        }

        // Resolve the full project path
        const cleanProjectPath = projectPath.replace(/^GHOST_Proyectos[\/\\]/, '');
        const fullProjectPath = path.join(GHOST_PROJECTS_ROOT, cleanProjectPath);

        console.log('[API/file-operations] Full project path:', fullProjectPath);

        // Ensure the project directory exists
        if (!await fs.pathExists(fullProjectPath)) {
            console.error('[API/file-operations] Project directory not found:', fullProjectPath);
            return NextResponse.json({ 
                success: false, 
                message: 'Project directory not found' 
            }, { status: 404 });
        }

        let result: any;

        switch (action) {
            case 'createFile':
                result = await fileSystemManager.createFile(
                    fullProjectPath,
                    params.fileName,
                    params.content || '',
                    params.parentPath
                );
                break;

            case 'createFolder':
                result = await fileSystemManager.createFolder(
                    fullProjectPath,
                    params.folderName,
                    params.parentPath
                );
                break;

            case 'updateContent':
                const filePath = path.join(fullProjectPath, params.filePath);
                await fileSystemManager.updateFileContent(filePath, params.content);
                result = { success: true };
                break;

            case 'rename':
                const oldPath = path.join(fullProjectPath, params.oldPath);
                result = await fileSystemManager.renameItem(oldPath, params.newName);
                break;

            case 'delete':
                const itemPath = path.join(fullProjectPath, params.itemPath);
                await fileSystemManager.deleteItem(itemPath);
                result = { success: true };
                break;

            case 'import':
                result = await fileSystemManager.importFiles(
                    fullProjectPath,
                    params.files,
                    params.parentPath
                );
                break;

            case 'getStructure':
                result = await fileSystemManager.getProjectStructure(fullProjectPath);
                break;

            default:
                return NextResponse.json({ 
                    success: false, 
                    message: `Unknown action: ${action}` 
                }, { status: 400 });
        }

        // Get updated project structure
        const updatedStructure = await fileSystemManager.getProjectStructure(fullProjectPath);

        console.log('[API/file-operations] Operation successful:', { action, result: !!result, structureItems: updatedStructure.items?.length });

        return NextResponse.json({
            success: true,
            result,
            updatedStructure
        });

    } catch (error: any) {
        console.error('[API/file-operations] Error:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Operation failed',
            details: error.stack
        }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const projectPath = searchParams.get('projectPath');

        if (!projectPath) {
            return NextResponse.json({ 
                success: false, 
                message: 'Missing projectPath parameter' 
            }, { status: 400 });
        }

        const cleanProjectPath = projectPath.replace(/^GHOST_Proyectos[\/\\]/, '');
        const fullProjectPath = path.join(GHOST_PROJECTS_ROOT, cleanProjectPath);

        const structure = await fileSystemManager.getProjectStructure(fullProjectPath);

        return NextResponse.json({
            success: true,
            structure
        });

    } catch (error: any) {
        console.error('[API/file-operations] GET Error:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Failed to get project structure',
            details: error.stack
        }, { status: 500 });
    }
} 