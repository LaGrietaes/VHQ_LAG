import fs from 'fs';
import path from 'path';
import { OutlineItem, BookProject } from './ghost-agent-data';
import { v4 as uuidv4 } from 'uuid';

const GHOST_PROJECTS_ROOT = path.join(process.cwd(), '..', 'GHOST_Proyectos');
const MANIFEST_FILE = '.ghost_manifest.json';

// Manifest stores a map of ID -> relative path
type Manifest = Record<string, string>;

const getProjectManifest = (projectFullPath: string): Manifest => {
    const manifestPath = path.join(projectFullPath, MANIFEST_FILE);
    if (fs.existsSync(manifestPath)) {
        try {
            const rawData = fs.readFileSync(manifestPath, 'utf-8');
            return JSON.parse(rawData);
        } catch (error) {
            console.error('Error reading or parsing manifest file:', error);
            return {};
        }
    }
    return {};
};

const saveProjectManifest = (projectFullPath: string, manifest: Manifest) => {
    const manifestPath = path.join(projectFullPath, MANIFEST_FILE);
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
};

export interface ProjectSummary {
    id: string;
    title: string;
    type: 'book' | 'script' | 'blog';
    path: string;
}

const getProjectsFromType = (dirName: string, type: ProjectSummary['type']): ProjectSummary[] => {
    const fullPath = path.join(GHOST_PROJECTS_ROOT, dirName);
    if (!fs.existsSync(fullPath)) {
        return [];
    }
    const projectFolders = fs.readdirSync(fullPath, { withFileTypes: true });
    return projectFolders
        .filter(dirent => dirent.isDirectory())
        .map(dirent => ({
            id: dirent.name,
            title: dirent.name.replace(/_/g, ' '),
            type: type,
            path: path.join('GHOST_Proyectos', dirName, dirent.name),
        }));
};

export const getAllProjects = (): { books: ProjectSummary[], scripts: ProjectSummary[], blogs: ProjectSummary[] } => {
    const books = getProjectsFromType('libros', 'book');
    const scripts = getProjectsFromType('scripts', 'script');
    const blogs = getProjectsFromType('blog_posts', 'blog');
    return { books, scripts, blogs };
};

export const getProjectById = (id: string): ProjectSummary | null => {
    const { books, scripts, blogs } = getAllProjects();
    const allProjects = [...books, ...scripts, ...blogs];
    return allProjects.find(p => p.id === id) || null;
}

const readDirRecursive = (dir: string, projectRootPath: string, manifest: Manifest, pathIdMap: Record<string, string>): OutlineItem[] => {
    if (!fs.existsSync(dir)) return [];
    
    const items = fs.readdirSync(dir, { withFileTypes: true });

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
};

export const scanProjectStructure = async (projectSubPath: string): Promise<BookProject | null> => {
    const projectFullPath = path.join(process.cwd(), '..', projectSubPath);
    const projectName = path.basename(projectSubPath);

    if (!fs.existsSync(projectFullPath)) {
        return null;
    }
    
    const manifest = getProjectManifest(projectFullPath);
    // Create a reverse map for quick path-to-ID lookups
    const pathIdMap = Object.fromEntries(Object.entries(manifest).map(([id, p]) => [p, id]));

    const outline = readDirRecursive(projectFullPath, projectFullPath, manifest, pathIdMap);

    // Prune stale entries from manifest
    const currentPaths = new Set(Object.values(manifest));
    const manifestIds = Object.keys(manifest);
    for (const id of manifestIds) {
        if (!fs.existsSync(path.join(projectFullPath, manifest[id]))) {
            delete manifest[id];
        }
    }

    saveProjectManifest(projectFullPath, manifest);

    return {
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
}; 