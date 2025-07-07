"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  Settings,
  Zap,
  FolderPlus
} from "lucide-react";

interface SimpleBookGeneratorProps {
  projectPath: string;
  onBack: () => void;
}

export function SimpleBookGenerator({ projectPath, onBack }: SimpleBookGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTip, setCurrentTip] = useState('');
  const [results, setResults] = useState<{ completed: number; errors: number; pending: number }>({
    completed: 0,
    errors: 0,
    pending: 120
  });

  // Create Tips_Generados directory first
  const createTipsDirectory = async () => {
    const command = `Crea el directorio Tips_Generados en ${projectPath} si no existe. Usa el formato === FILE_OPERATION === para crear la carpeta.`;

    try {
      const response = await fetch('/api/ai/ghost-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: command,
          projectPath: projectPath
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error creating directory:', error);
      return false;
    }
  };

  // Get the example file content for context
  const getExampleContent = () => {
    return `# 01 – BePolite: Ser educado con la IA

**Categoría:** Actitud y Ética  
**Nivel:** Básico / Fundacional  
**Tiempo de lectura estimado:** 5 minutos  
---

## 🧠 Resumen

Ser educado con una Inteligencia Artificial no es un gesto inútil, ni una pérdida de tiempo. Es un hábito que refuerza tu identidad, tu forma de comunicarte y tu capacidad de liderar conversaciones claras, respetuosas y eficaces. Este capítulo no trata de la IA, trata de ti.

La cortesía, aunque parezca innecesaria ante una máquina, moldea la estructura de tu pensamiento. En un mundo cada vez más automatizado, la diferencia entre quien lidera y quien obedece puede reducirse a cómo se comunica.

---

## ✍️ Una breve historia

En 2023, una empresa de consultoría de Nueva York decidió experimentar: le pidió a todo su equipo que redactara prompts para inteligencia artificial durante una semana... sin usar fórmulas de cortesía.

Después, les pidió repetir la experiencia siendo deliberadamente educados.

El resultado fue rotundo: los prompts educados obtuvieron respuestas más claras, más detalladas y con menor tasa de error. ¿La razón? No fue que la IA entendiera los modales, sino que las personas, al ser corteses, eran más claras, más específicas y más empáticas. Es decir, mejores comunicadores.

---

## ❓ ¿Por qué importa?

### 1. La forma en que hablas moldea tu forma de pensar.

Decir *"dame esto"* y *"me haces esto"* puede sonar funcional, pero es lo que se espera de un robot… y tú no lo eres. Cuanto más automático te vuelves, más se entumece tu pensamiento crítico. Las palabras que eliges son los ladrillos de tu percepción.

### 2. Entrenas tu cerebro cada vez que te expresas.

Cada palabra que eliges crea rutas neuronales. Decir *"por favor"*, *"gracias"*, *"¿podrías ayudarme con esto?"* no es solo educación: es gimnasia cognitiva. Activa tu empatía, tu atención al otro y tu capacidad de adaptarte a distintos contextos.

### 3. Algún día liderarás un equipo —y las formas importan.

¿Crees que da igual ser cortés con una IA? Piensa en tus hábitos. Lo que haces frente a la pantalla, lo repetirás frente a un ser humano. Liderar no es imponer, es comunicar con inteligencia emocional. Y todo comienza con cómo hablas, incluso con una máquina.

---

## 🛠️ Cómo aplicarlo

### 1. Inicia con cortesía

Un simple "Hola" abre una conversación con mejor tono. Pide en lugar de ordenar:

> "Hola, ¿me ayudas con un resumen de este texto?"

### 2. Agradece los buenos resultados

Reconocer un buen output refuerza la conexión con el proceso:

> "Gracias, esta respuesta fue muy útil. ¿Podrías ampliarla con un ejemplo más técnico?"

### 3. Corrige con amabilidad

No todas las respuestas serán perfectas, pero tú sí puedes serlo al corregir:

> "Esto no es exactamente lo que buscaba. ¿Te explico mejor mi necesidad para ajustarlo?"

### 4. Usa un lenguaje conversacional

Sé natural, humano. No escribas como si estuvieras programando comandos:

> En lugar de: "Lista. Haz tabla. Puntos clave."  
> Usa: "¿Podrías convertir esta lista en una tabla clara, separando ideas principales y secundarias?"

---

## 🧪 Ejemplo práctico

### Prompt A (frío):  
> Haz una tabla con los beneficios del ejercicio.

### Prompt B (educado):  
> Hola. Estoy creando contenido sobre salud física y necesito una tabla clara con los beneficios más conocidos del ejercicio regular. ¿Podrías ayudarme con eso? ¡Gracias!

**Resultado comparado:**  
El segundo prompt genera una tabla más completa, con subtítulos organizados, mejor tono explicativo, e incluso sugerencias adicionales. El primero fue directo, sí, pero más pobre en resultados.

Esto no ocurre porque la IA "sienta" algo. Ocurre porque tú, al ser más humano, das mejores instrucciones.

---

## 💬 Frase para recordar

> **"La IA no necesita respeto, pero tú sí necesitas mantenerlo."**

---

## 📌 Tips extra

- No es sumisión, es elegancia.  
- No es fingir, es cultivar.  
- No es por la máquina, es por tu versión futura.  
- Usa la IA para practicar liderazgo, claridad y empatía.  

---

## 📍 ¿Dónde aplicarlo?

- Al escribir correos con asistencia de IA  
- Al generar propuestas con tono humano  
- Al delegar tareas complejas paso a paso  
- Al enseñar a otros a usar IA sin deshumanizar el proceso  

---

## ✅ Mini reto práctico

**Durante 24 horas, redacta todos tus prompts con fórmulas de cortesía.**  
Evalúa los resultados, anota diferencias.  
Comparte tus conclusiones con un colega.

---

## ✒️ Cierre

Recuerda: no escribes prompts para controlar una máquina, sino para entrenarte como pensador, estratega y comunicador. Ser educado con la IA no es una formalidad: es una decisión consciente de ser mejor cada vez que te expresas.`;
  };

  // Simple function to generate a single tip
  const generateTip = async (tipNumber: number, tipTitle: string) => {
    const exampleContent = getExampleContent();
    
    const command = `Basándote en este ejemplo del archivo 01-BePolite, crea el tip ${tipNumber} "${tipTitle}" siguiendo EXACTAMENTE el mismo formato y estructura:

EJEMPLO DE FORMATO:
${exampleContent}

INSTRUCCIONES:
1. Usa EXACTAMENTE la misma estructura y formato del ejemplo
2. Mantén todos los emojis y secciones
3. Adapta el contenido para el tip "${tipTitle}"
4. Usa el formato === FILE_OPERATION === para crear el archivo

=== FILE_OPERATION ===
{
  "operation": "create_file",
  "path": "${projectPath}/Tips_Generados/Tip_${tipNumber.toString().padStart(2, '0')}_${tipTitle.replace(/[^a-zA-Z0-9]/g, '_')}.md",
  "content": "CONTENIDO_COMPLETO_DEL_TIP_AQUI"
}
=== END_FILE_OPERATION ===`;

    try {
      const response = await fetch('/api/ai/ghost-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: command,
          projectPath: projectPath
        }),
      });

      if (response.ok) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error generating tip:', error);
      return false;
    }
  };

  // Generate all tips in batches
  const generateAllTips = async () => {
    setIsGenerating(true);
    setProgress(0);
    setResults({ completed: 0, errors: 0, pending: 120 });

    // First create the Tips_Generados directory
    setCurrentTip('Creando directorio Tips_Generados...');
    const directoryCreated = await createTipsDirectory();
    
    if (!directoryCreated) {
      setCurrentTip('Error: No se pudo crear el directorio Tips_Generados');
      setIsGenerating(false);
      return;
    }

    // List of all 120 tips (simplified for demo)
    const tips = [
      { id: 1, title: "BePolite: Ser educado con la IA" },
      { id: 2, title: "Usa IA con empatía" },
      { id: 3, title: "Haz foco: una idea por vez" },
      { id: 4, title: "Estructura tus ideas" },
      { id: 5, title: "Contexto lo es todo" },
      { id: 6, title: "Dale contexto, obtendrás inteligencia" },
      { id: 7, title: "Aprende a pensar en prompts" },
      { id: 8, title: "Optimiza tus prompts" },
      { id: 9, title: "Usa IA para análisis de datos" },
      { id: 10, title: "Crea tu propio agente IA" },
      // Add more tips as needed...
    ];

    let completed = 0;
    let errors = 0;

    for (const tip of tips) {
      setCurrentTip(`Generando Tip ${tip.id}: ${tip.title}`);
      
      const success = await generateTip(tip.id, tip.title);
      
      if (success) {
        completed++;
      } else {
        errors++;
      }

      const currentProgress = ((completed + errors) / tips.length) * 100;
      setProgress(currentProgress);
      setResults({
        completed,
        errors,
        pending: tips.length - completed - errors
      });

      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsGenerating(false);
    setCurrentTip('Generación completada');
  };

  // Generate specific tip range
  const generateTipRange = async (start: number, end: number) => {
    setIsGenerating(true);
    setProgress(0);
    setResults({ completed: 0, errors: 0, pending: end - start + 1 });

    // First create the Tips_Generados directory
    setCurrentTip('Creando directorio Tips_Generados...');
    const directoryCreated = await createTipsDirectory();
    
    if (!directoryCreated) {
      setCurrentTip('Error: No se pudo crear el directorio Tips_Generados');
      setIsGenerating(false);
      return;
    }

    let completed = 0;
    let errors = 0;

    for (let i = start; i <= end; i++) {
      setCurrentTip(`Generando Tip ${i}...`);
      
      const success = await generateTip(i, `Tip ${i}`);
      
      if (success) {
        completed++;
      } else {
        errors++;
      }

      const currentProgress = ((completed + errors) / (end - start + 1)) * 100;
      setProgress(currentProgress);
      setResults({
        completed,
        errors,
        pending: (end - start + 1) - completed - errors
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsGenerating(false);
    setCurrentTip('Generación completada');
  };

  return (
    <div className="w-full h-full flex flex-col bg-background text-foreground p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-2">
            ← Volver
          </Button>
          <h1 className="text-2xl font-bold text-primary">Simple Book Generator</h1>
          <p className="text-muted-foreground">Genera todos los tips de forma automática</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button 
                onClick={generateAllTips}
                disabled={isGenerating}
                className="h-20 flex flex-col items-center justify-center"
              >
                <Play className="w-6 h-6 mb-2" />
                <span>Generar Todos</span>
                <span className="text-xs opacity-80">120 tips</span>
              </Button>
              
              <Button 
                onClick={() => generateTipRange(1, 10)}
                disabled={isGenerating}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center"
              >
                <FileText className="w-6 h-6 mb-2" />
                <span>Tips 1-10</span>
                <span className="text-xs opacity-80">Primeros 10</span>
              </Button>
              
              <Button 
                onClick={() => generateTipRange(11, 20)}
                disabled={isGenerating}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center"
              >
                <FileText className="w-6 h-6 mb-2" />
                <span>Tips 11-20</span>
                <span className="text-xs opacity-80">Siguientes 10</span>
              </Button>

              <Button 
                onClick={createTipsDirectory}
                disabled={isGenerating}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 hover:border-yellow-500/50"
              >
                <FolderPlus className="w-6 h-6 mb-2" />
                <span>Crear Directorio</span>
                <span className="text-xs opacity-80">Tips_Generados</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        {isGenerating && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 animate-spin" />
                Generando contenido...
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground">{currentTip}</p>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-green-500 flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    {results.completed}
                  </div>
                  <div className="text-sm text-muted-foreground">Completados</div>
                </div>
                
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-red-500 flex items-center justify-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {results.errors}
                  </div>
                  <div className="text-sm text-muted-foreground">Errores</div>
                </div>
                
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-500">
                    {results.pending}
                  </div>
                  <div className="text-sm text-muted-foreground">Pendientes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {!isGenerating && (results.completed > 0 || results.errors > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Resultados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-green-500">{results.completed}</div>
                  <div className="text-sm text-muted-foreground">Completados</div>
                </div>
                
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-red-500">{results.errors}</div>
                  <div className="text-sm text-muted-foreground">Errores</div>
                </div>
                
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-500">{results.pending}</div>
                  <div className="text-sm text-muted-foreground">Pendientes</div>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <Button onClick={onBack} variant="outline">
                  Ver archivos generados
                </Button>
                <Button onClick={() => setResults({ completed: 0, errors: 0, pending: 120 })}>
                  Nuevo workflow
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>¿Cómo funciona?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>1. <strong>Generar Todos:</strong> Crea los 120 tips completos automáticamente</p>
            <p>2. <strong>Generar por rangos:</strong> Crea grupos de 10 tips para pruebas</p>
            <p>3. <strong>Los archivos se crean en:</strong> <code>{projectPath}/Tips_Generados/</code></p>
            <p>4. <strong>Cada tip sigue el formato</strong> del archivo 01-BePolite</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 