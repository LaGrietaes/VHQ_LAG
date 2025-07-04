import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const TEMPLATES_ROOT = path.resolve(process.cwd(), '..', 'VHQ_Resources', 'templates');

type Template = {
    id: string;
    title: string;
    content: string;
    type: 'book' | 'blog' | 'script' | 'general';
    createdAt: string;
    updatedAt: string;
};

const ensureTemplatesDirectory = () => {
    if (!fs.existsSync(TEMPLATES_ROOT)) {
        fs.mkdirSync(TEMPLATES_ROOT, { recursive: true });
    }
};

const getDefaultTemplates = (): Template[] => {
    return [
        {
            id: 'chapter-template',
            title: 'Capítulo de Libro',
            content: `# Capítulo X: Título del Capítulo

## Apertura

*Anécdota o cita para empezar.*

## Desarrollo de la Tesis

*Argumento principal del capítulo.*

## Subsección 1

*Detalles y evidencias.*

## Subsección 2

*Más detalles y contraargumentos.*

## Cierre del Capítulo

*Resumen de lo aprendido.*
*Transición al siguiente capítulo.*`,
            type: 'book',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'blog-post-template',
            title: 'Post de Blog',
            content: `# Título Atractivo del Post

## Introducción

*Hook inicial que capture la atención del lector.*

## Problema/Situación

*Describe el problema o situación que vas a abordar.*

## Desarrollo/Solución

### Punto 1
*Primer argumento o paso.*

### Punto 2
*Segundo argumento o paso.*

### Punto 3
*Tercer argumento o paso.*

## Conclusión

*Resumen y llamada a la acción.*

---

*Tags: [tag1], [tag2], [tag3]*`,
            type: 'blog',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'script-scene-template',
            title: 'Escena de Guión',
            content: `## ESCENA X - UBICACIÓN - DÍA/NOCHE

**FADE IN:**

**EXT./INT. UBICACIÓN - DÍA/NOCHE**

*Descripción del escenario y atmósfera.*

**PERSONAJE 1**
(acción/emoción)
Diálogo del primer personaje.

**PERSONAJE 2**
Respuesta del segundo personaje.

*Descripción de acción.*

**PERSONAJE 1**
(reacción)
Más diálogo.

**FADE OUT.**`,
            type: 'script',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];
};

const loadCustomTemplates = (): Template[] => {
    ensureTemplatesDirectory();
    const customTemplatesFile = path.join(TEMPLATES_ROOT, 'custom_templates.json');
    
    if (fs.existsSync(customTemplatesFile)) {
        try {
            const data = fs.readFileSync(customTemplatesFile, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error loading custom templates:', error);
        }
    }
    
    return [];
};

const saveCustomTemplates = (templates: Template[]): void => {
    ensureTemplatesDirectory();
    const customTemplatesFile = path.join(TEMPLATES_ROOT, 'custom_templates.json');
    fs.writeFileSync(customTemplatesFile, JSON.stringify(templates, null, 2));
};

// GET - Retrieve all templates
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type'); // Filter by type if provided

        const defaultTemplates = getDefaultTemplates();
        const customTemplates = loadCustomTemplates();
        const allTemplates = [...defaultTemplates, ...customTemplates];

        const filteredTemplates = type 
            ? allTemplates.filter(template => template.type === type)
            : allTemplates;

        return NextResponse.json({
            success: true,
            templates: filteredTemplates,
            count: filteredTemplates.length
        });

    } catch (error: any) {
        console.error('[API/templates] GET Error:', error);
        return NextResponse.json({ 
            message: 'Failed to load templates', 
            details: error.message 
        }, { status: 500 });
    }
}

// POST - Create a new custom template
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { title, content, type = 'general' } = body;

        if (!title || !content) {
            return NextResponse.json({ 
                message: 'Title and content are required' 
            }, { status: 400 });
        }

        const customTemplates = loadCustomTemplates();
        
        const newTemplate: Template = {
            id: `custom-${Date.now()}`,
            title,
            content,
            type,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        customTemplates.push(newTemplate);
        saveCustomTemplates(customTemplates);

        return NextResponse.json({
            success: true,
            template: newTemplate,
            message: 'Template created successfully'
        });

    } catch (error: any) {
        console.error('[API/templates] POST Error:', error);
        return NextResponse.json({ 
            message: 'Failed to create template', 
            details: error.message 
        }, { status: 500 });
    }
}

// PUT - Update an existing custom template
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, title, content, type } = body;

        if (!id || !title || !content) {
            return NextResponse.json({ 
                message: 'ID, title and content are required' 
            }, { status: 400 });
        }

        // Only allow updating custom templates (not default ones)
        if (!id.startsWith('custom-')) {
            return NextResponse.json({ 
                message: 'Cannot update default templates' 
            }, { status: 403 });
        }

        const customTemplates = loadCustomTemplates();
        const templateIndex = customTemplates.findIndex(t => t.id === id);

        if (templateIndex === -1) {
            return NextResponse.json({ 
                message: 'Template not found' 
            }, { status: 404 });
        }

        customTemplates[templateIndex] = {
            ...customTemplates[templateIndex],
            title,
            content,
            type: type || customTemplates[templateIndex].type,
            updatedAt: new Date().toISOString()
        };

        saveCustomTemplates(customTemplates);

        return NextResponse.json({
            success: true,
            template: customTemplates[templateIndex],
            message: 'Template updated successfully'
        });

    } catch (error: any) {
        console.error('[API/templates] PUT Error:', error);
        return NextResponse.json({ 
            message: 'Failed to update template', 
            details: error.message 
        }, { status: 500 });
    }
}

// DELETE - Remove a custom template
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ 
                message: 'Template ID is required' 
            }, { status: 400 });
        }

        // Only allow deleting custom templates (not default ones)
        if (!id.startsWith('custom-')) {
            return NextResponse.json({ 
                message: 'Cannot delete default templates' 
            }, { status: 403 });
        }

        const customTemplates = loadCustomTemplates();
        const filteredTemplates = customTemplates.filter(t => t.id !== id);

        if (filteredTemplates.length === customTemplates.length) {
            return NextResponse.json({ 
                message: 'Template not found' 
            }, { status: 404 });
        }

        saveCustomTemplates(filteredTemplates);

        return NextResponse.json({
            success: true,
            message: 'Template deleted successfully'
        });

    } catch (error: any) {
        console.error('[API/templates] DELETE Error:', error);
        return NextResponse.json({ 
            message: 'Failed to delete template', 
            details: error.message 
        }, { status: 500 });
    }
} 