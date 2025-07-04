import fs from 'fs-extra';
import path from 'path';
import chokidar from 'chokidar';
import { v4 as uuidv4 } from 'uuid';
import { OutlineItem, BookProject } from './ghost-agent-data';

export interface FileSystemItem {
    id: string;
    name: string;
    path: string;
    type: 'file' | 'folder';
    content?: string;
    children?: FileSystemItem[];
    lastModified: Date;
    size: number;
}

export interface ProjectStructure {
    id: string;
    name: string;
    path: string;
    items: FileSystemItem[];
    lastSync: Date;
}

export class FileSystemManager {
    private projectsRoot: string;
    private watchers: Map<string, chokidar.FSWatcher> = new Map();

    constructor(projectsRoot: string) {
        this.projectsRoot = projectsRoot;
    }

    /**
     * Get all projects in the workspace
     */
    async getProjects(): Promise<ProjectStructure[]> {
        const projects: ProjectStructure[] = [];
        
        try {
            const projectTypes = ['libros', 'scripts', 'blog_posts'];
            
            for (const type of projectTypes) {
                const typePath = path.join(this.projectsRoot, type);
                if (await fs.pathExists(typePath)) {
                    const projectDirs = await fs.readdir(typePath);
                    
                    for (const projectDir of projectDirs) {
                        const projectPath = path.join(typePath, projectDir);
                        const stats = await fs.stat(projectPath);
                        
                        if (stats.isDirectory()) {
                            const structure = await this.getProjectStructure(projectPath);
                            projects.push(structure);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error getting projects:', error);
        }
        
        return projects;
    }

    /**
     * Get the structure of a specific project
     */
    async getProjectStructure(projectPath: string): Promise<ProjectStructure> {
        const projectName = path.basename(projectPath);
        const items = await this.scanDirectory(projectPath);
        
        return {
            id: projectName,
            name: projectName,
            path: projectPath,
            items,
            lastSync: new Date()
        };
    }

    /**
     * Scan a directory recursively and return file system items
     */
    private async scanDirectory(dirPath: string): Promise<FileSystemItem[]> {
        const items: FileSystemItem[] = [];
        
        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            
            for (const entry of entries) {
                // Skip hidden files and manifest
                if (entry.name.startsWith('.') || entry.name === '.ghost_manifest.json') {
                    continue;
                }
                
                const fullPath = path.join(dirPath, entry.name);
                const stats = await fs.stat(fullPath);
                
                const item: FileSystemItem = {
                    id: uuidv4(),
                    name: entry.name,
                    path: fullPath,
                    type: entry.isDirectory() ? 'folder' : 'file',
                    lastModified: stats.mtime,
                    size: stats.size
                };
                
                if (entry.isDirectory()) {
                    item.children = await this.scanDirectory(fullPath);
                } else if (entry.isFile()) {
                    // Read file content for text files - be more permissive
                    const ext = path.extname(entry.name).toLowerCase();
                    const textExtensions = ['.md', '.txt', '.json', '.js', '.ts', '.jsx', '.tsx', '.html', '.css'];
                    
                    // If file has no extension or is a text file, try to read it
                    if (textExtensions.includes(ext) || ext === '' || stats.size < 1024 * 1024) { // Less than 1MB
                        try {
                            item.content = await fs.readFile(fullPath, 'utf-8');
                        } catch (error) {
                            console.warn(`Could not read file content: ${fullPath}`, error);
                            item.content = `[Error reading file: ${entry.name}]`;
                        }
                    } else {
                        item.content = `[Binary file: ${entry.name}]\n\nThis is a binary file and cannot be displayed as text content.`;
                    }
                }
                
                items.push(item);
            }
        } catch (error) {
            console.error(`Error scanning directory: ${dirPath}`, error);
        }
        
        return items;
    }

    /**
     * Create a new file
     */
    async createFile(projectPath: string, fileName: string, content: string = '', parentPath?: string): Promise<FileSystemItem> {
        const targetPath = parentPath ? path.join(projectPath, parentPath) : projectPath;
        
        // Ensure file has .md extension if it doesn't have one
        let finalFileName = fileName;
        if (!path.extname(fileName)) {
            finalFileName = fileName + '.md';
        }
        
        const filePath = path.join(targetPath, finalFileName);
        
        // Ensure the target directory exists
        await fs.ensureDir(targetPath);
        
        // Check if file already exists
        if (await fs.pathExists(filePath)) {
            throw new Error(`File already exists: ${finalFileName}`);
        }
        
        // Create the file
        await fs.writeFile(filePath, content, 'utf-8');
        
        const stats = await fs.stat(filePath);
        
        return {
            id: uuidv4(),
            name: finalFileName,
            path: filePath,
            type: 'file',
            content,
            lastModified: stats.mtime,
            size: stats.size
        };
    }

    /**
     * Create a new folder
     */
    async createFolder(projectPath: string, folderName: string, parentPath?: string): Promise<FileSystemItem> {
        const targetPath = parentPath ? path.join(projectPath, parentPath) : projectPath;
        const folderPath = path.join(targetPath, folderName);
        
        // Ensure the target directory exists
        await fs.ensureDir(targetPath);
        
        // Check if folder already exists
        if (await fs.pathExists(folderPath)) {
            throw new Error(`Folder already exists: ${folderName}`);
        }
        
        // Create the folder
        await fs.mkdir(folderPath);
        
        const stats = await fs.stat(folderPath);
        
        return {
            id: uuidv4(),
            name: folderName,
            path: folderPath,
            type: 'folder',
            children: [],
            lastModified: stats.mtime,
            size: 0
        };
    }

    /**
     * Update file content
     */
    async updateFileContent(filePath: string, content: string): Promise<void> {
        if (!await fs.pathExists(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        
        await fs.writeFile(filePath, content, 'utf-8');
    }

    /**
     * Rename a file or folder
     */
    async renameItem(oldPath: string, newName: string): Promise<FileSystemItem> {
        if (!await fs.pathExists(oldPath)) {
            throw new Error(`Item not found: ${oldPath}`);
        }
        
        const newPath = path.join(path.dirname(oldPath), newName);
        
        if (await fs.pathExists(newPath)) {
            throw new Error(`An item with the name '${newName}' already exists`);
        }
        
        // Rename the item
        await fs.move(oldPath, newPath);
        
        const stats = await fs.stat(newPath);
        
        const item: FileSystemItem = {
            id: uuidv4(),
            name: newName,
            path: newPath,
            type: stats.isDirectory() ? 'folder' : 'file',
            lastModified: stats.mtime,
            size: stats.size
        };
        
        if (stats.isDirectory()) {
            item.children = await this.scanDirectory(newPath);
        } else {
            // Read file content for text files
            const ext = path.extname(newName).toLowerCase();
            const textExtensions = ['.md', '.txt', '.json', '.js', '.ts', '.jsx', '.tsx', '.html', '.css'];
            
            if (textExtensions.includes(ext) || stats.size < 1024 * 1024) {
                try {
                    item.content = await fs.readFile(newPath, 'utf-8');
                } catch (error) {
                    console.warn(`Could not read file content: ${newPath}`, error);
                    item.content = `[Error reading file: ${newName}]`;
                }
            } else {
                item.content = `[Binary file: ${newName}]\n\nThis is a binary file and cannot be displayed as text content.`;
            }
        }
        
        return item;
    }

    /**
     * Delete a file or folder
     */
    async deleteItem(itemPath: string): Promise<void> {
        if (!await fs.pathExists(itemPath)) {
            throw new Error(`Item not found: ${itemPath}`);
        }
        
        const stats = await fs.stat(itemPath);
        
        if (stats.isDirectory()) {
            await fs.remove(itemPath);
        } else {
            await fs.unlink(itemPath);
        }
    }

    /**
     * Import files into a project
     */
    async importFiles(projectPath: string, files: Array<{ name: string; content: string }>, parentPath?: string): Promise<FileSystemItem[]> {
        const importedItems: FileSystemItem[] = [];
        
        for (const file of files) {
            try {
                // Ensure file has .md extension if it doesn't have one
                let fileName = file.name;
                if (!path.extname(fileName)) {
                    fileName = fileName + '.md';
                }
                
                const item = await this.createFile(projectPath, fileName, file.content, parentPath);
                importedItems.push(item);
            } catch (error) {
                console.error(`Error importing file ${file.name}:`, error);
                throw error;
            }
        }
        
        return importedItems;
    }

    /**
     * Watch a project for changes
     */
    watchProject(projectPath: string, callback: (event: string, path: string) => void): void {
        if (this.watchers.has(projectPath)) {
            this.watchers.get(projectPath)?.close();
        }
        
        const watcher = chokidar.watch(projectPath, {
            ignored: /(^|[\/\\])\../, // Ignore hidden files
            persistent: true
        });
        
        watcher
            .on('add', (path) => callback('add', path))
            .on('change', (path) => callback('change', path))
            .on('unlink', (path) => callback('unlink', path))
            .on('addDir', (path) => callback('addDir', path))
            .on('unlinkDir', (path) => callback('unlinkDir', path));
        
        this.watchers.set(projectPath, watcher);
    }

    /**
     * Stop watching a project
     */
    stopWatching(projectPath: string): void {
        const watcher = this.watchers.get(projectPath);
        if (watcher) {
            watcher.close();
            this.watchers.delete(projectPath);
        }
    }

    /**
     * Clean up all watchers
     */
    cleanup(): void {
        for (const [projectPath, watcher] of this.watchers) {
            watcher.close();
        }
        this.watchers.clear();
    }
}

// Export a singleton instance
export const fileSystemManager = new FileSystemManager(path.resolve(process.cwd(), '..', 'GHOST_Proyectos')); 