import fs from 'fs';
import path from 'path';
import { OutlineItem, BookProject } from './ghost-agent-data';
import { v4 as uuidv4 } from 'uuid';

const GHOST_PROYECTOS_PATH = path.join(process.cwd(), '..', 'GHOST_Proyectos');

export interface ProjectSummary {
    id: string;
    title: string;
    type: 'book' | 'script' | 'blog';
    path: string;
}

const getProjectsFromType = (dirName: string, type: ProjectSummary['type']): ProjectSummary[] => {
    const fullPath = path.join(GHOST_PROYECTOS_PATH, dirName);
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

const GHOST_PROJECTS_ROOT = path.join(process.cwd(), '..', 'GHOST_Proyectos');

const readDirRecursive = (dir: string, projectRootPath: string): OutlineItem[] => {
    if (!fs.existsSync(dir)) return [];
    
    const items = fs.readdirSync(dir, { withFileTypes: true });

    return items.map(item => {
        const fullPath = path.join(dir, item.name);
        const relativePath = path.relative(projectRootPath, fullPath);

        if (item.isDirectory()) {
            return {
                id: uuidv4(),
                title: item.name,
                type: 'folder',
                path: fullPath,
                children: readDirRecursive(fullPath, projectRootPath)
            };
        } else {
            let content = '';
            try {
                content = fs.readFileSync(fullPath, 'utf-8');
            } catch (e) {
                console.warn(`Could not read file: ${fullPath}`, e);
            }
            return {
                id: uuidv4(),
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
    
    const outline = readDirRecursive(projectFullPath, projectFullPath);

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