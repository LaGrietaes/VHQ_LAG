"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  Settings,
  Zap,
  Upload,
  BookOpen,
  List,
  FolderPlus
} from "lucide-react";

interface SmartBookGeneratorProps {
  projectPath: string;
  onBack: () => void;
}

export function SmartBookGenerator({ projectPath, onBack }: SmartBookGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentItem, setCurrentItem] = useState('');
  const [results, setResults] = useState<{ completed: number; errors: number; pending: number }>({
    completed: 0,
    errors: 0,
    pending: 0
  });

  // Configuration state
  const [formatExample, setFormatExample] = useState('');
  const [topicsList, setTopicsList] = useState('');
  const [outputFolder, setOutputFolder] = useState('Generated_Content');
  const [bookTitle, setBookTitle] = useState('');

  // Step-by-step generation
  const [currentStep, setCurrentStep] = useState<'setup' | 'generating' | 'complete'>('setup');

  // Load format example from file
  const loadFormatExample = async () => {
    try {
      const response = await fetch('/api/projects/file-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectPath: projectPath,
          filePath: 'Ejemplos e Ideas/01 – BePolite_ Ser educado con la IA.md'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFormatExample(data.content);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading format example:', error);
      return false;
    }
  };

  // Load topics list from file
  const loadTopicsList = async () => {
    try {
      const response = await fetch('/api/projects/file-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectPath: projectPath,
          filePath: '101 Tips para Hablar con la IA.md'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTopicsList(data.content);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading topics list:', error);
      return false;
    }
  };

  // Create output directory
  const createOutputDirectory = async () => {
    try {
      const response = await fetch('/api/unified-file-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createFolder',
          projectPath: 'Boceto_101_Tips_para_Hablar_con_la_IA',
          folderName: outputFolder
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error creating directory:', error);
      return false;
    }
  };

  // Generate a single item
  const generateItem = async (itemNumber: number, itemTitle: string, itemDescription: string) => {
    // First, get content from the agent
    const command = `Basándote en este formato de ejemplo:

=== FORMATO EJEMPLO ===
${formatExample}
=== FIN FORMATO ===

Y esta información del item a generar:
- Número: ${itemNumber}
- Título: ${itemTitle}
- Descripción: ${itemDescription}

Crea el contenido siguiendo EXACTAMENTE el formato del ejemplo, pero adaptado al título y descripción proporcionados.

IMPORTANTE: Responde SOLO con el contenido del archivo. NO uses FILE_OPERATION, NO uses JSON. SOLO el contenido del archivo en formato Markdown.`;

    try {
      // Get content from agent
      const agentResponse = await fetch('/api/ai/ghost-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: command,
          projectPath: projectPath
        }),
      });

      if (!agentResponse.ok) {
        throw new Error('Agent failed to generate content');
      }

      const agentData = await agentResponse.json();
      const content = agentData.response;

      // Create file using direct API
      const fileResponse = await fetch('/api/unified-file-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createFile',
          projectPath: 'Boceto_101_Tips_para_Hablar_con_la_IA',
          fileName: `${outputFolder}/Item_${itemNumber.toString().padStart(2, '0')}_${itemTitle.replace(/[^a-zA-Z0-9]/g, '_')}.md`,
          content: content
        }),
      });

      return fileResponse.ok;
    } catch (error) {
      console.error('Error generating item:', error);
      return false;
    }
  };

  // Parse topics from the list
  const parseTopics = (content: string) => {
    const lines = content.split('\n');
    const topics = [];
    let currentNumber = 1;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/^\d+\./)) {
        // Extract title from numbered line
        const title = trimmed.replace(/^\d+\.\s*/, '');
        if (title) {
          topics.push({
            id: currentNumber,
            title: title,
            description: `Item ${currentNumber}: ${title}`
          });
          currentNumber++;
        }
      }
    }

    return topics;
  };

  // Generate all items
  const generateAllItems = async () => {
    if (!formatExample || !topicsList) {
      alert('Por favor, carga el formato de ejemplo y la lista de temas primero.');
      return;
    }

    setIsGenerating(true);
    setCurrentStep('generating');
    setProgress(0);
    
    // Parse topics
    const topics = parseTopics(topicsList);
    setResults({ completed: 0, errors: 0, pending: topics.length });

    // Create output directory
    setCurrentItem('Creando directorio de salida...');
    const directoryCreated = await createOutputDirectory();
    
    if (!directoryCreated) {
      setCurrentItem('Error: No se pudo crear el directorio de salida');
      setIsGenerating(false);
      return;
    }

    let completed = 0;
    let errors = 0;

    for (const topic of topics) {
      setCurrentItem(`Generando Item ${topic.id}: ${topic.title}`);
      
      const success = await generateItem(topic.id, topic.title, topic.description);
      
      if (success) {
        completed++;
      } else {
        errors++;
      }

      const currentProgress = ((completed + errors) / topics.length) * 100;
      setProgress(currentProgress);
      setResults({
        completed,
        errors,
        pending: topics.length - completed - errors
      });

      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsGenerating(false);
    setCurrentStep('complete');
    setCurrentItem('Generación completada');
  };

  // Generate test item
  const generateTestItem = async () => {
    if (!formatExample) {
      alert('Por favor, carga el formato de ejemplo primero.');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setResults({ completed: 0, errors: 0, pending: 1 });

    // Create output directory
    setCurrentItem('Creando directorio de salida...');
    const directoryCreated = await createOutputDirectory();
    
    if (!directoryCreated) {
      setCurrentItem('Error: No se pudo crear el directorio de salida');
      setIsGenerating(false);
      return;
    }

    setCurrentItem('Generando item de prueba...');
    const success = await generateItem(99, 'Item de Prueba', 'Este es un item de prueba para verificar el formato');

    if (success) {
      setResults({ completed: 1, errors: 0, pending: 0 });
      setCurrentItem('Item de prueba generado exitosamente');
    } else {
      setResults({ completed: 0, errors: 1, pending: 0 });
      setCurrentItem('Error al generar item de prueba');
    }

    setIsGenerating(false);
  };

  return (
    <div className="w-full h-full flex flex-col bg-background text-foreground p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-2">
            ← Volver
          </Button>
          <h1 className="text-2xl font-bold text-primary">Smart Book Generator</h1>
          <p className="text-muted-foreground">Generador inteligente y flexible para cualquier tipo de libro</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Setup Section */}
        {currentStep === 'setup' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Configuración del Proyecto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Título del Libro</label>
                  <Input
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    placeholder="Ej: 101 Tips para Hablar con la IA"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Carpeta de Salida</label>
                  <Input
                    value={outputFolder}
                    onChange={(e) => setOutputFolder(e.target.value)}
                    placeholder="Generated_Content"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Formato de Ejemplo</label>
                  <div className="flex gap-2 mb-2">
                    <Button onClick={loadFormatExample} variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Cargar desde archivo
                    </Button>
                  </div>
                  <Textarea
                    value={formatExample}
                    onChange={(e) => setFormatExample(e.target.value)}
                    placeholder="Pega aquí el contenido del archivo de ejemplo (formato a seguir)..."
                    rows={8}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Lista de Temas/Items</label>
                  <div className="flex gap-2 mb-2">
                    <Button onClick={loadTopicsList} variant="outline" size="sm">
                      <List className="w-4 h-4 mr-2" />
                      Cargar desde archivo
                    </Button>
                  </div>
                  <Textarea
                    value={topicsList}
                    onChange={(e) => setTopicsList(e.target.value)}
                    placeholder="Pega aquí la lista de temas o items a generar (uno por línea)..."
                    rows={6}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={generateTestItem} variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Generar Item de Prueba
                </Button>
                <Button onClick={generateAllItems} className="flex-1">
                  <Play className="w-4 h-4 mr-2" />
                  Generar Todos los Items
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
              <p className="text-sm text-muted-foreground">{currentItem}</p>
              
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
        {currentStep === 'complete' && (
          <Card>
            <CardHeader>
              <CardTitle>Resultados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
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
              
              <div className="space-y-2">
                <p><strong>Archivos generados en:</strong> <code>{projectPath}/{outputFolder}/</code></p>
                <p><strong>Formato de archivos:</strong> <code>Item_01_Titulo.md</code></p>
              </div>
              
              <div className="mt-4 flex gap-2">
                <Button onClick={onBack} variant="outline">
                  Ver archivos generados
                </Button>
                <Button onClick={() => setCurrentStep('setup')}>
                  Nuevo proyecto
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
            <p>1. <strong>Configura:</strong> Define el título del libro y carpeta de salida</p>
            <p>2. <strong>Formato:</strong> Carga o pega un ejemplo del formato que quieres seguir</p>
            <p>3. <strong>Lista:</strong> Carga o pega la lista de temas/items a generar</p>
            <p>4. <strong>Genera:</strong> Usa "Item de Prueba" para verificar, luego "Generar Todos"</p>
            <p>5. <strong>Resultado:</strong> Archivos creados en la carpeta especificada</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 