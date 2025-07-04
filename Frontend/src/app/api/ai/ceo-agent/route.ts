// Todas las respuestas están en español por defecto y generadas por Ollama.
import { NextResponse } from 'next/server';
import { readFile, readdir, stat } from 'fs/promises';
import { join } from 'path';
import { NextRequest } from 'next/server';

// Project context types
interface ProjectContext {
  id: string;
  title: string;
  type: 'book' | 'script' | 'blog';
  path: string;
}

interface ProjectContent {
  id: string;
  title: string;
  type: string;
  content: string;
  structure?: any;
  metadata?: any;
}

// Function to read project content based on type (copied from context API)
async function getProjectContent(project: ProjectContext): Promise<ProjectContent> {
  const projectPath = join(process.cwd(), '..', project.path);
  
  try {
    // Check if project directory exists
    const projectStats = await stat(projectPath);
    if (!projectStats.isDirectory()) {
      throw new Error('Project path is not a directory');
    }

    let content = '';
    let structure = null;
    let metadata = null;

    // Helper function to recursively find content files
    async function findContentFiles(dirPath: string): Promise<string[]> {
      const files = await readdir(dirPath);
      const contentFiles: string[] = [];
      
      for (const file of files) {
        const filePath = join(dirPath, file);
        const fileStats = await stat(filePath);
        
        if (fileStats.isDirectory()) {
          // Recursively search subdirectories
          const subFiles = await findContentFiles(filePath);
          contentFiles.push(...subFiles);
        } else {
          // Check if it's a content file (markdown, text, or no extension)
          const isMarkdown = file.endsWith('.md');
          const isText = file.endsWith('.txt');
          const hasNoExtension = !file.includes('.');
          const isContentFile = isMarkdown || isText || hasNoExtension;
          
          if (isContentFile && !file.startsWith('.')) {
            contentFiles.push(filePath);
          }
        }
      }
      
      return contentFiles;
    }

    switch (project.type) {
      case 'book':
        // For books, try to read content files
        try {
          // First try content.md
          const contentFile = join(projectPath, 'content.md');
          content = await readFile(contentFile, 'utf-8');
        } catch {
          // If no content.md, search for content files recursively
          const contentFiles = await findContentFiles(projectPath);
          
          if (contentFiles.length > 0) {
            // Read all content files
            for (const filePath of contentFiles) {
              try {
                const fileContent = await readFile(filePath, 'utf-8');
                const fileName = filePath.split('/').pop() || filePath.split('\\').pop() || 'Unknown';
                content += `\n\n## ${fileName}\n${fileContent}`;
              } catch (fileError) {
                console.warn(`Could not read file: ${filePath}`, fileError);
              }
            }
          }
        }

        // Try to read structure if it exists
        try {
          const structureFile = join(projectPath, 'structure.json');
          const structureContent = await readFile(structureFile, 'utf-8');
          structure = JSON.parse(structureContent);
        } catch {
          // Structure file doesn't exist, that's okay
        }
        break;

      case 'script':
        // For scripts, try to read script files
        try {
          const scriptFile = join(projectPath, 'script.md');
          content = await readFile(scriptFile, 'utf-8');
        } catch {
          // Search for content files recursively
          const contentFiles = await findContentFiles(projectPath);
          
          if (contentFiles.length > 0) {
            const filePath = contentFiles[0];
            content = await readFile(filePath, 'utf-8');
          }
        }
        break;

      case 'blog':
        // For blogs, try to read blog files
        try {
          const blogFile = join(projectPath, 'post.md');
          content = await readFile(blogFile, 'utf-8');
        } catch {
          // Search for content files recursively
          const contentFiles = await findContentFiles(projectPath);
          
          if (contentFiles.length > 0) {
            const filePath = contentFiles[0];
            content = await readFile(filePath, 'utf-8');
          }
        }
        break;

      default:
        // For unknown types, search for content files recursively
        const contentFiles = await findContentFiles(projectPath);
        
        for (const filePath of contentFiles) {
          try {
            const fileContent = await readFile(filePath, 'utf-8');
            const fileName = filePath.split('/').pop() || filePath.split('\\').pop() || 'Unknown';
            content += `\n\n## ${fileName}\n${fileContent}`;
          } catch (fileError) {
            console.warn(`Could not read file: ${filePath}`, fileError);
          }
        }
    }

    // Try to read metadata if it exists
    try {
      const metadataFile = join(projectPath, 'metadata.json');
      const metadataContent = await readFile(metadataFile, 'utf-8');
      metadata = JSON.parse(metadataContent);
    } catch {
      // Metadata file doesn't exist, that's okay
    }

    return {
      id: project.id,
      title: project.title,
      type: project.type,
      content: content || 'No content found for this project.',
      structure,
      metadata
    };

  } catch (error) {
    console.error(`Error reading project content for ${project.id}:`, error);
    return {
      id: project.id,
      title: project.title,
      type: project.type,
      content: `Error reading project content: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();
    
    console.log('=== CEO AGENT: Processing request ===');
    console.log('Message:', message);
    console.log('Context:', context);

    let contextContent = '';
    
    // Get project context if provided
    if (context?.path) {
      try {
        const contextUrl = context.specificFile 
          ? `/api/projects/context?path=${encodeURIComponent(context.path)}&file=${encodeURIComponent(context.specificFile)}`
          : `/api/projects/context?path=${encodeURIComponent(context.path)}`;
        
        console.log('Fetching context from:', contextUrl);
        
        const contextResponse = await fetch(`${request.nextUrl.origin}${contextUrl}`);
        if (contextResponse.ok) {
          const contextData = await contextResponse.json();
          contextContent = contextData.data.content;
          console.log('Context loaded successfully, length:', contextContent.length);
        } else {
          console.error('Failed to fetch context:', contextResponse.status);
        }
      } catch (error) {
        console.error('Error fetching context:', error);
      }
    }

        // Preparar el prompt para Ollama
        const messages = [
            { 
                role: 'system', 
                content: `Eres un CEO experto en estrategia y liderazgo que responde siempre en español.

REGLAS CRÍTICAS OBLIGATORIAS:
1. SOLO puedes usar la información del contexto proporcionado
2. NUNCA inventes información
3. Si te preguntan sobre algo del contexto, busca esa información específica en el texto
4. Si no encuentras la información, responde "No encuentro esa información en el contexto"
5. Cuando te den el texto exacto a buscar, confirma que lo ves en el contexto

IMPORTANTE: El contexto es tu ÚNICA fuente de información. No uses conocimiento previo.

EJEMPLO: Si te preguntan "¿Cuál es el tip 9?" y en el contexto dice "9. Dale contexto, obtendrás inteligencia - Usa contexto para transformar respuestas genéricas en específicas", debes responder SOLO con la descripción: "Usa contexto para transformar respuestas genéricas en específicas".`
            }
        ];

        if (contextContent) {
            messages.push({
                role: 'system',
                content: `CONTEXTO DEL PROYECTO - INFORMACIÓN VÁLIDA:

${contextContent}

IMPORTANTE: Solo puedes usar la información de arriba para responder. No inventes nada.`
            });
        }

        messages.push({ role: 'user', content: message });

        console.log('=== Sending to Ollama ===');
        console.log('Messages:', JSON.stringify(messages, null, 2));

        // Llamar a la API de Ollama
        const ollamaResponse = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
            model: 'llama2:13b',
            stream: false,
            messages: messages
        }),
        });

        if (!ollamaResponse.ok) {
            throw new Error('Error al comunicarse con Ollama');
        }

        const data = await ollamaResponse.json();
        const aiResponse = data.message?.content || 'No se recibió respuesta del modelo.';

        return NextResponse.json({ response: aiResponse });
    } catch (error) {
        console.error('Error en la ruta ceo-agent:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

async function simulateCEOAgentResponse(message: string): Promise<string> {
    // Simular tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Lógica básica de respuesta según el contenido del mensaje
    if (message.toLowerCase().includes('estrategia')) {
        return `Como CEO, mi consejo estratégico es:
- Concéntrate en tus fortalezas principales
- Monitorea las tendencias del mercado
- Fomenta la innovación
- Empodera a tu equipo

¿Quieres un plan detallado?`;
    }

    if (message.toLowerCase().includes('reporte')) {
        return `Puedo generar reportes ejecutivos. Por favor, especifica el tipo de reporte que necesitas (financiero, operativo, equipo, etc.).`;
    }

    // Respuesta por defecto
    return `El Agente CEO recibió: "${message.slice(0, 40)}...". ¿Cómo puedo ayudarte?`;
} 