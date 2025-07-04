import fs from 'fs';
import path from 'path';
import { OutlineItem, BookProject } from './ghost-agent-data';
import { v4 as uuidv4 } from 'uuid';

// Use absolute path resolution
const WORKSPACE_ROOT = process.cwd();
const GHOST_PROJECTS_ROOT = path.resolve(WORKSPACE_ROOT, '..', 'GHOST_Proyectos');
const MANIFEST_FILE = '.ghost_manifest.json';

// Debug logging function
const debugLog = (message: string, data?: any) => {
    console.log(`[projects-fs] ${message}`, data || '');
};

// Manifest stores a map of ID -> relative path
type Manifest = Record<string, string>;

// Helper function to normalize paths for Windows/Unix compatibility
const normalizePath = (p: string): string => {
    return p.replace(/\\/g, '/');
};

// Helper function to ensure a path is relative to GHOST_PROJECTS_ROOT
const ensureRelativePath = (p: string): string => {
    const normalized = normalizePath(p);
    return normalized.replace(/^GHOST_Proyectos[\/]?/, '');
};

const getProjectManifest = (projectFullPath: string): Manifest => {
    const manifestPath = path.join(projectFullPath, MANIFEST_FILE);
    debugLog(`Reading manifest from: ${manifestPath}`);
    
    if (fs.existsSync(manifestPath)) {
        try {
            const rawData = fs.readFileSync(manifestPath, 'utf-8');
            const manifest = JSON.parse(rawData);
            debugLog(`Manifest loaded with ${Object.keys(manifest).length} entries`);
            return manifest;
        } catch (error) {
            console.error('Error reading or parsing manifest file:', error);
            return {};
        }
    }
    debugLog('Manifest file does not exist, returning empty manifest');
    return {};
};

const saveProjectManifest = (projectFullPath: string, manifest: Manifest) => {
    const manifestPath = path.join(projectFullPath, MANIFEST_FILE);
    debugLog(`Saving manifest to: ${manifestPath}`, { entries: Object.keys(manifest).length });
    
    try {
        // Ensure the directory exists before writing
        const manifestDir = path.dirname(manifestPath);
        if (!fs.existsSync(manifestDir)) {
            fs.mkdirSync(manifestDir, { recursive: true });
        }
        
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
        debugLog('Manifest saved successfully');
    } catch (error) {
        console.error('Error saving manifest:', error);
    }
};

export interface ProjectSummary {
    id: string;
    title: string;
    type: 'book' | 'script' | 'blog';
    path: string;
}

const getProjectsFromType = (dirName: string, type: ProjectSummary['type']): ProjectSummary[] => {
    const fullPath = path.join(GHOST_PROJECTS_ROOT, dirName);
    debugLog(`Scanning projects in: ${fullPath}`);
    
    if (!fs.existsSync(fullPath)) {
        debugLog(`Directory does not exist: ${fullPath}`);
        return [];
    }
    
    try {
        const projectFolders = fs.readdirSync(fullPath, { withFileTypes: true });
        const projects = projectFolders
            .filter(dirent => dirent.isDirectory())
            .map(dirent => ({
                id: dirent.name,
                title: dirent.name.replace(/_/g, ' '),
                type: type,
                path: normalizePath(path.join('GHOST_Proyectos', dirName, dirent.name)),
            }));
        
        debugLog(`Found ${projects.length} projects of type ${type}`);
        return projects;
    } catch (error) {
        console.error(`Error reading directory ${fullPath}:`, error);
        return [];
    }
};

export const getAllProjects = (): { books: ProjectSummary[], scripts: ProjectSummary[], blogs: ProjectSummary[] } => {
    debugLog(`GHOST_PROJECTS_ROOT: ${GHOST_PROJECTS_ROOT}`);
    
    const books = getProjectsFromType('libros', 'book');
    const scripts = getProjectsFromType('scripts', 'script');
    const blogs = getProjectsFromType('blog_posts', 'blog');
    
    return { books, scripts, blogs };
};

export const getProjectById = (id: string): ProjectSummary | null => {
    debugLog(`Looking for project with id: ${id}`);
    
    const { books, scripts, blogs } = getAllProjects();
    const allProjects = [...books, ...scripts, ...blogs];
    const project = allProjects.find(p => p.id === id) || null;
    
    debugLog(`Project found:`, project);
    return project;
}

const readDirRecursive = (dir: string, projectRootPath: string, manifest: Manifest, pathIdMap: Record<string, string>): OutlineItem[] => {
    debugLog(`Reading directory: ${dir}`);
    
    if (!fs.existsSync(dir)) {
        debugLog(`Directory does not exist: ${dir}`);
        return [];
    }
    
    try {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        debugLog(`Found ${items.length} items in ${dir}`);

        return items
            .filter(item => item.name !== MANIFEST_FILE) // Ignore manifest file
            .map(item => {
                const fullPath = path.join(dir, item.name);
                const relativePath = normalizePath(path.relative(projectRootPath, fullPath));

                let id = pathIdMap[relativePath];
                if (!id) {
                    id = uuidv4();
                    manifest[id] = relativePath;
                    pathIdMap[relativePath] = id;
                    debugLog(`Generated new ID ${id} for ${relativePath}`);
                } else {
                    debugLog(`Reused existing ID ${id} for ${relativePath}`);
                }

                if (item.isDirectory()) {
                    return {
                        id: id,
                        title: item.name,
                        type: 'folder' as const,
                        children: readDirRecursive(fullPath, projectRootPath, manifest, pathIdMap)
                    };
                } else {
                    // Enhanced file extension detection
                    const fileExtension = path.extname(item.name).toLowerCase();
                    const fileName = item.name;
                    
                    debugLog(`Processing file: ${fileName} with extension: ${fileExtension}`);
                    
                    let content = '';
                    let isTextFile = false;
                    
                    // Determine if this is a text file we can read
                    const textExtensions = ['.md', '.txt', '.json', '.js', '.ts', '.jsx', '.tsx', '.html', '.css', '.scss', '.sass', '.xml', '.yaml', '.yml', '.csv', '.log'];
                    const markdownExtensions = ['.md', '.markdown', '.mdown', '.mdx'];
                    
                    if (textExtensions.includes(fileExtension) || markdownExtensions.includes(fileExtension)) {
                        isTextFile = true;
                    } else if (!fileExtension) {
                        // Files without extension - try to read as text if they're small
                        try {
                            const stats = fs.statSync(fullPath);
                            if (stats.size < 1024 * 1024) { // Less than 1MB
                                isTextFile = true;
                            }
                        } catch (e) {
                            debugLog(`Could not get stats for ${fullPath}:`, e);
                        }
                    }
                    
                    if (isTextFile) {
                        try {
                            content = fs.readFileSync(fullPath, 'utf-8');
                            debugLog(`Successfully read text file: ${fileName} (${content.length} characters)`);
                        } catch (e) {
                            console.warn(`Could not read file as text: ${fullPath}`, e);
                            content = `[Error reading file: ${fileName}]\n\nThis file could not be read as text content.`;
                        }
                    } else {
                        content = `[Binary file: ${fileName}]\n\nThis is a binary file (${fileExtension || 'no extension'}) and cannot be displayed as text content.`;
                        debugLog(`Binary file detected: ${fileName} (${fileExtension || 'no extension'})`);
                    }
                    
                    return {
                        id: id,
                        title: item.name,
                        type: 'file' as const,
                        content: content,
                    };
                }
            });
    } catch (error) {
        console.error(`Error reading directory ${dir}:`, error);
        return [];
    }
};

export const scanProjectStructure = async (projectSubPath: string): Promise<BookProject | null> => {
    debugLog(`Scanning project structure for: ${projectSubPath}`);
    
    // Clean up and normalize the project path
    const cleanProjectPath = ensureRelativePath(projectSubPath);
    const projectFullPath = path.join(GHOST_PROJECTS_ROOT, cleanProjectPath);
    const projectName = path.basename(cleanProjectPath);
    
    debugLog(`Project full path: ${projectFullPath}`);
    debugLog(`Project name: ${projectName}`);

    if (!fs.existsSync(projectFullPath)) {
        debugLog(`Project path does not exist: ${projectFullPath}`);
        return null;
    }
    
    const manifest = getProjectManifest(projectFullPath);
    debugLog(`Loaded manifest with ${Object.keys(manifest).length} entries:`, manifest);
    
    // Create a reverse map for quick path-to-ID lookups
    const pathIdMap = Object.fromEntries(Object.entries(manifest).map(([id, p]) => [normalizePath(p), id]));
    debugLog(`Created pathIdMap with ${Object.keys(pathIdMap).length} entries:`, pathIdMap);

    const outline = readDirRecursive(projectFullPath, projectFullPath, manifest, pathIdMap);

    // Prune stale entries from manifest - only remove entries that don't exist in filesystem
    const manifestIds = Object.keys(manifest);
    let prunedCount = 0;
    for (const id of manifestIds) {
        const itemPath = path.join(projectFullPath, manifest[id]);
        if (!fs.existsSync(itemPath)) {
            debugLog(`Pruning stale manifest entry: ${id} -> ${manifest[id]} (file not found: ${itemPath})`);
            delete manifest[id];
            prunedCount++;
        } else {
            // Verify the file has content if it's a file
            const stats = fs.statSync(itemPath);
            if (stats.isFile() && stats.size === 0) {
                debugLog(`Found empty file: ${itemPath} (${stats.size} bytes)`);
            }
        }
    }
    
    if (prunedCount > 0) {
        debugLog(`Pruned ${prunedCount} stale entries from manifest`);
        saveProjectManifest(projectFullPath, manifest);
    }

    // Verify all files in the outline exist and have content
    const verifyOutline = (items: OutlineItem[]): void => {
        for (const item of items) {
            const itemPath = path.join(projectFullPath, manifest[item.id] || '');
            if (item.type === 'file' && itemPath) {
                if (fs.existsSync(itemPath)) {
                    const stats = fs.statSync(itemPath);
                    debugLog(`File verification: ${item.title} - Size: ${stats.size} bytes`);
                    if (stats.size === 0) {
                        debugLog(`Warning: Empty file detected: ${item.title}`);
                    }
                } else {
                    debugLog(`Warning: File not found: ${item.title} at ${itemPath}`);
                }
            }
            if (item.children) {
                verifyOutline(item.children);
            }
        }
    };
    
    verifyOutline(outline);

    const project: BookProject = {
        id: projectName,
        name: projectName,
        title: projectName,
        type: 'book',
        status: "Escribiendo",
        lastEdit: "now",
        progress: 50,
        path: normalizePath(path.join('GHOST_Proyectos', cleanProjectPath)),
        outline: outline
    };

    debugLog(`Project structure scanned successfully`, { 
        outlineItems: outline.length, 
        manifestEntries: Object.keys(manifest).length,
        outline: outline.map(item => ({ id: item.id, title: item.title, type: item.type }))
    });
    return project;
}; 