import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// For now, we'll use OpenAI directly. Later this can be routed through the Python agent
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GHOST_RULES_PATH = path.resolve(process.cwd(), '..', '15_GHOST_LAG', 'GHOST_Reglas.md');

// Load Ghost Agent personality and rules
const loadGhostRules = (): string => {
    try {
        if (fs.existsSync(GHOST_RULES_PATH)) {
            return fs.readFileSync(GHOST_RULES_PATH, 'utf-8');
        }
    } catch (error) {
        console.warn('Could not load GHOST_Reglas.md, using default rules');
    }
    
    // Fallback rules if file not found
    return `
## GHOST Writing Rules
- Write with clarity and purpose
- Engage from the first line
- Use structured, modular approach
- Adapt tone to target audience
- Prioritize comprehension over style
    `.trim();
};

const buildPrompt = (userPrompt: string, contentType: string, style: string, length: number): string => {
    const ghostRules = loadGhostRules();
    
    const basePrompt = `You are GHOST_LAG, a professional AI writing assistant. Your personality and rules:

${ghostRules}

TASK: Generate ${contentType} content based on the following request:
"${userPrompt}"

REQUIREMENTS:
- Content Type: ${contentType}
- Style: ${style}
- Target Length: approximately ${length} words
- Language: Spanish (unless otherwise specified)
- Format: Markdown

Follow your personality guidelines and create engaging, well-structured content.`;

    return basePrompt;
};

const generateWithOpenAI = async (prompt: string, maxTokens: number): Promise<string> => {
    if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are GHOST_LAG, a professional AI writing assistant specialized in long-form content creation.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: Math.min(maxTokens, 4000),
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
};

// Fallback content generation for when OpenAI is not available
const generateFallbackContent = (userPrompt: string, contentType: string, style: string, length: number): string => {
    const timestamp = new Date().toISOString();
    
    return `# Contenido Generado por GHOST_LAG

## Solicitud del Usuario
${userPrompt}

## Tipo de Contenido
${contentType}

## Estilo Solicitado
${style}

---

**Nota**: Este es contenido de demostración generado por el sistema GHOST_LAG. 

La integración completa con IA está en desarrollo. Una vez configurada la API de OpenAI o el modelo local, este contenido será reemplazado por generación inteligente real que seguirá las reglas definidas en GHOST_Reglas.md.

### Características del Sistema GHOST_LAG:
- Generación de textos largos (libros, guiones, blogs)
- Coordinación con PSICO_LAG para análisis emocional
- Integración con SEO_LAG para optimización
- Seguimiento de reglas de escritura personalizadas
- Soporte para múltiples formatos y estilos

### Próximos Pasos:
1. Configurar API de OpenAI o modelo local
2. Implementar análisis de contenido
3. Integrar con otros agentes del sistema
4. Añadir plantillas personalizadas

*Generado el ${timestamp}*
*Longitud objetivo: ${length} palabras*`;
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { 
            prompt, 
            contentType = 'general', 
            style = 'professional', 
            length = 1000,
            projectContext = null 
        } = body;

        if (!prompt) {
            return NextResponse.json({ message: 'Prompt is required' }, { status: 400 });
        }

        // Build the enhanced prompt
        const enhancedPrompt = buildPrompt(prompt, contentType, style, length);
        
        let generatedContent: string;
        let usingAI = false;

        try {
            // Try to generate with OpenAI first
            const maxTokens = Math.ceil(length * 1.5); // Estimate tokens needed
            generatedContent = await generateWithOpenAI(enhancedPrompt, maxTokens);
            usingAI = true;
        } catch (error) {
            console.warn('OpenAI generation failed, using fallback:', error);
            // Fall back to demo content
            generatedContent = generateFallbackContent(prompt, contentType, style, length);
        }

        // Basic content analysis
        const wordCount = generatedContent.split(/\s+/).length;
        const characterCount = generatedContent.length;
        const estimatedReadingTime = Math.ceil(wordCount / 200); // ~200 words per minute

        return NextResponse.json({
            success: true,
            content: generatedContent,
            metadata: {
                wordCount,
                characterCount,
                estimatedReadingTime,
                contentType,
                style,
                requestedLength: length,
                usingAI,
                generatedAt: new Date().toISOString()
            }
        });

    } catch (error: any) {
        console.error('[API/generate-content] Error:', error);
        return NextResponse.json({ 
            message: 'Failed to generate content', 
            details: error.message 
        }, { status: 500 });
    }
} 