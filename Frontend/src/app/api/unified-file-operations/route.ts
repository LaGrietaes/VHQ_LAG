import { NextRequest, NextResponse } from 'next/server';
import { unifiedFileManager } from '@/lib/unified-file-manager';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, projectPath, ...params } = body;

        console.log('[API/unified-file-operations] Request:', { action, projectPath, params });

        if (!action || !projectPath) {
            return NextResponse.json({ 
                success: false, 
                message: 'Missing required parameters: action and projectPath' 
            }, { status: 400 });
        }

        let result: any;

        switch (action) {
            case 'getStructure':
                result = await unifiedFileManager.getProjectStructure(projectPath);
                break;

            case 'createFile':
                result = await unifiedFileManager.createFile(
                    projectPath,
                    params.fileName,
                    params.content || '',
                    params.parentPath
                );
                break;

            case 'createFolder':
                result = await unifiedFileManager.createFolder(
                    projectPath,
                    params.folderName,
                    params.parentPath
                );
                break;

            case 'updateContent':
                result = await unifiedFileManager.updateFileContent(
                    projectPath,
                    params.filePath,
                    params.content
                );
                break;

            case 'rename':
                result = await unifiedFileManager.renameItem(
                    projectPath,
                    params.oldPath,
                    params.newName
                );
                break;

            case 'delete':
                result = await unifiedFileManager.deleteItem(
                    projectPath,
                    params.itemPath
                );
                break;

            case 'move':
                result = await unifiedFileManager.moveItem(
                    projectPath,
                    params.itemPath,
                    params.targetParentPath
                );
                break;

            case 'import':
                result = await unifiedFileManager.importFiles(
                    projectPath,
                    params.files,
                    params.parentPath
                );
                break;

            default:
                return NextResponse.json({ 
                    success: false, 
                    message: `Unknown action: ${action}` 
                }, { status: 400 });
        }

        // If the operation was successful and we need to return updated structure
        if (result.success && action !== 'getStructure') {
            const updatedStructure = await unifiedFileManager.getProjectStructure(projectPath);
            result.updatedStructure = updatedStructure;
        }

        console.log('[API/unified-file-operations] Operation completed:', { 
            action, 
            success: result.success, 
            message: result.message 
        });

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('[API/unified-file-operations] Error:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Operation failed',
            error: 'INTERNAL_ERROR'
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

                const structure = await unifiedFileManager.getProjectStructure(projectPath);
        
        return NextResponse.json({
            success: true,
            structure
        });

    } catch (error: any) {
        console.error('[API/unified-file-operations] GET Error:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Failed to get project structure',
            error: 'GET_FAILED'
        }, { status: 500 });
    }
} 