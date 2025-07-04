import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs-extra';

const GHOST_PROJECTS_ROOT = path.resolve(process.cwd(), '..', 'GHOST_Proyectos');

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, projectPath, ...params } = body;

        console.log('[API/simple-file-operations] Request:', { action, projectPath, params });

        if (!action || !projectPath) {
            return NextResponse.json({ 
                success: false, 
                message: 'Missing required parameters: action and projectPath' 
            }, { status: 400 });
        }

        // Resolve the full project path
        const cleanProjectPath = projectPath.replace(/^GHOST_Proyectos[\/\\]/, '');
        const fullProjectPath = path.join(GHOST_PROJECTS_ROOT, cleanProjectPath);

        console.log('[API/simple-file-operations] Full project path:', fullProjectPath);

        // Ensure the project directory exists
        if (!await fs.pathExists(fullProjectPath)) {
            console.error('[API/simple-file-operations] Project directory not found:', fullProjectPath);
            return NextResponse.json({ 
                success: false, 
                message: 'Project directory not found' 
            }, { status: 404 });
        }

        let result: any;

        switch (action) {
            case 'createFile':
                result = await createFile(fullProjectPath, params.fileName, params.content || '', params.parentPath);
                break;

            case 'createFolder':
                result = await createFolder(fullProjectPath, params.folderName, params.parentPath);
                break;

            case 'updateContent':
                const filePath = path.join(fullProjectPath, params.filePath);
                await updateFileContent(filePath, params.content);
                result = { success: true };
                break;

            case 'rename':
                const oldPath = path.join(fullProjectPath, params.oldPath);
                result = await renameItem(oldPath, params.newName);
                break;

            case 'delete':
                const itemPath = path.join(fullProjectPath, params.itemPath);
                await deleteItem(itemPath);
                result = { success: true };
                break;

            case 'import':
                result = await importFiles(fullProjectPath, params.files, params.parentPath);
                break;

            case 'getStructure':
                result = await getProjectStructure(fullProjectPath, projectPath);
                break;

            default:
                return NextResponse.json({ 
                    success: false, 
                    message: `Unknown action: ${action}` 
                }, { status: 400 });
        }

        // Get updated project structure
        const updatedStructure = await getProjectStructure(fullProjectPath, projectPath);

        console.log('[API/simple-file-operations] Operation successful:', { action, result: !!result, structureItems: updatedStructure.items?.length });

        return NextResponse.json({
            success: true,
            result,
            updatedStructure
        });

    } catch (error: any) {
        console.error('[API/simple-file-operations] Error:', error);
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

        const structure = await getProjectStructure(fullProjectPath, projectPath);

        return NextResponse.json({
            success: true,
            structure
        });

    } catch (error: any) {
        console.error('[API/simple-file-operations] GET Error:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Failed to get project structure',
            details: error.stack
        }, { status: 500 });
    }
}

// Helper functions
async function createFile(projectPath: string, fileName: string, content: string = '', parentPath?: string) {
    const targetPath = parentPath ? path.join(projectPath, parentPath) : projectPath;
    
    // Ensure file has .md extension
    let finalFileName = fileName;
    if (!path.extname(fileName)) {
        finalFileName = fileName + '.md';
    }
    
    const filePath = path.join(targetPath, finalFileName);
    
    // Ensure directory exists
    await fs.ensureDir(targetPath);
    
    // Create file
    await fs.writeFile(filePath, content, 'utf-8');
    
    const stats = await fs.stat(filePath);
    
    return {
        id: `${finalFileName}_${stats.mtime.getTime()}`,
        name: finalFileName,
        path: filePath,
        type: 'file',
        content,
        lastModified: stats.mtime
    };
}

async function createFolder(projectPath: string, folderName: string, parentPath?: string) {
    const targetPath = parentPath ? path.join(projectPath, parentPath) : projectPath;
    const folderPath = path.join(targetPath, folderName);
    
    // Ensure directory exists
    await fs.ensureDir(targetPath);
    
    // Create folder
    await fs.mkdir(folderPath);
    
    const stats = await fs.stat(folderPath);
    
    return {
        id: `${folderName}_${stats.mtime.getTime()}`,
        name: folderName,
        path: folderPath,
        type: 'folder',
        children: [],
        lastModified: stats.mtime
    };
}

async function updateFileContent(filePath: string, content: string) {
    await fs.writeFile(filePath, content, 'utf-8');
}

async function renameItem(oldPath: string, newName: string) {
    const newPath = path.join(path.dirname(oldPath), newName);
    
    await fs.move(oldPath, newPath);
    
    const stats = await fs.stat(newPath);
    
    const result = {
        id: `${newName}_${stats.mtime.getTime()}`,
        name: newName,
        path: newPath,
        type: stats.isDirectory() ? 'folder' : 'file',
        lastModified: stats.mtime
    };
    
    if (stats.isDirectory()) {
        result.children = await scanDirectory(newPath);
    } else {
        // Read content for files
        const ext = path.extname(newName).toLowerCase();
        const textExtensions = ['.md', '.txt', '.json', '.js', '.ts', '.jsx', '.tsx', '.html', '.css'];
        
        if (textExtensions.includes(ext) || ext === '' || stats.size < 1024 * 1024) {
            try {
                result.content = await fs.readFile(newPath, 'utf-8');
            } catch (error) {
                result.content = `[Error reading file: ${newName}]`;
            }
        } else {
            result.content = `[Binary file: ${newName}]`;
        }
    }

    return result;
}

async function deleteItem(itemPath: string) {
    await fs.remove(itemPath);
}

async function importFiles(projectPath: string, files: Array<{ name: string; content: string }>, parentPath?: string) {
    const importedItems = [];
    
    for (const file of files) {
        const item = await createFile(projectPath, file.name, file.content, parentPath);
        importedItems.push(item);
    }
    
    return importedItems;
}

async function getProjectStructure(projectPath: string, projectPathString: string) {
    const projectName = path.basename(projectPath);
    const items = await scanDirectory(projectPath);
    
    return {
        id: projectName,
        name: projectName,
        path: projectPathString,
        items,
        lastSync: new Date()
    };
}

async function scanDirectory(dirPath: string) {
    const items = [];
    
    try {
        if (!await fs.pathExists(dirPath)) {
            return items;
        }

        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
            // Skip hidden files
            if (entry.name.startsWith('.')) {
                continue;
            }
            
            const fullPath = path.join(dirPath, entry.name);
            const stats = await fs.stat(fullPath);
            
            const item = {
                id: `${entry.name}_${stats.mtime.getTime()}`,
                name: entry.name,
                path: fullPath,
                type: entry.isDirectory() ? 'folder' : 'file',
                lastModified: stats.mtime
            };
            
            if (entry.isDirectory()) {
                item.children = await scanDirectory(fullPath);
            } else if (entry.isFile()) {
                // Read content for text files
                const ext = path.extname(entry.name).toLowerCase();
                const textExtensions = ['.md', '.txt', '.json', '.js', '.ts', '.jsx', '.tsx', '.html', '.css'];
                
                if (textExtensions.includes(ext) || ext === '' || stats.size < 1024 * 1024) {
                    try {
                        item.content = await fs.readFile(fullPath, 'utf-8');
                    } catch (error) {
                        item.content = `[Error reading file: ${entry.name}]`;
                    }
                } else {
                    item.content = `[Binary file: ${entry.name}]`;
                }
            }
            
            items.push(item);
        }
    } catch (error) {
        console.error(`Error scanning directory: ${dirPath}`, error);
    }
    
    return items;
} 