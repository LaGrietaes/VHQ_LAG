import { BookType, ProjectContext, TipDefinition } from './project-context-loader';

export interface QuickAction {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
  action: 'generate_tip' | 'generate_chapter' | 'organize_workspace' | 'create_outline' | 'generate_content' | 'create_section';
  requiresContext: boolean;
  applicableBookTypes: string[];
  promptTemplate: string;
  promptTemplateEn: string;
  color: string;
  category: 'content' | 'structure' | 'organization' | 'generation';
}

export interface QuickActionResult {
  success: boolean;
  message: string;
  messageEn: string;
  filesCreated?: string[];
  errors?: string[];
  data?: any;
}

export class QuickActionsManager {
  private static instance: QuickActionsManager;
  private actions: Map<string, QuickAction> = new Map();

  static getInstance(): QuickActionsManager {
    if (!QuickActionsManager.instance) {
      QuickActionsManager.instance = new QuickActionsManager();
      QuickActionsManager.instance.initializeDefaultActions();
    }
    return QuickActionsManager.instance;
  }

  private initializeDefaultActions(): void {
    const defaultActions: QuickAction[] = [
      {
        id: 'generate_tip',
        name: 'Generar Tip',
        nameEn: 'Generate Tip',
        description: 'Crea un nuevo tip siguiendo el formato del proyecto',
        descriptionEn: 'Create a new tip following the project format',
        icon: '💡',
        action: 'generate_tip',
        requiresContext: true,
        applicableBookTypes: ['tips_book'],
        promptTemplate: `Crea un nuevo tip para el libro siguiendo el formato del archivo de ejemplo. 
        El tip debe ser práctico, útil y bien estructurado. 
        Usa el formato === FILE_OPERATION === para crear el archivo.
        
        Contexto del proyecto: {projectName}
        Tipo de libro: {bookType}
        Idioma: {language}`,
        promptTemplateEn: `Create a new tip for the book following the example file format.
        The tip should be practical, useful and well structured.
        Use the === FILE_OPERATION === format to create the file.
        
        Project context: {projectName}
        Book type: {bookType}
        Language: {language}`,
        color: 'green',
        category: 'content'
      },
      {
        id: 'generate_chapter',
        name: 'Generar Capítulo',
        nameEn: 'Generate Chapter',
        description: 'Crea un nuevo capítulo completo',
        descriptionEn: 'Create a complete new chapter',
        icon: '📖',
        action: 'generate_chapter',
        requiresContext: true,
        applicableBookTypes: ['tips_book', 'guide_book', 'story_book', 'technical_book'],
        promptTemplate: `Crea un nuevo capítulo para el libro con un tema específico y bien estructurado. 
        Incluye introducción, desarrollo y conclusiones. 
        Usa el formato === FILE_OPERATION === para crear el archivo.
        
        Contexto del proyecto: {projectName}
        Tipo de libro: {bookType}
        Idioma: {language}`,
        promptTemplateEn: `Create a new chapter for the book with a specific topic and well structured.
        Include introduction, development and conclusions.
        Use the === FILE_OPERATION === format to create the file.
        
        Project context: {projectName}
        Book type: {bookType}
        Language: {language}`,
        color: 'purple',
        category: 'content'
      },
      {
        id: 'generate_content',
        name: 'Generar Contenido',
        nameEn: 'Generate Content',
        description: 'Genera contenido basado en el contexto del proyecto',
        descriptionEn: 'Generate content based on project context',
        icon: '📄',
        action: 'generate_content',
        requiresContext: true,
        applicableBookTypes: ['tips_book', 'guide_book', 'story_book', 'technical_book'],
        promptTemplate: `Genera contenido para el libro basándote en el contexto del proyecto actual. 
        Crea secciones bien estructuradas y detalladas. 
        Usa el formato === FILE_OPERATION === para crear el archivo.
        
        Contexto del proyecto: {projectName}
        Tipo de libro: {bookType}
        Idioma: {language}`,
        promptTemplateEn: `Generate content for the book based on the current project context.
        Create well-structured and detailed sections.
        Use the === FILE_OPERATION === format to create the file.
        
        Project context: {projectName}
        Book type: {bookType}
        Language: {language}`,
        color: 'blue',
        category: 'content'
      },
      {
        id: 'create_section',
        name: 'Crear Sección',
        nameEn: 'Create Section',
        description: 'Crea una nueva sección de contenido',
        descriptionEn: 'Create a new content section',
        icon: '📝',
        action: 'create_section',
        requiresContext: true,
        applicableBookTypes: ['tips_book', 'guide_book', 'story_book', 'technical_book'],
        promptTemplate: `Crea una nueva sección de contenido para el libro. 
        La sección debe ser específica y bien organizada. 
        Usa el formato === FILE_OPERATION === para crear el archivo.
        
        Contexto del proyecto: {projectName}
        Tipo de libro: {bookType}
        Idioma: {language}`,
        promptTemplateEn: `Create a new content section for the book.
        The section should be specific and well organized.
        Use the === FILE_OPERATION === format to create the file.
        
        Project context: {projectName}
        Book type: {bookType}
        Language: {language}`,
        color: 'orange',
        category: 'content'
      },
      {
        id: 'create_outline',
        name: 'Crear Esquema',
        nameEn: 'Create Outline',
        description: 'Genera un esquema completo del libro',
        descriptionEn: 'Generate a complete book outline',
        icon: '📋',
        action: 'create_outline',
        requiresContext: true,
        applicableBookTypes: ['tips_book', 'guide_book', 'story_book', 'technical_book'],
        promptTemplate: `Crea un esquema completo y detallado para el libro. 
        Incluye todos los capítulos, secciones y subsecciones. 
        Usa el formato === FILE_OPERATION === para crear el archivo.
        
        Contexto del proyecto: {projectName}
        Tipo de libro: {bookType}
        Idioma: {language}`,
        promptTemplateEn: `Create a complete and detailed outline for the book.
        Include all chapters, sections and subsections.
        Use the === FILE_OPERATION === format to create the file.
        
        Project context: {projectName}
        Book type: {bookType}
        Language: {language}`,
        color: 'indigo',
        category: 'structure'
      },
      {
        id: 'organize_workspace',
        name: 'Organizar Workspace',
        nameEn: 'Organize Workspace',
        description: 'Organiza y estructura el workspace del proyecto',
        descriptionEn: 'Organize and structure the project workspace',
        icon: '📁',
        action: 'organize_workspace',
        requiresContext: true,
        applicableBookTypes: ['tips_book', 'guide_book', 'story_book', 'technical_book'],
        promptTemplate: `Organiza y estructura el workspace del libro. 
        Crea carpetas apropiadas y mueve archivos a sus ubicaciones correctas. 
        Usa el formato === FILE_OPERATION === para crear archivos y carpetas.
        
        Contexto del proyecto: {projectName}
        Tipo de libro: {bookType}
        Idioma: {language}`,
        promptTemplateEn: `Organize and structure the book workspace.
        Create appropriate folders and move files to their correct locations.
        Use the === FILE_OPERATION === format to create files and folders.
        
        Project context: {projectName}
        Book type: {bookType}
        Language: {language}`,
        color: 'gray',
        category: 'organization'
      }
    ];

    defaultActions.forEach(action => {
      this.actions.set(action.id, action);
    });
  }

  getAvailableActions(context: ProjectContext): QuickAction[] {
    const availableActions: QuickAction[] = [];
    
    for (const action of this.actions.values()) {
      if (action.applicableBookTypes.includes(context.bookType.id)) {
        availableActions.push(action);
      }
    }

    return availableActions.sort((a, b) => {
      const categoryOrder = { 'content': 1, 'structure': 2, 'organization': 3, 'generation': 4 };
      return categoryOrder[a.category] - categoryOrder[b.category];
    });
  }

  async executeAction(
    actionId: string, 
    context: ProjectContext, 
    additionalParams?: Record<string, any>
  ): Promise<QuickActionResult> {
    const action = this.actions.get(actionId);
    if (!action) {
      return {
        success: false,
        message: 'Acción no encontrada',
        messageEn: 'Action not found',
        errors: ['Action not found']
      };
    }

    if (action.requiresContext && !context) {
      return {
        success: false,
        message: 'Se requiere contexto del proyecto',
        messageEn: 'Project context is required',
        errors: ['Project context required']
      };
    }

    try {
      // Build prompt based on context and language
      const language = context.language === 'both' ? 'es' : context.language;
      const promptTemplate = language === 'es' ? action.promptTemplate : action.promptTemplateEn;
      
      const prompt = this.buildPrompt(promptTemplate, context, additionalParams);

      // Send to Ghost Agent
      const response = await fetch('/api/ai/ghost-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          projectPath: context.projectPath,
          contexts: [{
            path: context.projectPath,
            title: context.projectName
          }]
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        return {
          success: false,
          message: `Error: ${data.error}`,
          messageEn: `Error: ${data.error}`,
          errors: [data.error]
        };
      }

      const successMessage = language === 'es' 
        ? `Acción "${action.name}" ejecutada exitosamente`
        : `Action "${action.nameEn}" executed successfully`;

      return {
        success: true,
        message: successMessage,
        messageEn: successMessage,
        filesCreated: data.fileOperations?.map((op: any) => op.filePath).filter(Boolean) || [],
        data: data
      };

    } catch (error) {
      console.error('Error executing quick action:', error);
      return {
        success: false,
        message: `Error al ejecutar la acción: ${error}`,
        messageEn: `Error executing action: ${error}`,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  private buildPrompt(
    template: string, 
    context: ProjectContext, 
    additionalParams?: Record<string, any>
  ): string {
    let prompt = template;
    
    // Replace template variables
    const variables = {
      projectName: context.projectName,
      bookType: context.bookType.name,
      language: context.language,
      ...additionalParams
    };

    for (const [key, value] of Object.entries(variables)) {
      prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), String(value));
    }

    // Add context-specific instructions
    if (context.availableTips && context.availableTips.length > 0) {
      prompt += `\n\nTips disponibles: ${context.availableTips.length}`;
      if (additionalParams?.tipId) {
        const tip = context.availableTips.find(t => t.id === additionalParams.tipId);
        if (tip) {
          prompt += `\nTip específico a generar: ${tip.title} - ${tip.description}`;
        }
      }
    }

    return prompt;
  }

  // Add custom action
  addCustomAction(action: QuickAction): void {
    this.actions.set(action.id, action);
  }

  // Remove action
  removeAction(actionId: string): boolean {
    return this.actions.delete(actionId);
  }

  // Get action by ID
  getAction(actionId: string): QuickAction | undefined {
    return this.actions.get(actionId);
  }

  // Get all actions
  getAllActions(): QuickAction[] {
    return Array.from(this.actions.values());
  }
}

export default QuickActionsManager; 