import { readFile, readdir, stat } from 'fs/promises';
import { join } from 'path';

// Book type definitions
export interface BookType {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  templateFiles: string[];
  structure: BookStructure;
  language: 'es' | 'en' | 'both';
  categories: string[];
}

export interface BookStructure {
  folders: string[];
  defaultFiles: string[];
  chapterTemplate?: string;
  sectionTemplate?: string;
}

export interface TipDefinition {
  id: number;
  title: string;
  titleEn?: string;
  category: string;
  categoryEn?: string;
  description: string;
  descriptionEn?: string;
  level: 'basic' | 'intermediate' | 'advanced';
  template?: string;
}

export interface ProjectContext {
  projectPath: string;
  projectName: string;
  bookType: BookType;
  sampleFiles: Record<string, string>;
  currentStructure: ProjectStructure;
  availableTips?: TipDefinition[];
  language: 'es' | 'en' | 'both';
  metadata: ProjectMetadata;
}

export interface ProjectStructure {
  files: ProjectFile[];
  folders: ProjectFolder[];
  totalFiles: number;
  totalFolders: number;
  totalWords: number;
  totalCharacters: number;
}

export interface ProjectFile {
  name: string;
  path: string;
  size: number;
  lastModified: Date;
  content?: string;
  wordCount?: number;
}

export interface ProjectFolder {
  name: string;
  path: string;
  fileCount: number;
  folderCount: number;
}

export interface ProjectMetadata {
  createdAt: Date;
  lastModified: Date;
  bookType: string;
  language: string;
  progress: {
    chapters: number;
    sections: number;
    words: number;
    completion: number;
  };
}

// Predefined book types
export const BOOK_TYPES: Record<string, BookType> = {
  'tips_book': {
    id: 'tips_book',
    name: 'Libro de Tips',
    nameEn: 'Tips Book',
    description: 'Libro estructurado con consejos y tips prácticos',
    descriptionEn: 'Structured book with practical tips and advice',
    templateFiles: ['tip_template.md', 'tips_list.md', 'chapter_template.md'],
    structure: {
      folders: ['Capítulos', 'Secciones', 'Ejemplos e Ideas', 'Generated_Content', 'Recursos'],
      defaultFiles: ['README.md', 'outline.md', 'metadata.json'],
      chapterTemplate: 'chapter_template.md',
      sectionTemplate: 'section_template.md'
    },
    language: 'both',
    categories: ['tips', 'how-to', 'practical']
  },
  'guide_book': {
    id: 'guide_book',
    name: 'Guía Práctica',
    nameEn: 'Practical Guide',
    description: 'Guía paso a paso con instrucciones detalladas',
    descriptionEn: 'Step-by-step guide with detailed instructions',
    templateFiles: ['guide_template.md', 'step_template.md', 'example_template.md'],
    structure: {
      folders: ['Introducción', 'Pasos', 'Ejemplos', 'Recursos', 'Apéndices'],
      defaultFiles: ['README.md', 'introduction.md', 'steps.md'],
      chapterTemplate: 'guide_chapter_template.md',
      sectionTemplate: 'guide_section_template.md'
    },
    language: 'both',
    categories: ['guide', 'tutorial', 'instructional']
  },
  'story_book': {
    id: 'story_book',
    name: 'Libro de Historias',
    nameEn: 'Story Book',
    description: 'Colección de historias y narrativas',
    descriptionEn: 'Collection of stories and narratives',
    templateFiles: ['story_template.md', 'character_template.md', 'plot_template.md'],
    structure: {
      folders: ['Historias', 'Personajes', 'Escenarios', 'Ilustraciones', 'Notas'],
      defaultFiles: ['README.md', 'characters.md', 'settings.md'],
      chapterTemplate: 'story_chapter_template.md',
      sectionTemplate: 'story_section_template.md'
    },
    language: 'both',
    categories: ['fiction', 'narrative', 'creative']
  },
  'technical_book': {
    id: 'technical_book',
    name: 'Libro Técnico',
    nameEn: 'Technical Book',
    description: 'Documentación técnica y manuales',
    descriptionEn: 'Technical documentation and manuals',
    templateFiles: ['technical_template.md', 'code_template.md', 'diagram_template.md'],
    structure: {
      folders: ['Conceptos', 'Implementación', 'Ejemplos', 'Referencias', 'Apéndices'],
      defaultFiles: ['README.md', 'concepts.md', 'implementation.md'],
      chapterTemplate: 'technical_chapter_template.md',
      sectionTemplate: 'technical_section_template.md'
    },
    language: 'both',
    categories: ['technical', 'documentation', 'reference']
  }
};

export class ProjectContextLoader {
  private static instance: ProjectContextLoader;
  private cache: Map<string, ProjectContext> = new Map();

  static getInstance(): ProjectContextLoader {
    if (!ProjectContextLoader.instance) {
      ProjectContextLoader.instance = new ProjectContextLoader();
    }
    return ProjectContextLoader.instance;
  }

  async loadProjectContext(projectPath: string, language: 'es' | 'en' | 'both' = 'both'): Promise<ProjectContext> {
    const cacheKey = `${projectPath}_${language}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const fullProjectPath = join(process.cwd(), '..', projectPath);
      
      // Detect book type based on project structure
      const bookType = await this.detectBookType(fullProjectPath);
      
      // Load sample files
      const sampleFiles = await this.loadSampleFiles(fullProjectPath, bookType);
      
      // Get current project structure
      const currentStructure = await this.getProjectStructure(fullProjectPath);
      
      // Load tips if it's a tips book
      let availableTips: TipDefinition[] | undefined;
      if (bookType.id === 'tips_book' && sampleFiles['tips_list.md']) {
        try {
          availableTips = await this.loadTipsFromFile(sampleFiles['tips_list.md']);
        } catch (error) {
          console.warn('Could not load tips from file:', error);
          availableTips = [];
        }
      }

      const projectName = projectPath.split('/').pop() || 'Unknown Project';
      
      const metadata = await this.generateMetadata(fullProjectPath, bookType, currentStructure);
      
      const context: ProjectContext = {
        projectPath,
        projectName,
        bookType,
        sampleFiles,
        currentStructure: currentStructure || { 
          files: [], 
          folders: [], 
          totalFiles: 0, 
          totalFolders: 0, 
          totalWords: 0, 
          totalCharacters: 0 
        },
        availableTips,
        language,
        metadata: metadata || { 
          createdAt: new Date(), 
          lastModified: new Date(), 
          bookType: bookType.id, 
          language: bookType.language, 
          progress: { chapters: 0, sections: 0, words: 0, completion: 0 } 
        }
      };

      this.cache.set(cacheKey, context);
      return context;

    } catch (error) {
      console.error('Error loading project context:', error);
      throw new Error(`Failed to load project context: ${error}`);
    }
  }

  private async detectBookType(projectPath: string): Promise<BookType> {
    try {
      const files = await readdir(projectPath);
      
      // Check for tips book indicators
      if (files.some(f => f.includes('Tips') || f.includes('tips'))) {
        return BOOK_TYPES.tips_book;
      }
      
      // Check for guide indicators
      if (files.some(f => f.includes('Guía') || f.includes('Guide') || f.includes('Manual'))) {
        return BOOK_TYPES.guide_book;
      }
      
      // Check for story indicators
      if (files.some(f => f.includes('Historia') || f.includes('Story') || f.includes('Narrativa'))) {
        return BOOK_TYPES.story_book;
      }
      
      // Check for technical indicators
      if (files.some(f => f.includes('Técnico') || f.includes('Technical') || f.includes('API'))) {
        return BOOK_TYPES.technical_book;
      }
      
      // Default to tips book
      return BOOK_TYPES.tips_book;
    } catch (error) {
      console.warn('Could not detect book type, using default:', error);
      return BOOK_TYPES.tips_book;
    }
  }

  private async loadSampleFiles(projectPath: string, bookType: BookType): Promise<Record<string, string>> {
    const sampleFiles: Record<string, string> = {};
    
    try {
      // Load template files
      for (const templateFile of bookType.templateFiles) {
        try {
          const filePath = join(projectPath, templateFile);
          const content = await readFile(filePath, 'utf-8');
          sampleFiles[templateFile] = content;
        } catch (error) {
          console.warn(`Could not load template file ${templateFile}:`, error);
        }
      }

      // Load existing sample files
      const files = await readdir(projectPath);
      for (const file of files) {
        if (file.endsWith('.md') && !sampleFiles[file]) {
          try {
            const filePath = join(projectPath, file);
            const content = await readFile(filePath, 'utf-8');
            sampleFiles[file] = content;
          } catch (error) {
            console.warn(`Could not load sample file ${file}:`, error);
          }
        }
      }

    } catch (error) {
      console.error('Error loading sample files:', error);
    }

    return sampleFiles;
  }

  private async getProjectStructure(projectPath: string): Promise<ProjectStructure> {
    const files: ProjectFile[] = [];
    const folders: ProjectFolder[] = [];
    let totalWords = 0;
    let totalCharacters = 0;

    try {
      await this.scanDirectory(projectPath, '', files, folders);
      
      // Calculate totals
      for (const file of files) {
        if (file.content) {
          const words = file.content.split(/\s+/).length;
          const chars = file.content.length;
          file.wordCount = words;
          totalWords += words;
          totalCharacters += chars;
        }
      }

    } catch (error) {
      console.error('Error scanning project structure:', error);
    }

    return {
      files,
      folders,
      totalFiles: files.length,
      totalFolders: folders.length,
      totalWords,
      totalCharacters
    };
  }

  private async scanDirectory(
    dirPath: string, 
    relativePath: string, 
    files: ProjectFile[], 
    folders: ProjectFolder[]
  ): Promise<void> {
    const items = await readdir(dirPath);
    
    for (const item of items) {
      if (item.startsWith('.')) continue;
      
      const itemPath = join(dirPath, item);
      const relativeItemPath = relativePath ? join(relativePath, item) : item;
      const stats = await stat(itemPath);
      
      if (stats.isDirectory()) {
        const subFiles: ProjectFile[] = [];
        const subFolders: ProjectFolder[] = [];
        await this.scanDirectory(itemPath, relativeItemPath, subFiles, subFolders);
        
        folders.push({
          name: item,
          path: relativeItemPath,
          fileCount: subFiles.length,
          folderCount: subFolders.length
        });
        
        files.push(...subFiles);
        folders.push(...subFolders);
      } else {
        try {
          const content = await readFile(itemPath, 'utf-8');
          files.push({
            name: item,
            path: relativeItemPath,
            size: stats.size,
            lastModified: stats.mtime,
            content,
            wordCount: content.split(/\s+/).length
          });
        } catch (error) {
          console.warn(`Could not read file ${itemPath}:`, error);
        }
      }
    }
  }

  private async loadTipsFromFile(tipsContent: string): Promise<TipDefinition[]> {
    const tips: TipDefinition[] = [];
    
    try {
      const lines = tipsContent.split('\n');
      let currentTip: Partial<TipDefinition> = {};
      let tipId = 1;

      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Look for tip patterns
        const tipMatch = trimmedLine.match(/^(\d+)\.\s*\*\*(.+?)\*\*:\s*(.+)/);
        if (tipMatch) {
          if (currentTip.title) {
            tips.push(currentTip as TipDefinition);
          }
          
          currentTip = {
            id: tipId++,
            title: tipMatch[2].trim(),
            description: tipMatch[3].trim(),
            level: 'basic',
            category: 'General'
          };
        }
        
        // Look for category headers
        const categoryMatch = trimmedLine.match(/^##\s*Categoría:\s*(.+)/);
        if (categoryMatch && currentTip.title) {
          currentTip.category = categoryMatch[1].trim();
        }
      }
      
      // Add the last tip
      if (currentTip.title) {
        tips.push(currentTip as TipDefinition);
      }

    } catch (error) {
      console.error('Error parsing tips from file:', error);
    }

    return tips;
  }

  private async generateMetadata(
    projectPath: string, 
    bookType: BookType, 
    structure: ProjectStructure
  ): Promise<ProjectMetadata> {
    const stats = await stat(projectPath);
    
    return {
      createdAt: stats.birthtime,
      lastModified: stats.mtime,
      bookType: bookType.id,
      language: bookType.language,
      progress: {
        chapters: structure.folders.filter(f => f.name.includes('Capítulo') || f.name.includes('Chapter')).length,
        sections: structure.files.filter(f => f.name.includes('Sección') || f.name.includes('Section')).length,
        words: structure.totalWords,
        completion: Math.min(100, Math.round((structure.totalWords / 10000) * 100)) // Estimate based on 10k words target
      }
    };
  }

  // Clear cache for a specific project
  clearCache(projectPath?: string): void {
    if (projectPath) {
      const keysToDelete = Array.from(this.cache.keys()).filter(key => key.startsWith(projectPath));
      keysToDelete.forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }

  // Get available book types
  getAvailableBookTypes(): BookType[] {
    return Object.values(BOOK_TYPES);
  }

  // Create new book type
  createBookType(bookType: Omit<BookType, 'id'>): BookType {
    const id = bookType.name.toLowerCase().replace(/\s+/g, '_');
    const newBookType: BookType = { ...bookType, id };
    BOOK_TYPES[id] = newBookType;
    return newBookType;
  }
}

export default ProjectContextLoader; 