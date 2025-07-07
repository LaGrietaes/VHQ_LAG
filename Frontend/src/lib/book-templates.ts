export interface BookTemplate {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  language: 'es' | 'en' | 'both';
  category: string;
  templates: {
    tip?: string;
    chapter?: string;
    section?: string;
    outline?: string;
    introduction?: string;
    conclusion?: string;
  };
  structure: {
    folders: string[];
    defaultFiles: string[];
  };
  prompts: {
    generateTip: string;
    generateChapter: string;
    generateContent: string;
    createSection: string;
    createOutline: string;
    organizeWorkspace: string;
  };
  promptsEn: {
    generateTip: string;
    generateChapter: string;
    generateContent: string;
    createSection: string;
    createOutline: string;
    organizeWorkspace: string;
  };
}

export const BOOK_TEMPLATES: Record<string, BookTemplate> = {
  'tips_book': {
    id: 'tips_book',
    name: 'Libro de Tips',
    nameEn: 'Tips Book',
    description: 'Libro estructurado con consejos y tips prácticos',
    descriptionEn: 'Structured book with practical tips and advice',
    language: 'both',
    category: 'educational',
    templates: {
      tip: `# {tipNumber} – {tipTitle}

**Categoría:** {category}  
**Nivel:** {level}  
**Tiempo de lectura estimado:** {readingTime} minutos  
---

## 🧠 Resumen

{summary}

---

## ✍️ Una breve historia

{story}

---

## ❓ ¿Por qué importa?

{importance}

---

## 🛠️ Cómo aplicarlo

{application}

---

## 🧪 Ejemplo práctico

### Prompt A (incorrecto):  
> {badExample}

### Prompt B (correcto):  
> {goodExample}

**Resultado comparado:**  
{comparison}

---

## 💬 Frase para recordar

> **"{quote}"**

---

## 📌 Tips extra

{extraTips}

---

## 📍 ¿Dónde aplicarlo?

{applications}

---

## ✅ Mini reto práctico

{challenge}

---

## ✒️ Cierre

{closing}`,
      chapter: `# {chapterTitle}

## Introducción

{introduction}

## {section1Title}

{section1Content}

## {section2Title}

{section2Content}

## {section3Title}

{section3Content}

## Conclusión

{conclusion}

## Ejercicios Prácticos

{exercises}`,
      outline: `# Esquema del Libro: {bookTitle}

## Capítulo 1: {chapter1Title}
- Sección 1.1: {section1_1}
- Sección 1.2: {section1_2}
- Sección 1.3: {section1_3}

## Capítulo 2: {chapter2Title}
- Sección 2.1: {section2_1}
- Sección 2.2: {section2_2}
- Sección 2.3: {section2_3}

## Capítulo 3: {chapter3Title}
- Sección 3.1: {section3_1}
- Sección 3.2: {section3_2}
- Sección 3.3: {section3_3}

## Apéndices
- A: {appendixA}
- B: {appendixB}
- C: {appendixC}`
    },
    structure: {
      folders: ['Capítulos', 'Secciones', 'Ejemplos e Ideas', 'Generated_Content', 'Recursos'],
      defaultFiles: ['README.md', 'outline.md', 'metadata.json']
    },
    prompts: {
      generateTip: `Crea un nuevo tip para el libro siguiendo el formato del archivo de ejemplo. 
      El tip debe ser práctico, útil y bien estructurado. 
      Incluye todas las secciones: Resumen, Historia, ¿Por qué importa?, Cómo aplicarlo, Ejemplo práctico, etc.
      Usa el formato === FILE_OPERATION === para crear el archivo.
      
      Contexto del proyecto: {projectName}
      Tipo de libro: {bookType}
      Idioma: {language}`,
      generateChapter: `Crea un nuevo capítulo para el libro con un tema específico y bien estructurado. 
      Incluye introducción, desarrollo y conclusiones. 
      Usa el formato === FILE_OPERATION === para crear el archivo.
      
      Contexto del proyecto: {projectName}
      Tipo de libro: {bookType}
      Idioma: {language}`,
      generateContent: `Genera contenido para el libro basándote en el contexto del proyecto actual. 
      Crea secciones bien estructuradas y detalladas. 
      Usa el formato === FILE_OPERATION === para crear el archivo.
      
      Contexto del proyecto: {projectName}
      Tipo de libro: {bookType}
      Idioma: {language}`,
      createSection: `Crea una nueva sección de contenido para el libro. 
      La sección debe ser específica y bien organizada. 
      Usa el formato === FILE_OPERATION === para crear el archivo.
      
      Contexto del proyecto: {projectName}
      Tipo de libro: {bookType}
      Idioma: {language}`,
      createOutline: `Crea un esquema completo y detallado para el libro. 
      Incluye todos los capítulos, secciones y subsecciones. 
      Usa el formato === FILE_OPERATION === para crear el archivo.
      
      Contexto del proyecto: {projectName}
      Tipo de libro: {bookType}
      Idioma: {language}`,
      organizeWorkspace: `Organiza y estructura el workspace del libro. 
      Crea carpetas apropiadas y mueve archivos a sus ubicaciones correctas. 
      Usa el formato === FILE_OPERATION === para crear archivos y carpetas.
      
      Contexto del proyecto: {projectName}
      Tipo de libro: {bookType}
      Idioma: {language}`
    },
    promptsEn: {
      generateTip: `Create a new tip for the book following the example file format.
      The tip should be practical, useful and well structured.
      Include all sections: Summary, Story, Why it matters, How to apply, Practical example, etc.
      Use the === FILE_OPERATION === format to create the file.
      
      Project context: {projectName}
      Book type: {bookType}
      Language: {language}`,
      generateChapter: `Create a new chapter for the book with a specific topic and well structured.
      Include introduction, development and conclusions.
      Use the === FILE_OPERATION === format to create the file.
      
      Project context: {projectName}
      Book type: {bookType}
      Language: {language}`,
      generateContent: `Generate content for the book based on the current project context.
      Create well-structured and detailed sections.
      Use the === FILE_OPERATION === format to create the file.
      
      Project context: {projectName}
      Book type: {bookType}
      Language: {language}`,
      createSection: `Create a new content section for the book.
      The section should be specific and well organized.
      Use the === FILE_OPERATION === format to create the file.
      
      Project context: {projectName}
      Book type: {bookType}
      Language: {language}`,
      createOutline: `Create a complete and detailed outline for the book.
      Include all chapters, sections and subsections.
      Use the === FILE_OPERATION === format to create the file.
      
      Project context: {projectName}
      Book type: {bookType}
      Language: {language}`,
      organizeWorkspace: `Organize and structure the book workspace.
      Create appropriate folders and move files to their correct locations.
      Use the === FILE_OPERATION === format to create files and folders.
      
      Project context: {projectName}
      Book type: {bookType}
      Language: {language}`
    }
  },
  'guide_book': {
    id: 'guide_book',
    name: 'Guía Práctica',
    nameEn: 'Practical Guide',
    description: 'Guía paso a paso con instrucciones detalladas',
    descriptionEn: 'Step-by-step guide with detailed instructions',
    language: 'both',
    category: 'instructional',
    templates: {
      chapter: `# {chapterTitle}

## Objetivos del Capítulo

{objectives}

## Prerrequisitos

{prerequisites}

## {step1Title}

{step1Content}

### Ejemplo Práctico

{step1Example}

## {step2Title}

{step2Content}

### Ejemplo Práctico

{step2Example}

## {step3Title}

{step3Content}

### Ejemplo Práctico

{step3Example}

## Resumen

{summary}

## Ejercicios de Práctica

{exercises}

## Recursos Adicionales

{resources}`,
      section: `# {sectionTitle}

## Descripción

{description}

## Pasos a Seguir

{steps}

## Consejos Importantes

{tips}

## Errores Comunes

{commonErrors}

## Ejemplo Completo

{completeExample}`,
      outline: `# Guía: {guideTitle}

## Introducción
- ¿Qué aprenderás
- Prerrequisitos
- Estructura del curso

## Módulo 1: {module1Title}
- Lección 1.1: {lesson1_1}
- Lección 1.2: {lesson1_2}
- Lección 1.3: {lesson1_3}

## Módulo 2: {module2Title}
- Lección 2.1: {lesson2_1}
- Lección 2.2: {lesson2_2}
- Lección 2.3: {lesson2_3}

## Módulo 3: {module3Title}
- Lección 3.1: {lesson3_1}
- Lección 3.2: {lesson3_2}
- Lección 3.3: {lesson3_3}

## Proyectos Prácticos
- Proyecto 1: {project1}
- Proyecto 2: {project2}
- Proyecto 3: {project3}

## Recursos y Referencias
- Enlaces útiles
- Bibliografía
- Herramientas recomendadas`
    },
    structure: {
      folders: ['Introducción', 'Pasos', 'Ejemplos', 'Recursos', 'Apéndices'],
      defaultFiles: ['README.md', 'introduction.md', 'steps.md']
    },
    prompts: {
      generateTip: `Crea una nueva lección o paso para la guía. 
      Debe ser claro, detallado y fácil de seguir. 
      Incluye ejemplos prácticos y consejos útiles.
      Usa el formato === FILE_OPERATION === para crear el archivo.
      
      Contexto del proyecto: {projectName}
      Tipo de libro: {bookType}
      Idioma: {language}`,
      generateChapter: `Crea un nuevo módulo o capítulo para la guía. 
      Incluye objetivos claros, pasos detallados y ejemplos prácticos. 
      Usa el formato === FILE_OPERATION === para crear el archivo.
      
      Contexto del proyecto: {projectName}
      Tipo de libro: {bookType}
      Idioma: {language}`,
      generateContent: `Genera contenido instructivo para la guía. 
      Crea lecciones paso a paso con ejemplos claros. 
      Usa el formato === FILE_OPERATION === para crear el archivo.
      
      Contexto del proyecto: {projectName}
      Tipo de libro: {bookType}
      Idioma: {language}`,
      createSection: `Crea una nueva sección de la guía. 
      Debe ser específica y bien estructurada con pasos claros. 
      Usa el formato === FILE_OPERATION === para crear el archivo.
      
      Contexto del proyecto: {projectName}
      Tipo de libro: {bookType}
      Idioma: {language}`,
      createOutline: `Crea un esquema completo para la guía. 
      Incluye todos los módulos, lecciones y proyectos prácticos. 
      Usa el formato === FILE_OPERATION === para crear el archivo.
      
      Contexto del proyecto: {projectName}
      Tipo de libro: {bookType}
      Idioma: {language}`,
      organizeWorkspace: `Organiza el workspace de la guía. 
      Crea carpetas para módulos, ejemplos y recursos. 
      Usa el formato === FILE_OPERATION === para crear archivos y carpetas.
      
      Contexto del proyecto: {projectName}
      Tipo de libro: {bookType}
      Idioma: {language}`
    },
    promptsEn: {
      generateTip: `Create a new lesson or step for the guide.
      It should be clear, detailed and easy to follow.
      Include practical examples and useful tips.
      Use the === FILE_OPERATION === format to create the file.
      
      Project context: {projectName}
      Book type: {bookType}
      Language: {language}`,
      generateChapter: `Create a new module or chapter for the guide.
      Include clear objectives, detailed steps and practical examples.
      Use the === FILE_OPERATION === format to create the file.
      
      Project context: {projectName}
      Book type: {bookType}
      Language: {language}`,
      generateContent: `Generate instructional content for the guide.
      Create step-by-step lessons with clear examples.
      Use the === FILE_OPERATION === format to create the file.
      
      Project context: {projectName}
      Book type: {bookType}
      Language: {language}`,
      createSection: `Create a new section of the guide.
      It should be specific and well structured with clear steps.
      Use the === FILE_OPERATION === format to create the file.
      
      Project context: {projectName}
      Book type: {bookType}
      Language: {language}`,
      createOutline: `Create a complete outline for the guide.
      Include all modules, lessons and practical projects.
      Use the === FILE_OPERATION === format to create the file.
      
      Project context: {projectName}
      Book type: {bookType}
      Language: {language}`,
      organizeWorkspace: `Organize the guide workspace.
      Create folders for modules, examples and resources.
      Use the === FILE_OPERATION === format to create files and folders.
      
      Project context: {projectName}
      Book type: {bookType}
      Language: {language}`
    }
  }
};

export class BookTemplateManager {
  private static instance: BookTemplateManager;

  static getInstance(): BookTemplateManager {
    if (!BookTemplateManager.instance) {
      BookTemplateManager.instance = new BookTemplateManager();
    }
    return BookTemplateManager.instance;
  }

  getTemplate(bookTypeId: string): BookTemplate | undefined {
    return BOOK_TEMPLATES[bookTypeId];
  }

  getAllTemplates(): BookTemplate[] {
    return Object.values(BOOK_TEMPLATES);
  }

  getTemplatesByCategory(category: string): BookTemplate[] {
    return Object.values(BOOK_TEMPLATES).filter(template => template.category === category);
  }

  getTemplatesByLanguage(language: 'es' | 'en' | 'both'): BookTemplate[] {
    return Object.values(BOOK_TEMPLATES).filter(template => template.language === language || template.language === 'both');
  }

  addTemplate(template: BookTemplate): void {
    BOOK_TEMPLATES[template.id] = template;
  }

  removeTemplate(templateId: string): boolean {
    return delete BOOK_TEMPLATES[templateId];
  }

  getPrompt(templateId: string, action: string, language: 'es' | 'en'): string {
    const template = this.getTemplate(templateId);
    if (!template) return '';

    const prompts = language === 'es' ? template.prompts : template.promptsEn;
    return prompts[action as keyof typeof prompts] || '';
  }

  getTemplateContent(templateId: string, templateType: string, variables: Record<string, string>): string {
    const template = this.getTemplate(templateId);
    if (!template || !template.templates[templateType as keyof typeof template.templates]) {
      return '';
    }

    let content = template.templates[templateType as keyof typeof template.templates] || '';
    
    // Replace variables
    for (const [key, value] of Object.entries(variables)) {
      content = content.replace(new RegExp(`{${key}}`, 'g'), value);
    }

    return content;
  }
}

export default BookTemplateManager; 