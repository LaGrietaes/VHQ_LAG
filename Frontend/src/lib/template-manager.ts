export interface TemplateFile {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  type: 'template' | 'sample' | 'example' | 'guide';
  category: string;
  content: string;
  variables: string[];
  language: 'es' | 'en' | 'both';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  usage: number;
  rating?: number;
}

export interface TemplateCollection {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  category: string;
  templates: TemplateFile[];
  metadata: {
    totalTemplates: number;
    lastUpdated: string;
    version: string;
    author: string;
  };
}

export interface TemplateVariable {
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  defaultValue?: string;
  required: boolean;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

export class TemplateManager {
  private static instance: TemplateManager;
  private templates: Map<string, TemplateFile> = new Map();
  private collections: Map<string, TemplateCollection> = new Map();
  private variables: Map<string, TemplateVariable> = new Map();

  static getInstance(): TemplateManager {
    if (!TemplateManager.instance) {
      TemplateManager.instance = new TemplateManager();
    }
    return TemplateManager.instance;
  }

  // Template Management
  async loadTemplatesFromProject(projectPath: string): Promise<TemplateFile[]> {
    try {
      const response = await fetch(`/api/templates/project?projectPath=${encodeURIComponent(projectPath)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          data.templates.forEach((template: TemplateFile) => {
            this.templates.set(template.id, template);
          });
          return data.templates;
        }
      }
      return [];
    } catch (error) {
      console.error('Error loading templates from project:', error);
      return [];
    }
  }

  async loadTemplatesFromGlobal(): Promise<TemplateFile[]> {
    try {
      const response = await fetch('/api/templates/global');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          data.templates.forEach((template: TemplateFile) => {
            this.templates.set(template.id, template);
          });
          return data.templates;
        }
      }
      return [];
    } catch (error) {
      console.error('Error loading global templates:', error);
      return [];
    }
  }

  async saveTemplate(template: TemplateFile): Promise<boolean> {
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          this.templates.set(template.id, template);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error saving template:', error);
      return false;
    }
  }

  async updateTemplate(templateId: string, updates: Partial<TemplateFile>): Promise<boolean> {
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const existing = this.templates.get(templateId);
          if (existing) {
            this.templates.set(templateId, { ...existing, ...updates });
          }
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error updating template:', error);
      return false;
    }
  }

  async deleteTemplate(templateId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        this.templates.delete(templateId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting template:', error);
      return false;
    }
  }

  // Template Retrieval
  getTemplate(templateId: string): TemplateFile | undefined {
    return this.templates.get(templateId);
  }

  getTemplatesByType(type: string): TemplateFile[] {
    return Array.from(this.templates.values()).filter(t => t.type === type);
  }

  getTemplatesByCategory(category: string): TemplateFile[] {
    return Array.from(this.templates.values()).filter(t => t.category === category);
  }

  getTemplatesByLanguage(language: string): TemplateFile[] {
    return Array.from(this.templates.values()).filter(t => 
      t.language === language || t.language === 'both'
    );
  }

  searchTemplates(query: string): TemplateFile[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.templates.values()).filter(t => 
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // Template Processing
  processTemplate(templateId: string, variables: Record<string, string>): string {
    const template = this.getTemplate(templateId);
    if (!template) return '';

    let content = template.content;
    
    // Replace variables
    for (const [key, value] of Object.entries(variables)) {
      content = content.replace(new RegExp(`{${key}}`, 'g'), value);
    }

    // Replace common placeholders
    const commonReplacements: Record<string, string> = {
      '{date}': new Date().toLocaleDateString(),
      '{timestamp}': new Date().toISOString(),
      '{year}': new Date().getFullYear().toString(),
      '{month}': (new Date().getMonth() + 1).toString(),
      '{day}': new Date().getDate().toString()
    };

    for (const [placeholder, value] of Object.entries(commonReplacements)) {
      content = content.replace(new RegExp(placeholder, 'g'), value);
    }

    return content;
  }

  // Variable Management
  getTemplateVariables(templateId: string): TemplateVariable[] {
    const template = this.getTemplate(templateId);
    if (!template) return [];

    return template.variables.map(varName => {
      const variable = this.variables.get(varName);
      return variable || {
        name: varName,
        description: `Variable: ${varName}`,
        type: 'string',
        required: false
      };
    });
  }

  // Collection Management
  async loadCollections(): Promise<TemplateCollection[]> {
    try {
      const response = await fetch('/api/templates/collections');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          data.collections.forEach((collection: TemplateCollection) => {
            this.collections.set(collection.id, collection);
          });
          return data.collections;
        }
      }
      return [];
    } catch (error) {
      console.error('Error loading collections:', error);
      return [];
    }
  }

  getCollection(collectionId: string): TemplateCollection | undefined {
    return this.collections.get(collectionId);
  }

  getAllCollections(): TemplateCollection[] {
    return Array.from(this.collections.values());
  }

  // Utility Methods
  extractVariables(content: string): string[] {
    const variableRegex = /\{([^}]+)\}/g;
    const variables = new Set<string>();
    let match;

    while ((match = variableRegex.exec(content)) !== null) {
      variables.add(match[1]);
    }

    return Array.from(variables);
  }

  validateTemplate(template: TemplateFile): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!template.name || template.name.trim().length === 0) {
      errors.push('Template name is required');
    }

    if (!template.content || template.content.trim().length === 0) {
      errors.push('Template content is required');
    }

    if (!template.type) {
      errors.push('Template type is required');
    }

    if (!template.category) {
      errors.push('Template category is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Statistics
  getTemplateStats(): {
    total: number;
    byType: Record<string, number>;
    byCategory: Record<string, number>;
    byLanguage: Record<string, number>;
  } {
    const templates = Array.from(this.templates.values());
    const stats = {
      total: templates.length,
      byType: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      byLanguage: {} as Record<string, number>
    };

    templates.forEach(template => {
      stats.byType[template.type] = (stats.byType[template.type] || 0) + 1;
      stats.byCategory[template.category] = (stats.byCategory[template.category] || 0) + 1;
      stats.byLanguage[template.language] = (stats.byLanguage[template.language] || 0) + 1;
    });

    return stats;
  }
}

export default TemplateManager; 