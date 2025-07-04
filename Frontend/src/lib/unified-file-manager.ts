import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface FileItem {
    id: string;
    name: string;
    type: 'file' | 'folder';
    content?: string;
    children?: FileItem[];
    lastModified: Date;
    size: number;
    path: string; // Relative path from project root
}

export interface ProjectStructure {
    id: string;
    name: string;
    path: string;
    items: FileItem[];
    lastSync: Date;
    stats: {
        totalFiles: number;
        totalFolders: number;
        totalWords: number;
        totalCharacters: number;
        fileTypes: Record<string, number>;
    };
}

export interface FileOperationResult {
    success: boolean;
    message: string;
    data?: any;
    error?: string;
}

export class UnifiedFileManager {
    private projectsRoot: string;
    private textExtensions = ['.md', '.txt', '.json', '.js', '.ts', '.jsx', '.tsx', '.html', '.css', '.yml', '.yaml', '.xml'];
    private maxFileSize = 1024 * 1024; // 1MB

    constructor(projectsRoot: string) {
        this.projectsRoot = projectsRoot;
    }

    /**
     * Get project structure with full filesystem scan
     */
    async getProjectStructure(projectPath: string): Promise<ProjectStructure> {
        try {
            const fullProjectPath = this.resolveProjectPath(projectPath);
            
            if (!await fs.pathExists(fullProjectPath)) {
                throw new Error(`Project directory not found: ${projectPath}`);
            }

            const projectName = path.basename(fullProjectPath);
            const items = await this.scanDirectory(fullProjectPath, '');
            const stats = this.calculateStats(items);

            return {
                id: projectName,
                name: projectName,
                path: projectPath,
                items,
                lastSync: new Date(),
                stats
            };
        } catch (error) {
            console.error('[UnifiedFileManager] Error getting project structure:', error);
            throw error;
        }
    }

    /**
     * Create a new file
     */
    async createFile(projectPath: string, fileName: string, content: string = '', parentPath?: string): Promise<FileOperationResult> {
        try {
            const fullProjectPath = this.resolveProjectPath(projectPath);
            const targetPath = parentPath ? path.join(fullProjectPath, parentPath) : fullProjectPath;
            
            // Ensure file has .md extension if no extension
            let finalFileName = fileName;
            if (!path.extname(fileName)) {
                finalFileName = fileName + '.md';
            }

            // Sanitize filename
            finalFileName = this.sanitizeFileName(finalFileName);
            
            const filePath = path.join(targetPath, finalFileName);
            
            // Ensure target directory exists
            await fs.ensureDir(targetPath);
            
            // Check if file already exists
            if (await fs.pathExists(filePath)) {
                return {
                    success: false,
                    message: `File already exists: ${finalFileName}`,
                    error: 'FILE_EXISTS'
                };
            }
            
            // Create the file with proper UTF-8 encoding
            await fs.writeFile(filePath, content, { encoding: 'utf8' });
            
            const stats = await fs.stat(filePath);
            const relativePath = path.relative(fullProjectPath, filePath).replace(/\\/g, '/');
            
            return {
                success: true,
                message: `File created successfully: ${finalFileName}`,
                data: {
                    id: uuidv4(),
                    name: finalFileName,
                    type: 'file' as const,
                    content,
                    lastModified: stats.mtime,
                    size: stats.size,
                    path: relativePath
                }
            };
        } catch (error) {
            console.error('[UnifiedFileManager] Error creating file:', error);
            return {
                success: false,
                message: `Failed to create file: ${error.message}`,
                error: 'CREATE_FAILED'
            };
        }
    }

    /**
     * Create a new folder
     */
    async createFolder(projectPath: string, folderName: string, parentPath?: string): Promise<FileOperationResult> {
        try {
            const fullProjectPath = this.resolveProjectPath(projectPath);
            const targetPath = parentPath ? path.join(fullProjectPath, parentPath) : fullProjectPath;
            
            // Sanitize folder name
            const sanitizedName = this.sanitizeFileName(folderName);
            const folderPath = path.join(targetPath, sanitizedName);
            
            // Ensure target directory exists
            await fs.ensureDir(targetPath);
            
            // Check if folder already exists
            if (await fs.pathExists(folderPath)) {
                return {
                    success: false,
                    message: `Folder already exists: ${sanitizedName}`,
                    error: 'FOLDER_EXISTS'
                };
            }
            
            // Create the folder
            await fs.mkdir(folderPath);
            
            const stats = await fs.stat(folderPath);
            const relativePath = path.relative(fullProjectPath, folderPath).replace(/\\/g, '/');
            
            return {
                success: true,
                message: `Folder created successfully: ${sanitizedName}`,
                data: {
                    id: uuidv4(),
                    name: sanitizedName,
                    type: 'folder' as const,
                    children: [],
                    lastModified: stats.mtime,
                    size: 0,
                    path: relativePath
                }
            };
        } catch (error) {
            console.error('[UnifiedFileManager] Error creating folder:', error);
            return {
                success: false,
                message: `Failed to create folder: ${error.message}`,
                error: 'CREATE_FAILED'
            };
        }
    }

    /**
     * Update file content
     */
    async updateFileContent(projectPath: string, filePath: string, content: string): Promise<FileOperationResult> {
        try {
            const fullProjectPath = this.resolveProjectPath(projectPath);
            const fullFilePath = path.join(fullProjectPath, filePath);
            
            // Check if file exists
            if (!await fs.pathExists(fullFilePath)) {
                return {
                    success: false,
                    message: `File not found: ${filePath}`,
                    error: 'FILE_NOT_FOUND'
                };
            }
            
            // Check if it's actually a file
            const stats = await fs.stat(fullFilePath);
            if (!stats.isFile()) {
                return {
                    success: false,
                    message: `Path is not a file: ${filePath}`,
                    error: 'NOT_A_FILE'
                };
            }
            
            // Write content with proper UTF-8 encoding
            await fs.writeFile(fullFilePath, content, { encoding: 'utf8' });
            
            const newStats = await fs.stat(fullFilePath);
            
            return {
                success: true,
                message: 'Content updated successfully',
                data: {
                    size: newStats.size,
                    lastModified: newStats.mtime
                }
            };
        } catch (error) {
            console.error('[UnifiedFileManager] Error updating file content:', error);
            return {
                success: false,
                message: `Failed to update content: ${error.message}`,
                error: 'UPDATE_FAILED'
            };
        }
    }

    /**
     * Rename an item (file or folder)
     */
    async renameItem(projectPath: string, oldPath: string, newName: string): Promise<FileOperationResult> {
        try {
            const fullProjectPath = this.resolveProjectPath(projectPath);
            const fullOldPath = path.join(fullProjectPath, oldPath);
            const newPath = path.join(path.dirname(fullOldPath), newName);
            
            // Check if source exists
            if (!await fs.pathExists(fullOldPath)) {
                return {
                    success: false,
                    message: `Item not found: ${oldPath}`,
                    error: 'ITEM_NOT_FOUND'
                };
            }
            
            // Check if destination already exists
            if (await fs.pathExists(newPath)) {
                return {
                    success: false,
                    message: `Item already exists: ${newName}`,
                    error: 'ITEM_EXISTS'
                };
            }
            
            // Move the item
            await fs.move(fullOldPath, newPath);
            
            const stats = await fs.stat(newPath);
            const relativePath = path.relative(fullProjectPath, newPath).replace(/\\/g, '/');
            
            const result: FileItem = {
                id: uuidv4(),
                name: newName,
                type: stats.isDirectory() ? 'folder' : 'file',
                lastModified: stats.mtime,
                size: stats.size,
                path: relativePath
            };
            
            if (stats.isDirectory()) {
                result.children = await this.scanDirectory(newPath, relativePath);
            } else {
                // Read content for text files
                const ext = path.extname(newName).toLowerCase();
                if (this.textExtensions.includes(ext) || ext === '' || stats.size < this.maxFileSize) {
                    try {
                        result.content = await this.readFileWithEncoding(newPath);
                    } catch (error) {
                        result.content = `[Error reading file: ${newName}]`;
                    }
                } else {
                    result.content = `[Binary file: ${newName}]`;
                }
            }
            
            return {
                success: true,
                message: `Item renamed successfully: ${newName}`,
                data: result
            };
        } catch (error) {
            console.error('[UnifiedFileManager] Error renaming item:', error);
            return {
                success: false,
                message: `Failed to rename item: ${error.message}`,
                error: 'RENAME_FAILED'
            };
        }
    }

    /**
     * Delete an item (file or folder)
     */
    async deleteItem(projectPath: string, itemPath: string): Promise<FileOperationResult> {
        try {
            const fullProjectPath = this.resolveProjectPath(projectPath);
            const fullItemPath = path.join(fullProjectPath, itemPath);
            
            // Check if item exists
            if (!await fs.pathExists(fullItemPath)) {
                return {
                    success: false,
                    message: `Item not found: ${itemPath}`,
                    error: 'ITEM_NOT_FOUND'
                };
            }
            
            // Delete the item
            await fs.remove(fullItemPath);
            
            return {
                success: true,
                message: 'Item deleted successfully'
            };
        } catch (error) {
            console.error('[UnifiedFileManager] Error deleting item:', error);
            return {
                success: false,
                message: `Failed to delete item: ${error.message}`,
                error: 'DELETE_FAILED'
            };
        }
    }

    /**
     * Import files into a project
     */
    async importFiles(projectPath: string, files: Array<{ name: string; content: string }>, parentPath?: string): Promise<FileOperationResult> {
        try {
            const fullProjectPath = this.resolveProjectPath(projectPath);
            const targetPath = parentPath ? path.join(fullProjectPath, parentPath) : fullProjectPath;
            
            // Ensure target directory exists
            await fs.ensureDir(targetPath);
            
            const importedItems: FileItem[] = [];
            const errors: string[] = [];
            
            for (const file of files) {
                try {
                    // Sanitize filename
                    const sanitizedName = this.sanitizeFileName(file.name);
                    let finalFileName = sanitizedName;
                    
                    // Ensure file has .md extension if no extension
                    if (!path.extname(sanitizedName)) {
                        finalFileName = sanitizedName + '.md';
                    }
                    
                    const filePath = path.join(targetPath, finalFileName);
                    
                    // Check if file already exists
                    if (await fs.pathExists(filePath)) {
                        errors.push(`File already exists: ${finalFileName}`);
                        continue;
                    }
                    
                    // Create the file with proper UTF-8 encoding
                    await fs.writeFile(filePath, file.content, { encoding: 'utf8' });
                    
                    const stats = await fs.stat(filePath);
                    const relativePath = path.relative(fullProjectPath, filePath).replace(/\\/g, '/');
                    
                    importedItems.push({
                        id: uuidv4(),
                        name: finalFileName,
                        type: 'file',
                        content: file.content,
                        lastModified: stats.mtime,
                        size: stats.size,
                        path: relativePath
                    });
                } catch (error) {
                    errors.push(`Failed to import ${file.name}: ${error.message}`);
                }
            }
            
            if (errors.length > 0 && importedItems.length === 0) {
                return {
                    success: false,
                    message: `Import failed: ${errors.join(', ')}`,
                    error: 'IMPORT_FAILED'
                };
            }
            
            return {
                success: true,
                message: `Imported ${importedItems.length} files successfully${errors.length > 0 ? ` (${errors.length} failed)` : ''}`,
                data: importedItems
            };
        } catch (error) {
            console.error('[UnifiedFileManager] Error importing files:', error);
            return {
                success: false,
                message: `Failed to import files: ${error.message}`,
                error: 'IMPORT_FAILED'
            };
        }
    }

    /**
     * Move an item to a different location
     */
    async moveItem(projectPath: string, itemPath: string, targetParentPath?: string): Promise<FileOperationResult> {
        try {
            const fullProjectPath = this.resolveProjectPath(projectPath);
            const fullItemPath = path.join(fullProjectPath, itemPath);
            const targetPath = targetParentPath ? path.join(fullProjectPath, targetParentPath) : fullProjectPath;
            
            // Check if source exists
            if (!await fs.pathExists(fullItemPath)) {
                return {
                    success: false,
                    message: `Item not found: ${itemPath}`,
                    error: 'ITEM_NOT_FOUND'
                };
            }
            
            // Check if target directory exists
            if (!await fs.pathExists(targetPath)) {
                return {
                    success: false,
                    message: `Target directory not found: ${targetParentPath || 'root'}`,
                    error: 'TARGET_NOT_FOUND'
                };
            }
            
            const itemName = path.basename(fullItemPath);
            const newPath = path.join(targetPath, itemName);
            
            // Check if destination already exists
            if (await fs.pathExists(newPath)) {
                return {
                    success: false,
                    message: `Item already exists at destination: ${itemName}`,
                    error: 'ITEM_EXISTS'
                };
            }
            
            // Move the item
            await fs.move(fullItemPath, newPath);
            
            const stats = await fs.stat(newPath);
            const relativePath = path.relative(fullProjectPath, newPath).replace(/\\/g, '/');
            
            const result: FileItem = {
                id: uuidv4(),
                name: itemName,
                type: stats.isDirectory() ? 'folder' : 'file',
                lastModified: stats.mtime,
                size: stats.size,
                path: relativePath
            };
            
            if (stats.isDirectory()) {
                result.children = await this.scanDirectory(newPath, relativePath);
            } else {
                // Read content for text files
                const ext = path.extname(itemName).toLowerCase();
                if (this.textExtensions.includes(ext) || ext === '' || stats.size < this.maxFileSize) {
                    try {
                        result.content = await this.readFileWithEncoding(newPath);
                    } catch (error) {
                        result.content = `[Error reading file: ${itemName}]`;
                    }
                } else {
                    result.content = `[Binary file: ${itemName}]`;
                }
            }
            
            return {
                success: true,
                message: `Item moved successfully`,
                data: result
            };
        } catch (error) {
            console.error('[UnifiedFileManager] Error moving item:', error);
            return {
                success: false,
                message: `Failed to move item: ${error.message}`,
                error: 'MOVE_FAILED'
            };
        }
    }

    /**
     * Private helper methods
     */
    private resolveProjectPath(projectPath: string): string {
        // Remove GHOST_Proyectos prefix if present
        const cleanPath = projectPath.replace(/^GHOST_Proyectos[\/\\]/, '');
        return path.join(this.projectsRoot, cleanPath);
    }

    private sanitizeFileName(name: string): string {
        // Remove or replace invalid characters
        return name
            .replace(/[<>:"/\\|?*]/g, '_')
            .replace(/\s+/g, ' ')
            .trim();
    }

    private async scanDirectory(dirPath: string, relativePath: string): Promise<FileItem[]> {
        const items: FileItem[] = [];
        
        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            
            for (const entry of entries) {
                // Skip hidden files and system files
                if (entry.name.startsWith('.') || entry.name === 'Thumbs.db' || entry.name === '.DS_Store') {
                    continue;
                }
                
                const fullPath = path.join(dirPath, entry.name);
                const stats = await fs.stat(fullPath);
                const itemRelativePath = path.join(relativePath, entry.name).replace(/\\/g, '/');
                
                const item: FileItem = {
                    id: uuidv4(),
                    name: entry.name,
                    type: entry.isDirectory() ? 'folder' : 'file',
                    lastModified: stats.mtime,
                    size: stats.size,
                    path: itemRelativePath
                };
                
                if (entry.isDirectory()) {
                    item.children = await this.scanDirectory(fullPath, itemRelativePath);
                } else if (entry.isFile()) {
                    // Read content for text files
                    const ext = path.extname(entry.name).toLowerCase();
                    if (this.textExtensions.includes(ext) || ext === '' || stats.size < this.maxFileSize) {
                        try {
                            item.content = await this.readFileWithEncoding(fullPath);
                        } catch (error) {
                            console.warn(`Could not read file content: ${fullPath}`, error);
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
     * Read file with proper encoding detection and fallback
     */
    private async readFileWithEncoding(filePath: string): Promise<string> {
        try {
            // First try UTF-8
            const content = await fs.readFile(filePath, 'utf-8');
            
            // Check if content has encoding issues (common with Spanish characters)
            if (content.includes('Ã') || content.includes('â€') || content.includes('ðŸ')) {
                console.warn(`[UnifiedFileManager] Detected encoding issues in file: ${filePath}, attempting to fix...`);
                
                // Try reading as buffer and decode with different encodings
                const buffer = await fs.readFile(filePath);
                
                // Try different encodings
                const encodings = ['utf8', 'latin1', 'cp1252', 'iso-8859-1'];
                
                for (const encoding of encodings) {
                    try {
                        const decoded = buffer.toString(encoding);
                        // Check if this encoding produces better results
                        if (!decoded.includes('Ã') && !decoded.includes('â€') && !decoded.includes('ðŸ')) {
                            console.log(`[UnifiedFileManager] Fixed encoding for ${filePath} using ${encoding}`);
                            return decoded;
                        }
                    } catch (e) {
                        continue;
                    }
                }
                
                // If all else fails, try to fix common encoding issues
                return this.fixCommonEncodingIssues(content);
            }
            
            return content;
        } catch (error) {
            console.error(`[UnifiedFileManager] Error reading file with encoding: ${filePath}`, error);
            throw error;
        }
    }

    /**
     * Fix common encoding issues in Spanish text
     */
    private fixCommonEncodingIssues(content: string): string {
        // Common encoding fixes for Spanish characters
        const encodingFixes: { [key: string]: string } = {
            'Ã¡': 'á', 'Ã©': 'é', 'Ã­': 'í', 'Ã³': 'ó', 'Ãº': 'ú', 'Ã±': 'ñ',
            'Ã€': 'À', 'Ã': 'È', 'Ã': 'Ì', 'Ã': 'Ò', 'Ã': 'Ù', 'Ã': 'Ñ',
            'Ã¢': 'â', 'Ãª': 'ê', 'Ã®': 'î', 'Ã´': 'ô', 'Ã»': 'û',
            'Ãƒ': 'ã', 'Ãµ': 'õ', 'Ã§': 'ç',
            'â€œ': '"', 'â€': '"', 'â€™': "'", 'â€˜': "'",
            'â€"': '—', 'â€"': '–', 'â€¦': '…',
            'ðŸ§': '🧠', 'ðŸ"': '✍️', 'ðŸ"': '❓', 'ðŸ¥': '🛠️',
            'ðŸ§': '🧪', 'ðŸ"': '💬', 'ðŸ"': '📌', 'ðŸ"': '📍',
            'ðŸ"': '✅', 'ðŸ"': '✒️'
        };

        let fixedContent = content;
        for (const [wrong, correct] of Object.entries(encodingFixes)) {
            fixedContent = fixedContent.replace(new RegExp(wrong, 'g'), correct);
        }

        return fixedContent;
    }

    private calculateStats(items: FileItem[]): ProjectStructure['stats'] {
        let totalFiles = 0;
        let totalFolders = 0;
        let totalWords = 0;
        let totalCharacters = 0;
        const fileTypes: Record<string, number> = {};
        
        const processItem = (item: FileItem) => {
            if (item.type === 'folder') {
                totalFolders++;
                if (item.children) {
                    item.children.forEach(processItem);
                }
            } else {
                totalFiles++;
                const ext = path.extname(item.name).toLowerCase();
                fileTypes[ext] = (fileTypes[ext] || 0) + 1;
                
                if (item.content) {
                    totalCharacters += item.content.length;
                    totalWords += item.content.split(/\s+/).filter(word => word.length > 0).length;
                }
            }
        };
        
        items.forEach(processItem);
        
        return {
            totalFiles,
            totalFolders,
            totalWords,
            totalCharacters,
            fileTypes
        };
    }
}

// Export singleton instance
export const unifiedFileManager = new UnifiedFileManager(
    path.resolve(process.cwd(), '..', 'GHOST_Proyectos')
); 