import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GHOST_RULES_PATH = path.resolve(process.cwd(), '..', '15_GHOST_LAG', 'GHOST_Reglas.md');

const loadGhostRules = (): string => {
    try {
        if (fs.existsSync(GHOST_RULES_PATH)) {
            return fs.readFileSync(GHOST_RULES_PATH, 'utf-8');
        }
    } catch (error) {
        console.warn('Could not load GHOST_Reglas.md');
    }
    return 'Follow professional writing standards with clarity and engagement.';
};

const generateWithOpenAI = async (prompt: string): Promise<string> => {
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
                    content: 'You are GHOST_LAG, an expert writing assistant. Provide constructive, specific suggestions for improving content.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 1000,
            temperature: 0.3, // Lower temperature for more focused suggestions
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
};

const generateFallbackSuggestions = (content: string, suggestionType: string): any => {
    const wordCount = content.split(/\s+/).length;
    const timestamp = new Date().toISOString();

    const baseSuggestions = {
        'improve': {
            title: 'Sugerencias de Mejora',
            suggestions: [
                'Considera añadir más ejemplos concretos para ilustrar tus puntos principales',
                'Revisa la transición entre párrafos para mejorar el flujo narrativo',
                'Evalúa si el tono es consistente a lo largo del texto',
                'Considera dividir párrafos largos para mejorar la legibilidad'
            ]
        },
        'seo': {
            title: 'Optimización SEO',
            suggestions: [
                'Añade subtítulos descriptivos (H2, H3) para mejorar la estructura',
                'Incluye palabras clave relevantes de forma natural',
                'Considera añadir meta descripción si es contenido web',
                'Optimiza la longitud del contenido para el tipo de publicación'
            ]
        },
        'tone': {
            title: 'Ajuste de Tono',
            suggestions: [
                'El tono actual parece apropiado para el contenido',
                'Considera hacer el lenguaje más accesible si es contenido divulgativo',
                'Evalúa si necesitas un tono más formal o más cercano según tu audiencia',
                'Revisa el uso de la voz activa vs. pasiva'
            ]
        }
    };

    return {
        type: suggestionType,
        ...baseSuggestions[suggestionType] || baseSuggestions['improve'],
        metadata: {
            contentLength: wordCount,
            analysisType: 'fallback',
            generatedAt: timestamp
        },
        note: 'Estas son sugerencias generales. Para análisis más específico, configura la integración con OpenAI.'
    };
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { content, suggestionType = 'improve' } = body;

        if (!content) {
            return NextResponse.json({ message: 'Content is required' }, { status: 400 });
        }

        const ghostRules = loadGhostRules();
        let prompt: string;

        switch (suggestionType) {
            case 'improve':
                prompt = `Analiza el siguiente contenido y proporciona sugerencias específicas para mejorarlo siguiendo estas reglas de escritura:

${ghostRules}

CONTENIDO:
${content}

Proporciona sugerencias constructivas y específicas en formato de lista, enfocándote en:
- Claridad y comprensión
- Estructura y flujo narrativo
- Engagement y impacto
- Coherencia de tono
- Mejoras técnicas de escritura`;
                break;

            case 'seo':
                prompt = `Analiza el siguiente contenido desde una perspectiva SEO y proporciona sugerencias para optimizarlo:

CONTENIDO:
${content}

Proporciona sugerencias específicas para:
- Estructura de encabezados (H1, H2, H3)
- Palabras clave y densidad
- Meta descripción sugerida
- Longitud y formato óptimo
- Legibilidad y experiencia de usuario`;
                break;

            case 'tone':
                prompt = `Analiza el tono del siguiente contenido y sugiere ajustes si es necesario:

CONTENIDO:
${content}

Evalúa y sugiere mejoras para:
- Consistencia de tono
- Adecuación a la audiencia objetivo
- Nivel de formalidad
- Voz activa vs. pasiva
- Claridad del mensaje`;
                break;

            default:
                return NextResponse.json({ message: 'Invalid suggestion type' }, { status: 400 });
        }

        let suggestions: any;
        let usingAI = false;

        try {
            const aiResponse = await generateWithOpenAI(prompt);
            suggestions = {
                type: suggestionType,
                title: suggestionType === 'improve' ? 'Sugerencias de Mejora' : 
                       suggestionType === 'seo' ? 'Optimización SEO' : 'Ajuste de Tono',
                content: aiResponse,
                metadata: {
                    contentLength: content.split(/\s+/).length,
                    analysisType: 'ai',
                    generatedAt: new Date().toISOString()
                }
            };
            usingAI = true;
        } catch (error) {
            console.warn('AI suggestion failed, using fallback:', error);
            suggestions = generateFallbackSuggestions(content, suggestionType);
        }

        return NextResponse.json({
            success: true,
            suggestions,
            usingAI
        });

    } catch (error: any) {
        console.error('[API/suggest-improvements] Error:', error);
        return NextResponse.json({ 
            message: 'Failed to generate suggestions', 
            details: error.message 
        }, { status: 500 });
    }
} 