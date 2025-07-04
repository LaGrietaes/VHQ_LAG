import fs from 'fs-extra';
import path from 'path';

export interface SimpleFileItem {
    id: string;
    name: string;
    type: 'file' | 'folder';
    content?: string;
    children?: SimpleFileItem[];
    path: string;
    lastModified: Date;
}

export interface ProjectState {
    id: string;
    name: string;
    path: string;
    items: SimpleFileItem[];
    lastSync: Date;
}

export class SimpleFileManager {
    private projectsRoot: string;
    private localStorageKey = 'ghost_projects_state';

    constructor(projectsRoot: string) {
        this.projectsRoot = projectsRoot;
    }

    /**
     * Get project state from local storage or filesystem
     */
    async getProjectState(projectPath: string): Promise<ProjectState> {
        const projectName = path.basename(projectPath);
        const fullProjectPath = path.join(this.projectsRoot, projectPath.replace(/^GHOST_Proyectos[\/\\]/, ''));
        
        // Try to get from local storage first
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(this.localStorageKey);
            if (stored) {
                try {
                    const allProjects = JSON.parse(stored);
                    const project = allProjects[projectName];
                    if (project && project.path === projectPath) {
                        return project;
                    }
                } catch (error) {
                    console.warn('Failed to parse stored project state:', error);
                }
            }
        }

        // Fallback to filesystem scan
        return this.scanProjectFromFilesystem(fullProjectPath, projectName, projectPath);
    }

    /**
     * Save project state to local storage
     */
    private saveProjectState(projectState: ProjectState): void {
        if (typeof window === 'undefined') return;

        try {
            const stored = localStorage.getItem(this.localStorageKey);
            const allProjects = stored ? JSON.parse(stored) : {};
            allProjects[projectState.name] = projectState;
            localStorage.setItem(this.localStorageKey, JSON.stringify(allProjects));
        } catch (error) {
            console.error('Failed to save project state:', error);
        }
    }

    /**
     * Scan project from filesystem
     */
    private async scanProjectFromFilesystem(fullProjectPath: string, projectName: string, projectPath: string): Promise<ProjectState> {
        const items = await this.scanDirectory(fullProjectPath);
        
        const projectState: ProjectState = {
            id: projectName,
            name: projectName,
            path: projectPath,
            items,
            lastSync: new Date()
        };

        // Save to local storage
        this.saveProjectState(projectState);
        
        return projectState;
    }

    /**
     * Scan directory recursively
     */
    private async scanDirectory(dirPath: string): Promise<SimpleFileItem[]> {
        const items: SimpleFileItem[] = [];
        
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
                
                const item: SimpleFileItem = {
                    id: `${entry.name}_${stats.mtime.getTime()}`,
                    name: entry.name,
                    path: fullPath,
                    type: entry.isDirectory() ? 'folder' : 'file',
                    lastModified: stats.mtime
                };
                
                if (entry.isDirectory()) {
                    item.children = await this.scanDirectory(fullPath);
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

    /**
     * Create a new file
     */
    async createFile(projectPath: string, fileName: string, content: string = '', parentPath?: string): Promise<SimpleFileItem> {
        const fullProjectPath = path.join(this.projectsRoot, projectPath.replace(/^GHOST_Proyectos[\/\\]/, ''));
        const targetPath = parentPath ? path.join(fullProjectPath, parentPath) : fullProjectPath;
        
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
        
        const newItem: SimpleFileItem = {
            id: `${finalFileName}_${stats.mtime.getTime()}`,
            name: finalFileName,
            path: filePath,
            type: 'file',
            content,
            lastModified: stats.mtime
        };

        // Update project state
        await this.updateProjectState(projectPath, (state) => {
            if (parentPath) {
                // Add to parent folder
                this.addItemToFolder(state.items, parentPath, newItem);
            } else {
                // Add to root
                state.items.push(newItem);
            }
            return state;
        });

        return newItem;
    }

    /**
     * Create a new folder
     */
    async createFolder(projectPath: string, folderName: string, parentPath?: string): Promise<SimpleFileItem> {
        const fullProjectPath = path.join(this.projectsRoot, projectPath.replace(/^GHOST_Proyectos[\/\\]/, ''));
        const targetPath = parentPath ? path.join(fullProjectPath, parentPath) : fullProjectPath;
        const folderPath = path.join(targetPath, folderName);
        
        // Ensure directory exists
        await fs.ensureDir(targetPath);
        
        // Create folder
        await fs.mkdir(folderPath);
        
        const stats = await fs.stat(folderPath);
        
        const newItem: SimpleFileItem = {
            id: `${folderName}_${stats.mtime.getTime()}`,
            name: folderName,
            path: folderPath,
            type: 'folder',
            children: [],
            lastModified: stats.mtime
        };

        // Update project state
        await this.updateProjectState(projectPath, (state) => {
            if (parentPath) {
                // Add to parent folder
                this.addItemToFolder(state.items, parentPath, newItem);
            } else {
                // Add to root
                state.items.push(newItem);
            }
            return state;
        });

        return newItem;
    }

    /**
     * Update file content
     */
    async updateFileContent(projectPath: string, filePath: string, content: string): Promise<void> {
        const fullProjectPath = path.join(this.projectsRoot, projectPath.replace(/^GHOST_Proyectos[\/\\]/, ''));
        const fullFilePath = path.join(fullProjectPath, filePath);
        
        await fs.writeFile(fullFilePath, content, 'utf-8');
        
        // Update project state
        await this.updateProjectState(projectPath, (state) => {
            this.updateItemContent(state.items, filePath, content);
            return state;
        });
    }

    /**
     * Rename item
     */
    async renameItem(projectPath: string, oldPath: string, newName: string): Promise<SimpleFileItem> {
        const fullProjectPath = path.join(this.projectsRoot, projectPath.replace(/^GHOST_Proyectos[\/\\]/, ''));
        const oldFullPath = path.join(fullProjectPath, oldPath);
        const newFullPath = path.join(path.dirname(oldFullPath), newName);
        
        await fs.move(oldFullPath, newFullPath);
        
        const stats = await fs.stat(newFullPath);
        
        const updatedItem: SimpleFileItem = {
            id: `${newName}_${stats.mtime.getTime()}`,
            name: newName,
            path: newFullPath,
            type: stats.isDirectory() ? 'folder' : 'file',
            lastModified: stats.mtime
        };
        
        if (stats.isDirectory()) {
            updatedItem.children = await this.scanDirectory(newFullPath);
        } else {
            // Read content for files
            const ext = path.extname(newName).toLowerCase();
            const textExtensions = ['.md', '.txt', '.json', '.js', '.ts', '.jsx', '.tsx', '.html', '.css'];
            
            if (textExtensions.includes(ext) || ext === '' || stats.size < 1024 * 1024) {
                try {
                    updatedItem.content = await fs.readFile(newFullPath, 'utf-8');
                } catch (error) {
                    updatedItem.content = `[Error reading file: ${newName}]`;
                }
            } else {
                updatedItem.content = `[Binary file: ${newName}]`;
            }
        }

        // Update project state
        await this.updateProjectState(projectPath, (state) => {
            this.renameItemInState(state.items, oldPath, updatedItem);
            return state;
        });

        return updatedItem;
    }

    /**
     * Delete item
     */
    async deleteItem(projectPath: string, itemPath: string): Promise<void> {
        const fullProjectPath = path.join(this.projectsRoot, projectPath.replace(/^GHOST_Proyectos[\/\\]/, ''));
        const fullItemPath = path.join(fullProjectPath, itemPath);
        
        await fs.remove(fullItemPath);
        
        // Update project state
        await this.updateProjectState(projectPath, (state) => {
            this.removeItemFromState(state.items, itemPath);
            return state;
        });
    }

    /**
     * Import files
     */
    async importFiles(projectPath: string, files: Array<{ name: string; content: string }>, parentPath?: string): Promise<SimpleFileItem[]> {
        const importedItems: SimpleFileItem[] = [];
        
        for (const file of files) {
            const item = await this.createFile(projectPath, file.name, file.content, parentPath);
            importedItems.push(item);
        }
        
        return importedItems;
    }

    /**
     * Update project state in local storage
     */
    private async updateProjectState(projectPath: string, updater: (state: ProjectState) => ProjectState): Promise<void> {
        const projectName = path.basename(projectPath);
        const currentState = await this.getProjectState(projectPath);
        const updatedState = updater(currentState);
        updatedState.lastSync = new Date();
        
        this.saveProjectState(updatedState);
    }

    /**
     * Helper methods for state manipulation
     */
    private addItemToFolder(items: SimpleFileItem[], folderPath: string, newItem: SimpleFileItem): void {
        for (const item of items) {
            if (item.name === folderPath && item.type === 'folder') {
                item.children = item.children || [];
                item.children.push(newItem);
                return;
            }
            if (item.children) {
                this.addItemToFolder(item.children, folderPath, newItem);
            }
        }
    }

    private updateItemContent(items: SimpleFileItem[], filePath: string, content: string): void {
        for (const item of items) {
            if (item.name === filePath && item.type === 'file') {
                item.content = content;
                item.lastModified = new Date();
                return;
            }
            if (item.children) {
                this.updateItemContent(item.children, filePath, content);
            }
        }
    }

    private renameItemInState(items: SimpleFileItem[], oldPath: string, updatedItem: SimpleFileItem): void {
        for (let i = 0; i < items.length; i++) {
            if (items[i].name === oldPath) {
                items[i] = updatedItem;
                return;
            }
            if (items[i].children) {
                this.renameItemInState(items[i].children!, oldPath, updatedItem);
            }
        }
    }

    private removeItemFromState(items: SimpleFileItem[], itemPath: string): void {
        for (let i = 0; i < items.length; i++) {
            if (items[i].name === itemPath) {
                items.splice(i, 1);
                return;
            }
            if (items[i].children) {
                this.removeItemFromState(items[i].children!, itemPath);
            }
        }
    }
}

// Export singleton instance
export const simpleFileManager = new SimpleFileManager(path.resolve(process.cwd(), '..', 'GHOST_Proyectos'));
