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
                path: path.join('GHOST_Proyectos', dirName, dirent.name),
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
                const relativePath = path.relative(projectRootPath, fullPath);

                let id = pathIdMap[relativePath];
                if (!id) {
                    id = uuidv4();
                    manifest[id] = relativePath;
                    pathIdMap[relativePath] = id;
                    debugLog(`Generated new ID ${id} for ${relativePath}`);
                }

                if (item.isDirectory()) {
                    return {
                        id: id,
                        title: item.name,
                        type: 'folder',
                        path: fullPath,
                        children: readDirRecursive(fullPath, projectRootPath, manifest, pathIdMap)
                    };
                } else {
                    let content = '';
                    try {
                        content = fs.readFileSync(fullPath, 'utf-8');
                    } catch (e) {
                        console.warn(`Could not read file: ${fullPath}`, e);
                    }
                    return {
                        id: id,
                        title: item.name,
                        type: 'file',
                        path: fullPath,
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
    
    const projectFullPath = path.resolve(WORKSPACE_ROOT, '..', projectSubPath);
    const projectName = path.basename(projectSubPath);
    
    debugLog(`Project full path: ${projectFullPath}`);
    debugLog(`Project name: ${projectName}`);

    if (!fs.existsSync(projectFullPath)) {
        debugLog(`Project path does not exist: ${projectFullPath}`);
        return null;
    }
    
    const manifest = getProjectManifest(projectFullPath);
    // Create a reverse map for quick path-to-ID lookups
    const pathIdMap = Object.fromEntries(Object.entries(manifest).map(([id, p]) => [p, id]));

    const outline = readDirRecursive(projectFullPath, projectFullPath, manifest, pathIdMap);

    // Prune stale entries from manifest
    const manifestIds = Object.keys(manifest);
    let prunedCount = 0;
    for (const id of manifestIds) {
        const itemPath = path.join(projectFullPath, manifest[id]);
        if (!fs.existsSync(itemPath)) {
            delete manifest[id];
            prunedCount++;
        }
    }
    
    if (prunedCount > 0) {
        debugLog(`Pruned ${prunedCount} stale entries from manifest`);
    }

    saveProjectManifest(projectFullPath, manifest);

    const project: BookProject = {
        id: projectName,
        name: projectName.replace(/_/g, ' '),
        path: projectSubPath,
        outline: outline,
        type: 'book',
        goal: '',
        targetAudience: '',
        timeline: {
            startDate: '',
            endDate: '',
            milestones: []
        },
        publicPersona: '',
        context: {
            text: '',
            links: [],
            files: []
        },
        collaboration: {
            team: [],
            sharedResources: [],
        },
        seo: {
            keywords: [],
            targetQueries: [],
            metaDescription: ''
        },
        status: ''
    };
    
    debugLog(`Project structure scanned successfully`, { 
        outlineItems: outline.length,
        manifestEntries: Object.keys(manifest).length 
    });
    
    return project;
}; 