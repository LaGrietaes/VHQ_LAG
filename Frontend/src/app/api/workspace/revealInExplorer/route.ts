import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
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

const revealInExplorer = async (targetPath: string): Promise<void> => {
    const platform = process.platform;
    try {
        if (platform === 'win32') {
            if (fs.existsSync(targetPath)) {
                const stats = fs.statSync(targetPath);
                try {
                    if (stats.isDirectory()) {
                        await execAsync(`explorer "${targetPath}"`);
                    } else {
                        const absolutePath = path.resolve(targetPath);
                        await execAsync(`explorer /select,"${absolutePath}"`);
                    }
                } catch (error) {
                    // Log but do not throw; treat as non-fatal
                    console.warn('Non-fatal error revealing in explorer (Windows):', error);
                }
            }
        } else if (platform === 'darwin') {
            if (fs.existsSync(targetPath)) {
                try {
                    await execAsync(`open -R "${targetPath}"`);
                } catch (error) {
                    console.warn('Non-fatal error revealing in explorer (macOS):', error);
                }
            }
        } else {
            if (fs.existsSync(targetPath)) {
                const stats = fs.statSync(targetPath);
                try {
                    if (stats.isDirectory()) {
                        await execAsync(`xdg-open "${targetPath}"`);
                    } else {
                        const parentDir = path.dirname(targetPath);
                        await execAsync(`xdg-open "${parentDir}"`);
                    }
                } catch (error) {
                    console.warn('Non-fatal error revealing in explorer (Linux):', error);
                }
            }
        }
    } catch (error) {
        // Only throw if the path does not exist
        throw error;
    }
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { projectRootPath, itemId } = body;

        if (!projectRootPath) {
            return NextResponse.json({ message: 'Missing project root path' }, { status: 400 });
        }

        // Clean up the project path to avoid duplication
        const cleanProjectPath = projectRootPath.replace(/^GHOST_Proyectos[\/\\]/, '');
        const projectFullPath = path.join(GHOST_PROJECTS_ROOT, cleanProjectPath);
        
        // Ensure the project directory exists
        if (!fs.existsSync(projectFullPath)) {
            return NextResponse.json({ message: 'Project directory not found' }, { status: 404 });
        }

        let targetPath = projectFullPath;

        if (itemId) {
            // Get the specific file/folder path from manifest
            const manifest = getProjectManifest(projectFullPath);
            const itemRelativePath = manifest[itemId];
            
            if (!itemRelativePath) {
                return NextResponse.json({ message: 'Item not found in manifest' }, { status: 404 });
            }

            targetPath = path.join(projectFullPath, itemRelativePath);
            
            if (!fs.existsSync(targetPath)) {
                // Try parent directory if file is missing
                const parentDir = path.dirname(targetPath);
                if (fs.existsSync(parentDir)) {
                    targetPath = parentDir;
                } else {
                    return NextResponse.json({ message: 'Item not found in file system' }, { status: 404 });
                }
            }
        }

        // Only return error if the path does not exist
        if (!fs.existsSync(targetPath)) {
            return NextResponse.json({ message: 'Target path does not exist' }, { status: 404 });
        }

        await revealInExplorer(targetPath);
        return NextResponse.json({ success: true, message: 'Revealed in explorer' });

    } catch (error: any) {
        console.error('[API/revealInExplorer] Error:', error);
        return NextResponse.json({ 
            message: 'Failed to reveal in explorer', 
            details: error.message
        }, { status: 500 });
    }
} 