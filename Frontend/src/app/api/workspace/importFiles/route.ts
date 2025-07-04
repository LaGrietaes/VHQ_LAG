import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { scanProjectStructure } from '@/lib/projects-fs';
import { OutlineItem } from '@/lib/ghost-agent-data';
import { v4 as uuidv4 } from 'uuid';

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

const saveProjectManifest = (projectFullPath: string, manifest: Manifest) => {
    const manifestPath = path.join(projectFullPath, MANIFEST_FILE);
    try {
        const manifestDir = path.dirname(manifestPath);
        if (!fs.existsSync(manifestDir)) {
            fs.mkdirSync(manifestDir, { recursive: true });
        }
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    } catch (e) {
        console.error(`Error saving manifest for ${projectFullPath}`, e);
    }
};

const createItemRecursive = async (
    projectFullPath: string, 
    parentPath: string, 
    items: OutlineItem[], 
    manifest: Manifest
): Promise<void> => {
    for (const item of items) {
        try {
            console.log('[API/importFiles] Processing item:', { 
                id: item.id, 
                title: item.title, 
                type: item.type,
                hasContent: !!item.content,
                contentLength: item.content?.length || 0
            });
            
            // Ensure proper file extension for files
            let finalTitle = item.title;
            if (item.type === 'file' && !finalTitle.endsWith('.md') && !finalTitle.endsWith('.txt')) {
                finalTitle = finalTitle + '.md';
            }
            
            const itemPath = path.join(parentPath, finalTitle);
            const itemRelativePath = path.relative(projectFullPath, itemPath).replace(/\\/g, '/');

            console.log('[API/importFiles] Item paths:', {
                itemPath,
                itemRelativePath,
                finalTitle
            });

            if (item.type === 'folder') {
                // Create folder
                if (!fs.existsSync(itemPath)) {
                    await fs.promises.mkdir(itemPath, { recursive: true });
                    console.log(`[API/importFiles] Created folder: ${itemPath}`);
                } else {
                    console.log(`[API/importFiles] Folder already exists: ${itemPath}`);
                }
                
                // Add to manifest
                manifest[item.id] = itemRelativePath;
                console.log(`[API/importFiles] Added folder to manifest: ${item.id} -> ${itemRelativePath}`);
                
                // Process children
                if (item.children && item.children.length > 0) {
                    await createItemRecursive(projectFullPath, itemPath, item.children, manifest);
                }
            } else {
                // Create file with content
                const content = item.content || '';
                console.log(`[API/importFiles] Creating file with ${content.length} characters: ${itemPath}`);
                
                // Ensure parent directory exists
                const parentDir = path.dirname(itemPath);
                if (!fs.existsSync(parentDir)) {
                    await fs.promises.mkdir(parentDir, { recursive: true });
                    console.log(`[API/importFiles] Created parent directory: ${parentDir}`);
                }
                
                // Write file content
                await fs.promises.writeFile(itemPath, content, 'utf-8');
                console.log(`[API/importFiles] Created file: ${itemPath} (${content.length} characters)`);
                
                // Verify file was created and has content
                const stats = fs.statSync(itemPath);
                const actualContent = fs.readFileSync(itemPath, 'utf-8');
                console.log(`[API/importFiles] File verification: ${itemPath} - Size: ${stats.size} bytes, Content length: ${actualContent.length} characters`);
                
                if (stats.size === 0) {
                    console.warn(`[API/importFiles] Warning: File is empty: ${itemPath}`);
                }
                
                // Add to manifest
                manifest[item.id] = itemRelativePath;
                console.log(`[API/importFiles] Added file to manifest: ${item.id} -> ${itemRelativePath}`);
            }
        } catch (error) {
            console.error(`[API/importFiles] Error processing item ${item.id}:`, error);
            throw new Error(`Failed to process item ${item.title}: ${error.message}`);
        }
    }
};

const parseMarkdownFile = (content: string, fileName: string): OutlineItem[] => {
    console.log(`[API/importFiles] Parsing markdown file: ${fileName} (${content.length} characters)`);
    
    const lines = content.split('\n');
    const items: OutlineItem[] = [];
    const parentStack: OutlineItem[] = [];
    
    let currentItem: OutlineItem | null = null;
    let currentContent: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
        
        if (headingMatch) {
            // Save previous item if exists
            if (currentItem && currentContent.length > 0) {
                currentItem.content = currentContent.join('\n').trim();
                console.log(`[API/importFiles] Saved item: ${currentItem.title} with ${currentItem.content.length} characters`);
            }
            
            const level = headingMatch[1].length;
            const title = headingMatch[2].trim();
            
            // Clean up title for filename
            let cleanTitle = title
                .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename characters
                .replace(/\s+/g, ' ') // Normalize spaces
                .trim();
            
            // Ensure it ends with .md
            if (!cleanTitle.endsWith('.md')) {
                cleanTitle = cleanTitle + '.md';
            }
            
            // Create new item
            currentItem = {
                id: uuidv4(),
                title: cleanTitle,
                type: 'file' as const,
                content: '',
                children: []
            };
            
            // Reset content
            currentContent = [];
            
            // Add to appropriate parent based on heading level
            while (parentStack.length >= level) {
                parentStack.pop();
            }
            
            const parent = parentStack[parentStack.length - 1];
            if (parent) {
                parent.children = parent.children || [];
                parent.children.push(currentItem);
            } else {
                items.push(currentItem);
            }
            
            parentStack.push(currentItem);
            
            console.log(`[API/importFiles] Created item: ${cleanTitle} (level ${level})`);
        } else {
            // Add line to current item's content
            if (currentItem) {
                currentContent.push(line);
            }
        }
    }
    
    // Save the last item
    if (currentItem && currentContent.length > 0) {
        currentItem.content = currentContent.join('\n').trim();
        console.log(`[API/importFiles] Saved final item: ${currentItem.title} with ${currentItem.content.length} characters`);
    }
    
    // If no headings found, create a single file with the entire content
    if (items.length === 0) {
        const singleItem: OutlineItem = {
            id: uuidv4(),
            title: fileName.endsWith('.md') ? fileName : fileName + '.md',
            type: 'file' as const,
            content: content.trim(),
            children: []
        };
        items.push(singleItem);
        console.log(`[API/importFiles] Created single item from file: ${singleItem.title} with ${singleItem.content.length} characters`);
    }
    
    console.log(`[API/importFiles] Parsed ${items.length} items from markdown file`);
    return items;
};

export async function POST(req: NextRequest) {
    try {
        const { projectRootPath, parentId, items } = await req.json();
        
        console.log('[API/importFiles] Import request:', {
            projectRootPath,
            parentId,
            itemCount: items.length
        });

        if (!projectRootPath || !items || !Array.isArray(items)) {
            return NextResponse.json(
                { error: 'Invalid request: missing projectRootPath or items array' },
                { status: 400 }
            );
        }

        // Use the correct path resolution with GHOST_PROJECTS_ROOT
        const cleanProjectPath = projectRootPath.replace(/^GHOST_Proyectos[\/\\]/, '');
        const projectFullPath = path.join(GHOST_PROJECTS_ROOT, cleanProjectPath);
        console.log('[API/importFiles] Project full path:', projectFullPath);
        console.log('[API/importFiles] Current working directory:', process.cwd());
        console.log('[API/importFiles] GHOST_PROJECTS_ROOT:', GHOST_PROJECTS_ROOT);

        if (!fs.existsSync(projectFullPath)) {
            console.error('[API/importFiles] Project path does not exist:', projectFullPath);
            return NextResponse.json(
                { error: 'Project path does not exist' },
                { status: 404 }
            );
        }

        // Determine parent directory
        let parentDir = projectFullPath;
        if (parentId) {
            const manifest = getProjectManifest(projectFullPath);
            const parentPath = manifest[parentId];
            if (parentPath) {
                parentDir = path.join(projectFullPath, parentPath);
                if (!fs.existsSync(parentDir)) {
                    console.log(`[API/importFiles] Creating parent directory: ${parentDir}`);
                    await fs.promises.mkdir(parentDir, { recursive: true });
                }
            } else {
                console.warn(`[API/importFiles] Parent ID not found in manifest: ${parentId}`);
            }
        }

        console.log('[API/importFiles] Parent directory for import:', parentDir);

        // Load existing manifest
        const manifest = getProjectManifest(projectFullPath);
        console.log('[API/importFiles] Loaded manifest with', Object.keys(manifest).length, 'entries');

        // Process each item
        for (const item of items) {
            console.log('[API/importFiles] Processing item:', {
                id: item.id,
                title: item.title,
                type: item.type,
                hasContent: !!item.content,
                contentLength: item.content?.length || 0
            });

            if (item.type === 'file' && item.content) {
                // For files with content, create them directly
                await createItemRecursive(projectFullPath, parentDir, [item], manifest);
            } else if (item.type === 'folder') {
                // For folders, create them and process children
                await createItemRecursive(projectFullPath, parentDir, [item], manifest);
            } else {
                console.warn('[API/importFiles] Skipping item with no content:', item.title);
            }
        }

        // Save updated manifest
        saveProjectManifest(projectFullPath, manifest);
        console.log('[API/importFiles] Saved updated manifest with', Object.keys(manifest).length, 'entries');

        // Return updated project structure
        const updatedProject = await scanProjectStructure(projectRootPath);
        
        if (!updatedProject) {
            return NextResponse.json(
                { error: 'Failed to scan updated project structure' },
                { status: 500 }
            );
        }

        console.log('[API/importFiles] Import completed successfully');
        return NextResponse.json({
            success: true,
            message: 'Files imported successfully',
            updatedProject
        });

    } catch (error) {
        console.error('[API/importFiles] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
} 