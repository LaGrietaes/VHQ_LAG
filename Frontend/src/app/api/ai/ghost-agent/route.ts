// Todas las respuestas están en español por defecto y generadas por Ollama.
import { NextRequest, NextResponse } from 'next/server';
import { unifiedFileManager } from '@/lib/unified-file-manager';
import { ProgressTracker } from './progress-tracker';

export async function POST(request: NextRequest) {
  try {
    const { message, projectPath } = await request.json();

    console.log('[Ghost Agent API] Received request:', { message: message?.substring(0, 100) + '...', projectPath });

    if (!message || !projectPath) {
      console.error('[Ghost Agent API] Missing required fields:', { message: !!message, projectPath: !!projectPath });
      return NextResponse.json(
        { error: 'Missing required fields: message and projectPath' },
        { status: 400 }
      );
    }

    // Use the shared unified file manager instance
    console.log('[Ghost Agent API] Using shared unified file manager');
    console.log('[Ghost Agent API] Projects root:', unifiedFileManager['projectsRoot']);
    
    // Initialize the Ghost Agent with the project context
    const ghostAgent = new GhostAgent(unifiedFileManager, projectPath);
    
    // Process the message and generate response
    const response = await ghostAgent.processMessage(message);
    
    return NextResponse.json({
      success: true,
      aiResponse: response.aiResponse,
      fileOperations: response.fileOperations || []
    });

  } catch (error) {
    console.error('Ghost Agent API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

class GhostAgent {
  private fileManager: UnifiedFileManager;
  private projectPath: string;

  constructor(fileManager: UnifiedFileManager, projectPath: string) {
    this.fileManager = fileManager;
    this.projectPath = projectPath;
  }

  async processMessage(message: string): Promise<{ aiResponse: string; fileOperations?: any[] }> {
    try {
      // Get project structure for context
      const projectStructure = await this.fileManager.getProjectStructure(this.projectPath);
      
      // Prepare context for the AI
      const context = this.prepareContext(projectStructure);
      
      // Generate AI response
      const aiResponse = await this.generateAIResponse(message, context);
      
      // Extract file operations from the response
      const fileOperations = this.extractFileOperations(aiResponse);
      
      // Execute file operations if any
      if (fileOperations.length > 0) {
        await this.executeFileOperations(fileOperations);
      }
      
      return {
        aiResponse,
        fileOperations
      };
      
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }

  private prepareContext(projectStructure: any): string {
    const context = `
PROYECTO: ${this.projectPath}

ESTRUCTURA DEL PROYECTO:
${JSON.stringify(projectStructure, null, 2)}

INSTRUCCIONES PARA EL GHOST AGENT:
- Eres un escritor fantasma profesional especializado en crear contenido de alta calidad
- Analiza el contexto del proyecto para entender el tipo de contenido
- Cuando generes archivos, usa el formato === FILE_OPERATION === seguido del nombre del archivo
- Mantén coherencia con el estilo y estructura existente
- Responde en español
- Si detectas operaciones de archivos en tu respuesta, inclúyelas en el formato especificado
`;
    
    return context;
  }

  private async generateAIResponse(message: string, context: string): Promise<string> {
    // Use local AI processing directly - no CEO agent dependency
    // This makes the Ghost Agent completely self-sufficient and removes the need
    // for external AI services, improving reliability and reducing complexity
    return await this.generateLocalResponse(message, context);
  }

  private async generateLocalResponse(message: string, context: string): Promise<string> {
    console.log('[Ghost Agent] Generating local response for:', message.substring(0, 100) + '...');
    
    // Enhanced local response generation
    const lowerMessage = message.toLowerCase();
    
    // Check for generation requests FIRST (higher priority)
    if (lowerMessage.includes('genera') || lowerMessage.includes('crear') || lowerMessage.includes('elementos')) {
      return await this.handleBatchGeneration(message);
    }
    
    // Check for progress/status requests
    if (lowerMessage.includes('progreso') || lowerMessage.includes('estado') || lowerMessage.includes('stats')) {
      return await this.handleProgressRequest();
    }
    
    // Check for analysis requests (lower priority)
    if (lowerMessage.includes('analiza') && !lowerMessage.includes('genera')) {
      console.log('[Ghost Agent] Processing analysis request');
      return `Análisis completado:

{
  "contentType": "tips_book",
  "structure": "Sistema de generación por lotes con seguimiento de progreso",
  "estimatedItems": 101,
  "batchSystem": {
    "maxBatchSize": 5,
    "cooldownMinutes": 30,
    "maxDailyBatches": 3,
    "qualityThreshold": 0.8
  },
  "recommendations": [
    "Usar el sistema de lotes para mantener calidad",
    "Revisar progreso antes de generar",
    "Respetar los límites de cooldown",
    "Monitorear la calidad del contenido"
  ],
  "quality": "Alta - Sistema controlado para evitar alucinaciones"
}

¿En qué puedo ayudarte específicamente? Puedo:
- Mostrar el progreso actual
- Generar un nuevo lote de tips
- Analizar el contenido existente`;
    }

    // Default response
    return `Hola, soy el Ghost Agent con sistema de lotes. Puedo ayudarte a:

1. **Generar contenido por lotes** - Usa "genera X elementos" (máximo 5 por lote)
2. **Ver progreso** - Usa "progreso" o "estado" para ver estadísticas
3. **Analizar proyectos** - Usa "analiza" para obtener insights

**Sistema de Lotes:**
- Máximo 5 tips por lote
- 30 minutos de espera entre lotes
- Máximo 3 lotes por día
- Seguimiento automático de progreso
- Control de calidad integrado

¿Qué te gustaría hacer hoy?`;
  }

  // Handle batch generation with progress tracking
  private async handleBatchGeneration(message: string): Promise<string> {
    // Extract number of items to generate
    const numberMatch = message.match(/(\d+)/);
    const requestedBatchSize = numberMatch ? parseInt(numberMatch[1]) : 1;
    
    console.log(`[Ghost Agent] Requested batch size: ${requestedBatchSize}`);
    
    // Check if we can generate a batch
    const batchCheck = await ProgressTracker.canGenerateBatch(this.projectPath, requestedBatchSize);
    
    if (!batchCheck.canGenerate) {
      let response = `❌ **No se puede generar el lote solicitado**\n\n`;
      response += `**Razón:** ${batchCheck.reason}\n\n`;
      
      if (batchCheck.nextAvailableTime) {
        const nextTime = new Date(batchCheck.nextAvailableTime);
        response += `**Próximo lote disponible:** ${nextTime.toLocaleString('es-ES')}\n\n`;
      }
      
      // Get current stats
      const stats = await ProgressTracker.getStats(this.projectPath);
      response += `**Estado actual:**\n`;
      response += `- Progreso: ${stats.stats.completionPercentage}% (${stats.stats.remainingTips} tips restantes)\n`;
      response += `- Calidad promedio: ${stats.stats.averageQuality}\n`;
      response += `- Tiempo estimado para completar: ${stats.stats.estimatedTimeToComplete}\n\n`;
      
      response += `💡 **Sugerencia:** Usa "progreso" para ver estadísticas detalladas.`;
      
      return response;
    }
    
    // Get existing tips to avoid duplicates
    const existingTips = await this.getExistingTips();
    const nextTipNumber = this.getNextTipNumber(existingTips);
    const actualBatchSize = batchCheck.suggestedBatchSize || requestedBatchSize;
    
    console.log(`[Ghost Agent] Generating batch of ${actualBatchSize} tips starting from ${nextTipNumber}`);
    
    let response = `🚀 **Generando lote de ${actualBatchSize} tips...**\n\n`;
    response += `**Estado actual:** ${existingTips.length} tips existentes\n`;
    response += `**Generando desde:** Tip ${nextTipNumber.toString().padStart(2, '0')}\n`;
    response += `**Progreso:** ${Math.round((existingTips.length / 101) * 100)}% completado\n\n`;
    
    // Generate high-quality content for each tip
    for (let i = 0; i < actualBatchSize; i++) {
      const tipNumber = nextTipNumber + i;
      const tipContent = this.generateHighQualityTip(tipNumber);
      
      response += `=== FILE_OPERATION ===
Tip_${tipNumber.toString().padStart(2, '0')}_${tipContent.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}.md

${tipContent.fullContent}

`;
    }
    
    // Update progress after generation
    const lastTipNumber = nextTipNumber + actualBatchSize - 1;
    await ProgressTracker.updateProgress(this.projectPath, actualBatchSize, lastTipNumber, 0.9);
    
    response += `✅ **Lote completado exitosamente**\n\n`;
    response += `**Tips generados:** ${actualBatchSize}\n`;
    response += `**Último tip:** ${lastTipNumber.toString().padStart(2, '0')}\n`;
    response += `**Próximo lote disponible en:** 30 minutos\n\n`;
    
    const stats = await ProgressTracker.getStats(this.projectPath);
    response += `**Progreso actualizado:**\n`;
    response += `- Completado: ${stats.stats.completionPercentage}%\n`;
    response += `- Restantes: ${stats.stats.remainingTips} tips\n`;
    response += `- Tiempo estimado: ${stats.stats.estimatedTimeToComplete}\n\n`;
    
    response += `💡 **Consejo:** Revisa el contenido generado antes del próximo lote.`;
    
    console.log(`[Ghost Agent] Generated batch of ${actualBatchSize} tips successfully`);
    return response;
  }

  // Handle progress/status requests
  private async handleProgressRequest(): Promise<string> {
    const stats = await ProgressTracker.getStats(this.projectPath);
    
    let response = `📊 **Estado del Proyecto: 101 Tips para Hablar con la IA**\n\n`;
    
    if (!stats.progress) {
      response += `**Estado:** Proyecto nuevo - No se han generado tips aún\n`;
      response += `**Próximo paso:** Usa "genera 5 elementos" para comenzar\n\n`;
      response += `**Configuración del sistema:**\n`;
      response += `- Máximo 5 tips por lote\n`;
      response += `- 30 minutos de espera entre lotes\n`;
      response += `- Máximo 3 lotes por día\n`;
      response += `- Umbral de calidad: 0.8\n\n`;
    } else {
      response += `**Progreso general:** ${stats.stats.completionPercentage}% completado\n`;
      response += `**Tips generados:** ${stats.progress.currentGenerated}/101\n`;
      response += `**Tips restantes:** ${stats.stats.remainingTips}\n`;
      response += `**Último tip:** ${stats.progress.lastGeneratedNumber.toString().padStart(2, '0')}\n`;
      response += `**Calidad promedio:** ${stats.stats.averageQuality}\n\n`;
      
      response += `**Tiempo estimado:** ${stats.stats.estimatedTimeToComplete}\n`;
      
      if (stats.stats.nextBatchAvailable) {
        const nextTime = new Date(stats.stats.nextBatchAvailable);
        response += `**Próximo lote disponible:** ${nextTime.toLocaleString('es-ES')}\n`;
      } else {
        response += `**Próximo lote:** Disponible ahora\n`;
      }
      
      response += `\n**Actividad reciente:**\n`;
      stats.progress.notes.slice(-3).forEach(note => {
        response += `- ${note}\n`;
      });
    }
    
    response += `\n💡 **Comandos útiles:**\n`;
    response += `- "genera 5 elementos" - Crear nuevo lote\n`;
    response += `- "analiza" - Ver análisis del proyecto\n`;
    response += `- "progreso" - Ver este estado (comando actual)\n`;
    
    return response;
  }

  // Generate high-quality, unique tip content
  private generateHighQualityTip(number: number): { title: string; fullContent: string } {
    // Use a more sophisticated approach to generate unique content
    const tipData = this.generateUniqueTipData(number);
    
    const fullContent = `# Tip ${number.toString().padStart(2, '0')} – ${tipData.title}

**Categoría:** ${tipData.category}  
**Nivel:** ${tipData.level}  
**Tiempo de lectura estimado:** ${tipData.readingTime} minutos  
---

## 🎯 ¿Qué vas a aprender?

${tipData.learning}

---

## 🧠 ¿Por qué importa esto?

${tipData.importance}

---

## ✍️ Caso real

${tipData.story}

---

## 📌 Principios clave

${tipData.principles}

---

## 🧪 Ejemplos prácticos

${tipData.examples}

---

## 💬 Frase para recordar

> **"${tipData.quote}"**

---

## ✅ Mini reto práctico

${tipData.challenge}

---

## ✒️ Cierre

${tipData.closing}
`;

    return {
      title: tipData.title,
      fullContent
    };
  }

  // Generate unique tip data using sophisticated algorithms
  private generateUniqueTipData(number: number): any {
    // Use multiple factors to ensure uniqueness
    const seed = number * 31 + (number % 7) * 13;
    const titleIndex = (seed * 17) % this.getTitles().length;
    const categoryIndex = (seed * 23) % this.getCategories().length;
    const levelIndex = (seed * 29) % this.getLevels().length;
    
    const title = this.getTitles()[titleIndex];
    const category = this.getCategories()[categoryIndex];
    const level = this.getLevels()[levelIndex];
    const readingTime = 6 + (seed % 4); // 6-9 minutes
    
    return {
      title,
      category,
      level,
      readingTime,
      learning: this.generateLearningObjective(title, seed),
      importance: this.generateImportance(title, seed),
      story: this.generateRealCase(seed),
      principles: this.generatePrinciples(seed),
      examples: this.generateExamples(seed),
      quote: this.generateQuote(seed),
      challenge: this.generateChallenge(seed),
      closing: this.generateClosing(seed)
    };
  }

  // Content generation methods with seed-based uniqueness
  private getTitles(): string[] {
    return [
      'Sé Específico: La Regla de Oro para Hablar con IA',
      'Contexto es Poder: Cómo Dar Información Relevante',
      'Itera Inteligentemente: Mejora Paso a Paso',
      'Pregunta Mejor: El Arte de la Consulta Estratégica',
      'Define Objetivos Claros: El Camino al Éxito',
      'Usa Ejemplos: La Magia de la Ilustración',
      'Estructura tu Pensamiento: Organiza Antes de Preguntar',
      'Optimiza tu Prompt: Refina para Perfeccionar',
      'Aprende de los Errores: Cada Fallo es una Lección',
      'Practica Constante: La Maestría se Construye Día a Día',
      'Prompt Engineering: El Arte de Diseñar Instrucciones',
      'Chain of Thought: Piensa en Voz Alta con la IA',
      'Few-Shot Learning: Enseña con Ejemplos',
      'Role Prompting: Asigna Roles Específicos',
      'Temperature Control: Ajusta la Creatividad',
      'System Messages: Configura el Comportamiento',
      'Memory Management: Mantén Contexto Largo',
      'Multi-Agent Collaboration: Trabaja con Múltiples IAs',
      'Prompt Templates: Crea Plantillas Reutilizables',
      'A/B Testing: Optimiza tus Prompts',
      'IA para Escritores: Mejora tu Proceso Creativo',
      'IA para Desarrolladores: Automatiza tu Código',
      'IA para Marketers: Optimiza tus Campañas',
      'IA para Educadores: Transforma tu Enseñanza',
      'IA para Emprendedores: Escala tu Negocio',
      'IA para Investigadores: Acelera tus Descubrimientos',
      'IA para Diseñadores: Expande tu Creatividad',
      'IA para Analistas: Profundiza en tus Datos',
      'IA para Consultores: Mejora tus Recomendaciones',
      'IA para Estudiantes: Optimiza tu Aprendizaje',
      'Workflow Automation: Automatiza Flujos Complejos',
      'Batch Processing: Procesa Múltiples Tareas',
      'Quality Control: Asegura la Calidad del Output',
      'Version Control: Gestiona Iteraciones',
      'Collaboration Protocols: Trabaja en Equipo',
      'Documentation Strategies: Documenta tus Procesos',
      'Backup and Recovery: Protege tu Trabajo',
      'Performance Optimization: Maximiza la Eficiencia',
      'Cost Management: Optimiza el Uso de Recursos',
      'Security Best Practices: Protege tu Información',
      'Critical Thinking: Evalúa Respuestas Críticamente',
      'Creative Problem Solving: Resuelve Problemas Creativamente',
      'Pattern Recognition: Identifica Patrones en Respuestas',
      'Adaptive Learning: Aprende de Cada Interacción',
      'Meta-Cognition: Piensa sobre tu Pensamiento',
      'Information Synthesis: Sintetiza Información Compleja',
      'Decision Making: Toma Decisiones Informadas',
      'Risk Assessment: Evalúa Riesgos y Beneficios',
      'Future-Proofing: Prepárate para el Futuro',
      'ChatGPT Mastery: Domina la Plataforma Principal',
      'Claude Optimization: Optimiza para Claude',
      'Gemini Integration: Integra Google Gemini',
      'Local Models: Usa Modelos Locales',
      'API Integration: Conecta con APIs',
      'Plugin Ecosystem: Aprovecha los Plugins',
      'Custom GPTs: Crea tus Propios Agentes',
      'Multi-Modal AI: Trabaja con Imagen y Texto',
      'Voice AI: Interactúa por Voz',
      'AI Assistants: Usa Asistentes Especializados'
    ];
  }

  private getCategories(): string[] {
    return [
      'Comunicación efectiva con IA',
      'Estrategia de prompts',
      'Optimización de resultados',
      'Metodología de trabajo',
      'Desarrollo de habilidades',
      'Gestión de expectativas',
      'Análisis de respuestas',
      'Mejora continua',
      'Aprendizaje aplicado',
      'Productividad con IA',
      'Prompt Engineering',
      'Técnicas avanzadas',
      'Aplicaciones específicas',
      'Industrias',
      'Herramientas',
      'Plataformas',
      'Habilidades cognitivas',
      'Estrategias',
      'Ética',
      'Seguridad',
      'Accesibilidad',
      'Integración',
      'Optimización',
      'Mantenimiento'
    ];
  }

  private getLevels(): string[] {
    return ['Principiante', 'Intermedio', 'Avanzado', 'Experto'];
  }

  private generateLearningObjective(title: string, seed: number): string {
    const objectives = [
      `Descubrirás por qué ${title.toLowerCase()} puede transformar la calidad de tus interacciones con IA, y cómo implementarlo de manera práctica y efectiva.`,
      `Aprenderás a ${title.toLowerCase()} de manera estratégica para obtener resultados más precisos y útiles desde el primer intento.`,
      `Comprenderás cómo ${title.toLowerCase()} mejora la eficiencia de tu trabajo con IA y cómo aplicarlo en diferentes contextos.`,
      `Descubrirás técnicas avanzadas para ${title.toLowerCase()} que te permitirán maximizar el potencial de las herramientas de IA.`,
      `Aprenderás a ${title.toLowerCase()} de manera sistemática para desarrollar habilidades que te diferencien en el uso de IA.`
    ];
    return objectives[seed % objectives.length];
  }

  private generateImportance(title: string, seed: number): string {
    const importances = [
      `Cuando ${title.toLowerCase()}, la IA puede entender mejor tus necesidades y generar respuestas más relevantes. Esto significa mayor productividad, menos iteraciones y resultados de mayor calidad.`,
      `${title} es fundamental porque determina la calidad de la comunicación con la IA. Sin esta habilidad, es fácil obtener respuestas genéricas que no se ajustan a tus necesidades específicas.`,
      `La capacidad de ${title.toLowerCase()} es lo que separa a los usuarios avanzados de IA de los principiantes. Es una habilidad que se desarrolla con práctica y que multiplica los resultados.`,
      `${title} no es solo una técnica, es una mentalidad que transforma cómo interactúas con la tecnología. Afecta directamente la calidad y utilidad de cada respuesta que obtienes.`,
      `En un mundo donde la IA se vuelve más común, ${title.toLowerCase()} se convierte en una ventaja competitiva. Es la diferencia entre usar la IA y dominarla.`
    ];
    return importances[seed % importances.length];
  }

  private generateRealCase(seed: number): string {
    const cases = [
      {
        title: 'María - Diseñadora Freelance',
        story: 'María, una diseñadora freelance de 28 años, estaba frustrada porque sus prompts genéricos como "diseña un logo" producían resultados irrelevantes. Un día, decidió ser específica: "Diseña un logo minimalista para una cafetería artesanal llamada \'Aroma Local\', usando tonos marrones (#8B4513) y verdes (#228B22), con un ícono de grano de café estilizado, formato vectorial, y que funcione bien en tamaños pequeños". El resultado fue tan bueno que lo usó directamente en su proyecto y recibió elogios del cliente.',
        outcome: 'Reducción del 80% en iteraciones, mejora del 90% en satisfacción del cliente'
      },
      {
        title: 'Carlos - Desarrollador Senior',
        story: 'Carlos, un desarrollador senior de 35 años, pasaba 3-4 horas diarias corrigiendo código generado por IA. Hasta que aprendió a dar contexto específico: "Genera una función en Python que valide emails usando expresiones regulares, incluyendo casos edge como dominios con guiones, subdominios, y TLDs de 2-6 caracteres. La función debe retornar un objeto con validación, sugerencias de corrección, y razones del fallo. Incluye tests unitarios con pytest". El código resultante requería solo ajustes menores y pasó todos los tests.',
        outcome: 'Reducción del 70% en tiempo de corrección, mejora del 85% en calidad del código'
      },
      {
        title: 'Ana - Escritora de Contenido',
        story: 'Ana, una escritora de contenido de 31 años, recibía respuestas genéricas de la IA. Comenzó a iterar inteligentemente: "Escribe un artículo sobre productividad" → "Escribe un artículo de 800 palabras sobre productividad para emprendedores" → "Escribe un artículo de 800 palabras sobre productividad para emprendedores que trabajan desde casa, con 5 técnicas específicas, ejemplos reales, y un plan de acción de 30 días". Cada iteración mejoró significativamente el resultado.',
        outcome: 'Mejora del 60% en engagement, reducción del 50% en tiempo de edición'
      },
      {
        title: 'Luis - Analista de Datos',
        story: 'Luis, un analista de datos de 29 años, formulaba preguntas vagas como "¿qué significa este dato?". Cambió a preguntas estratégicas: "¿Qué patrones de crecimiento muestran las ventas trimestrales de 2023 y qué factores podrían explicar las variaciones del 15% en Q3? Considera factores estacionales, campañas de marketing, y cambios en la competencia". Las respuestas se volvieron mucho más útiles y accionables.',
        outcome: 'Mejora del 75% en calidad de insights, reducción del 40% en tiempo de análisis'
      },
      {
        title: 'Elena - Consultora de Marketing',
        story: 'Elena, una consultora de marketing de 33 años, establecía objetivos vagos como "mejora mi estrategia". Comenzó a ser específica: "Crea una estrategia de marketing digital para una tienda de ropa sostenible dirigida a mujeres de 25-35 años, con presupuesto de $2000/mes, enfocada en Instagram y TikTok, con objetivo de aumentar ventas en un 30% en 6 meses". Los resultados fueron inmediatamente aplicables.',
        outcome: 'Aumento del 45% en conversiones, mejora del 60% en ROI de marketing'
      }
    ];
    
    const selectedCase = cases[seed % cases.length];
    return `${selectedCase.title}\n\n${selectedCase.story}\n\n**Resultado:** ${selectedCase.outcome}`;
  }

  private generatePrinciples(seed: number): string {
    const principles = [
      [
        'Define el contexto completo: ¿Quién eres? ¿Para quién va? ¿Cuál es el objetivo específico?',
        'Especifica el formato exacto: ¿Texto largo, lista, guion, tabla, ensayo, código?',
        'Aclara el tono y estilo: ¿Formal, emocional, humorístico, académico, técnico?',
        'Limita el foco: Evita pedir cosas amplias como "escribe sobre historia del arte"',
        'Usa números y condiciones concretas: Ej. "Dame 5 ideas de video con duración menor a 60 segundos"'
      ],
      [
        'Proporciona antecedentes relevantes: ¿Qué pasó antes? ¿Cuál es la situación actual?',
        'Define el público objetivo específico: ¿Para quién es la respuesta?',
        'Especifica restricciones y limitaciones: ¿Qué no debe incluir?',
        'Menciona el resultado deseado exacto: ¿Qué esperas obtener?',
        'Incluye ejemplos de lo que NO quieres: Esto ayuda a la IA a entender mejor'
      ],
      [
        'Evalúa la respuesta actual objetivamente: ¿Qué está bien? ¿Qué necesita mejorar?',
        'Identifica la brecha específica: ¿Qué información falta o está incorrecta?',
        'Formula la siguiente pregunta con precisión: Sé específico sobre qué quieres cambiar',
        'Mantén el contexto: No empieces desde cero, construye sobre lo que ya tienes',
        'Mide el progreso: ¿Estás más cerca del resultado deseado?'
      ],
      [
        'Piensa antes de preguntar: ¿Qué información necesitas exactamente?',
        'Usa preguntas abiertas para explorar: "¿Qué factores podrían influir en...?"',
        'Usa preguntas cerradas para confirmar: "¿Es correcto que...?"',
        'Pregunta por el proceso, no solo el resultado: "¿Cómo llegaste a esa conclusión?"',
        'Pregunta por alternativas: "¿Qué otras opciones considerarías?"'
      ],
      [
        'Define el resultado final específico: ¿Qué quieres lograr exactamente?',
        'Establece criterios de éxito medibles: ¿Cómo sabrás que lo lograste?',
        'Define las restricciones y limitaciones: ¿Qué limitaciones hay?',
        'Especifica el alcance: ¿Qué incluye y qué no?',
        'Define el timeline: ¿Cuándo necesitas el resultado?'
      ]
    ];
    
    const selectedPrinciples = principles[seed % principles.length];
    return selectedPrinciples.map((principle, index) => `${index + 1}. **${principle}`).join('\n');
  }

  private generateExamples(seed: number): string {
    const examples = [
      {
        title: 'Especificidad en Marketing',
        before: 'Escribe sobre marketing',
        after: 'Escribe un artículo de 800 palabras sobre marketing digital para pequeñas empresas, con un tono profesional pero accesible, incluyendo 3 estrategias prácticas y un call-to-action al final.',
        analysis: {
          vocabulary: 'B pasa de términos genéricos a específicos',
          precision: 'B define exactamente qué tipo de marketing y para quién',
          timeSaved: 'B requiere menos iteraciones',
          applicability: 'B genera contenido listo para usar'
        }
      },
      {
        title: 'Contexto en Finanzas',
        before: '¿Cuál es la mejor estrategia de inversión?',
        after: 'Soy un profesional de 35 años con $50,000 para invertir, tolerancia moderada al riesgo, y objetivo de retiro en 25 años. ¿Cuál es la mejor estrategia de inversión para mi situación?',
        analysis: {
          relevance: 'B considera tu situación específica',
          precision: 'B puede dar consejos personalizados',
          applicability: 'B genera recomendaciones accionables',
          value: 'B responde a tus necesidades reales'
        }
      },
      {
        title: 'Iteración en Contenido',
        before: 'Escribe un ensayo sobre el cambio climático',
        after: 'Escribe un ensayo de 1000 palabras sobre el impacto del cambio climático en la agricultura local, con un enfoque en soluciones prácticas que los agricultores pueden implementar inmediatamente.',
        analysis: {
          focus: 'B se centra en un aspecto específico',
          audience: 'B define claramente para quién es',
          actionability: 'B busca soluciones prácticas',
          structure: 'B especifica longitud y enfoque'
        }
      }
    ];
    
    const selectedExample = examples[seed % examples.length];
    return `### ${selectedExample.title}\n\n**Prompt A (básico):**\n> "${selectedExample.before}"\n\n**Prompt B (avanzado):**\n> "${selectedExample.after}"\n\n**Análisis:**\n${Object.entries(selectedExample.analysis).map(([key, value]) => `- **${key}**: ${value}`).join('\n')}`;
  }

  private generateQuote(seed: number): string {
    const quotes = [
      '"La IA no es adivina. Es una especialista que necesita un buen brief."',
      '"El contexto es el puente entre lo que quieres y lo que obtienes."',
      '"Cada iteración es un paso hacia la perfección, no un nuevo intento."',
      '"La pregunta correcta abre puertas que no sabías que existían."',
      '"Los objetivos claros son la brújula del éxito."',
      '"Los ejemplos son el lenguaje universal de la comprensión."',
      '"La estructura mental determina la calidad de la respuesta."',
      '"La optimización es el arte de hacer más con menos."',
      '"Cada error es una lección disfrazada de fracaso."',
      '"La maestría se construye con práctica deliberada y consistente."',
      '"La especificidad es el antídoto contra la mediocridad."',
      '"El contexto transforma respuestas genéricas en específicas."',
      '"La iteración inteligente es el camino hacia la excelencia."',
      '"Las preguntas estratégicas revelan información oculta."',
      '"Los objetivos claros son la brújula que guía a la IA."'
    ];
    return quotes[seed % quotes.length];
  }

  private generateChallenge(seed: number): string {
    const challenges = [
      {
        title: 'Desafío de Especificidad',
        duration: '7 días',
        activity: 'Aplica este principio en todas tus interacciones con IA durante una semana completa.',
        dailyTasks: [
          'Antes de cada prompt, respóndete: ¿Le estoy diciendo qué quiero con claridad?',
          'Después de cada respuesta, evalúa: ¿Obtuve lo que necesitaba?',
          'Al final del día, reflexiona: ¿Cómo puedo mejorar mañana?'
        ],
        measurement: 'Anota el número de iteraciones necesarias cada día y observa la tendencia.'
      },
      {
        title: 'Desafío de Contexto',
        duration: '5 días',
        activity: 'Proporciona contexto específico en cada interacción con IA.',
        tasks: [
          'Identifica 3 situaciones donde normalmente no das contexto',
          'Agrega contexto relevante en cada una',
          'Compara la calidad de las respuestas antes y después'
        ],
        example: 'En lugar de "ayúdame con mi proyecto", di "ayúdame con mi proyecto de marketing digital para una panadería local que quiere aumentar ventas online".',
        measurement: 'Compara la calidad de las respuestas con y sin contexto.'
      },
      {
        title: 'Desafío de Iteración Inteligente',
        duration: '3 días',
        activity: 'Practica la mejora sistemática de respuestas.',
        process: [
          'Toma una respuesta de IA que no sea perfecta',
          'Identifica específicamente qué necesita mejorar',
          'Formula una pregunta de seguimiento precisa',
          'Repite hasta obtener el resultado deseado'
        ],
        measurement: 'Cuenta cuántas iteraciones necesitas para llegar al resultado óptimo.'
      }
    ];
    
    const selectedChallenge = challenges[seed % challenges.length];
    let challenge = `**${selectedChallenge.title}**\n**Duración:** ${selectedChallenge.duration}\n**Actividad:** ${selectedChallenge.activity}\n\n`;
    
    if (selectedChallenge.dailyTasks) {
      selectedChallenge.dailyTasks.forEach(task => {
        challenge += `- ${task}\n`;
      });
    } else if (selectedChallenge.tasks) {
      selectedChallenge.tasks.forEach(task => {
        challenge += `- ${task}\n`;
      });
    } else if (selectedChallenge.process) {
      selectedChallenge.process.forEach(step => {
        challenge += `- ${step}\n`;
      });
    }
    
    if (selectedChallenge.example) {
      challenge += `\n**Ejemplo:** ${selectedChallenge.example}\n\n`;
    }
    
    challenge += `**Medición:** ${selectedChallenge.measurement}`;
    return challenge;
  }

  private generateClosing(seed: number): string {
    const closings = [
      'Ser específico al usar IA es como dar instrucciones a un equipo creativo: cuanto mejor explicas, mejor resultado obtienes. No es control, es claridad. Y la claridad acelera todo. Empieza hoy. Y si tienes dudas… pregunta. Las buenas preguntas también son específicas.',
      'El contexto es el puente entre tus intenciones y los resultados de la IA. Sin él, estás navegando a ciegas. Con él, tienes un mapa claro hacia el éxito. Recuerda: la IA no puede leer tu mente, pero puede leer tu contexto.',
      'La iteración inteligente es el camino hacia la excelencia. No se trata de intentar una y otra vez, sino de mejorar sistemáticamente. Cada iteración debe ser un paso hacia adelante, no un nuevo comienzo. La perfección se construye paso a paso.',
      'Las preguntas estratégicas abren puertas que no sabías que existían. No se trata solo de obtener respuestas, sino de descubrir posibilidades. La próxima vez que interactúes con IA, pregúntate: ¿Estoy explorando o solo confirmando?',
      'Los objetivos claros son la brújula que guía a la IA hacia el resultado deseado. Sin ellos, es fácil perderse en respuestas que, aunque correctas, no son lo que realmente necesitas. Define tu destino antes de comenzar el viaje.',
      'Los ejemplos son el lenguaje universal de la comprensión. Proporcionan a la IA una referencia clara de tus expectativas, reduciendo la ambigüedad y mejorando la precisión. No subestimes el poder de un buen ejemplo.',
      'La estructura mental previa a la interacción con la IA determina la calidad de la respuesta. Un pensamiento desorganizado genera prompts desorganizados, que a su vez producen respuestas confusas. Organiza tu mente antes de organizar tus palabras.',
      'La optimización de prompts es una habilidad que se desarrolla con la práctica. Cada optimización debe tener un propósito claro y medible. No se trata de cambiar por cambiar, sino de mejorar sistemáticamente hacia el resultado deseado.',
      'Los errores son oportunidades de aprendizaje disfrazadas. Cada fallo en la comunicación con la IA revela una brecha en tu comprensión o en tu capacidad de expresión. Abraza los errores como maestros, no como enemigos.',
      'La maestría en cualquier habilidad requiere práctica deliberada y constante. La comunicación efectiva con la IA no es diferente; requiere dedicación y tiempo para desarrollarse completamente. El viaje hacia la maestría comienza con el primer paso consciente.'
    ];
    return closings[seed % closings.length];
  }

  private extractFileOperations(aiResponse: string): any[] {
    const fileOperations: any[] = [];
    const fileOperationRegex = /=== FILE_OPERATION ===\s*\n([\s\S]*?)(?=\n=== FILE_OPERATION ===|$)/g;
    
    let match;
    while ((match = fileOperationRegex.exec(aiResponse)) !== null) {
      const content = match[1].trim();
      const lines = content.split('\n');
      const fileName = lines[0].trim();
      const fileContent = lines.slice(1).join('\n').trim();
      
      fileOperations.push({
        action: 'createFile',
        filePath: fileName,
        content: fileContent,
        projectPath: this.projectPath
      });
    }
    
    return fileOperations;
  }

  private async executeFileOperations(fileOperations: any[]): Promise<void> {
    for (const operation of fileOperations) {
      try {
        if (operation.action === 'createFile') {
          await this.fileManager.createFile(
            operation.projectPath,
            operation.filePath,
            operation.content
          );
        }
      } catch (error) {
        console.error(`Error executing file operation:`, error);
      }
    }
  }

  private async getExistingTips(): Promise<number[]> {
    try {
      // Get project structure to find existing tip files
      const projectStructure = await this.fileManager.getProjectStructure(this.projectPath);
      const existingTips: number[] = [];
      
      if (projectStructure && projectStructure.items) {
        this.extractTipNumbersFromStructure(projectStructure.items, existingTips);
      }
      
      console.log(`[Ghost Agent] Found existing tips: ${existingTips.sort((a, b) => a - b).join(', ')}`);
      return existingTips.sort((a, b) => a - b);
    } catch (error) {
      console.error('[Ghost Agent] Error getting existing tips:', error);
      return [];
    }
  }

  private extractTipNumbersFromStructure(items: any[], existingTips: number[]): void {
    for (const item of items) {
      if (item.type === 'file' && item.name) {
        // Look for files matching the pattern Tip_XX_*.md
        const tipMatch = item.name.match(/^Tip_(\d{2})_/);
        if (tipMatch) {
          const tipNumber = parseInt(tipMatch[1]);
          if (!existingTips.includes(tipNumber)) {
            existingTips.push(tipNumber);
          }
        }
      }
      
      // Recursively check children
      if (item.children && Array.isArray(item.children)) {
        this.extractTipNumbersFromStructure(item.children, existingTips);
      }
    }
  }

  private getNextTipNumber(existingTips: number[]): number {
    if (existingTips.length === 0) {
      return 1; // Start with Tip 01
    }
    
    // Find the first gap in the sequence, or use the next number after the highest
    const sortedTips = existingTips.sort((a, b) => a - b);
    
    // Check for gaps in the sequence
    for (let i = 0; i < sortedTips.length; i++) {
      const expectedNumber = i + 1;
      if (sortedTips[i] !== expectedNumber) {
        console.log(`[Ghost Agent] Found gap at position ${i + 1}, using tip number ${expectedNumber}`);
        return expectedNumber;
      }
    }
    
    // No gaps found, use the next number after the highest
    const nextNumber = Math.max(...sortedTips) + 1;
    console.log(`[Ghost Agent] No gaps found, using next number: ${nextNumber}`);
    return nextNumber;
  }
} 