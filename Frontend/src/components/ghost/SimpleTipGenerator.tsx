"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, Loader2, FileText, Lightbulb, Play } from "lucide-react";

interface ProjectFile {
  name: string;
  path: string;
  content?: string;
}

interface SimpleContentGeneratorProps {
  projectPath: string;
  projectFiles: ProjectFile[];
  onContentGenerated: () => void;
}

interface GenerationResult {
  success: boolean;
  message: string;
  filesCreated?: string[];
  errors?: string[];
}

export const SimpleContentGenerator: React.FC<SimpleContentGeneratorProps> = ({
  projectPath,
  projectFiles,
  onContentGenerated
}) => {
  const [exampleFile, setExampleFile] = useState<string>('');
  const [ideasFile, setIdeasFile] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [availableFiles, setAvailableFiles] = useState<ProjectFile[]>([]);

  // Load file content when files change
  useEffect(() => {
    const loadFileContent = async () => {
      if (!projectPath) return;

      try {
        const response = await fetch(`/api/unified-file-operations?projectPath=${encodeURIComponent(projectPath)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.structure) {
            // Convert structure to ProjectFile format with content
            const filesWithContent = await Promise.all(
              data.structure.items
                .filter((item: any) => item.type === 'file' && item.name.endsWith('.md'))
                .map(async (item: any) => {
                  try {
                    // Get file content
                    const contentResponse = await fetch('/api/unified-file-operations', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        action: 'getContent',
                        projectPath: projectPath,
                        filePath: item.name
                      })
                    });
                    
                    let content = '';
                    if (contentResponse.ok) {
                      const contentData = await contentResponse.json();
                      content = contentData.content || '';
                    }

                    return {
                      name: item.name,
                      path: item.name,
                      content: content
                    };
                  } catch (error) {
                    console.error(`Error loading content for ${item.name}:`, error);
                    return {
                      name: item.name,
                      path: item.name,
                      content: ''
                    };
                  }
                })
            );
            
            setAvailableFiles(filesWithContent);
          }
        }
      } catch (error) {
        console.error('Error loading project files:', error);
      }
    };

    loadFileContent();
  }, [projectPath]);

  // Filter files for different purposes
  const exampleFiles = availableFiles.filter(file => 
    file.name.match(/^\d+/) || // Files starting with numbers
    file.name.includes('ejemplo') || 
    file.name.includes('example') ||
    file.name.includes('template') ||
    file.content && file.content.length > 500 // Files with substantial content
  );

  const ideasFiles = availableFiles.filter(file => 
    file.name.includes('101') || 
    file.name.includes('tips') || 
    file.name.includes('ideas') ||
    file.name.includes('list') ||
    file.name.includes('outline') ||
    file.name.includes('plan')
  );

  const handleGenerateContent = async () => {
    if (!exampleFile || !ideasFile) {
      setResult({
        success: false,
        message: 'Por favor selecciona un archivo de ejemplo y un archivo con ideas',
        errors: ['Missing required files']
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setResult(null);

    try {
      // Find the selected files
      const exampleFileData = availableFiles.find(f => f.name === exampleFile);
      const ideasFileData = availableFiles.find(f => f.name === ideasFile);

      if (!exampleFileData || !ideasFileData) {
        throw new Error('Archivos no encontrados');
      }

      if (!exampleFileData.content || !ideasFileData.content) {
        throw new Error('Los archivos seleccionados no tienen contenido');
      }

      setProgress(25);

      // Create the prompt
      const prompt = `Crea nuevo contenido siguiendo el formato del archivo de ejemplo.

ARCHIVO DE EJEMPLO (formato, tono, estructura):
${exampleFileData.content}

ARCHIVO DE IDEAS (contenido a crear):
${ideasFileData.content}

INSTRUCCIONES:
1. Analiza el formato del archivo de ejemplo
2. Lee las descripciones en el archivo de ideas
3. Crea nuevos archivos siguiendo el formato del ejemplo
4. Usa el formato === FILE_OPERATION === para crear cada archivo
5. Mantén el mismo estilo, tono y estructura del ejemplo

Proyecto: ${projectPath}
Idioma: Español`;

      setProgress(50);

      // Send to AI agent
      const response = await fetch('/api/ai/ghost-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          projectPath: projectPath,
          contexts: [{
            path: projectPath,
            title: projectPath.split('/').pop() || 'Project'
          }]
        }),
      });

      setProgress(75);

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setProgress(100);

      const success = data.fileOperations && data.fileOperations.length > 0;
      const filesCreated = data.fileOperations?.map((op: any) => op.filePath).filter(Boolean) || [];

      setResult({
        success,
        message: success 
          ? `¡Éxito! Se crearon ${filesCreated.length} archivos`
          : 'No se detectaron operaciones de archivos. Verifica que el agente use el formato FILE_OPERATION',
        filesCreated,
        errors: success ? undefined : ['No file operations detected']
      });

      if (success) {
        onContentGenerated();
      }

    } catch (error) {
      console.error('Error generating content:', error);
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setExampleFile('');
    setIdeasFile('');
    setResult(null);
    setProgress(0);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          Generador de Contenido
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Step 1: Select Example File */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <FileText className="w-4 h-4" />
            1. Selecciona el archivo de ejemplo (formato, tono, estructura)
          </label>
          <Select value={exampleFile} onValueChange={setExampleFile}>
            <SelectTrigger>
              <SelectValue placeholder="Elige un archivo de ejemplo..." />
            </SelectTrigger>
            <SelectContent>
              {exampleFiles.map((file) => (
                <SelectItem key={file.name} value={file.name}>
                  {file.name} {file.content ? `(${file.content.length} chars)` : '(sin contenido)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {exampleFile && (
            <p className="text-xs text-muted-foreground">
              ✅ Archivo seleccionado: {exampleFile}
            </p>
          )}
        </div>

        {/* Step 2: Select Ideas File */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            2. Selecciona el archivo con las ideas/contenido a crear
          </label>
          <Select value={ideasFile} onValueChange={setIdeasFile}>
            <SelectTrigger>
              <SelectValue placeholder="Elige un archivo con ideas..." />
            </SelectTrigger>
            <SelectContent>
              {ideasFiles.map((file) => (
                <SelectItem key={file.name} value={file.name}>
                  {file.name} {file.content ? `(${file.content.length} chars)` : '(sin contenido)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {ideasFile && (
            <p className="text-xs text-muted-foreground">
              ✅ Archivo seleccionado: {ideasFile}
            </p>
          )}
        </div>

        {/* Step 3: Generate Button */}
        <div className="pt-4">
          <Button 
            onClick={handleGenerateContent}
            disabled={!exampleFile || !ideasFile || isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generando Contenido...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Generar Contenido
              </>
            )}
          </Button>
        </div>

        {/* Progress Bar */}
        {isGenerating && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-xs text-center text-muted-foreground">
              {progress < 25 && 'Preparando archivos...'}
              {progress >= 25 && progress < 50 && 'Analizando formato...'}
              {progress >= 50 && progress < 75 && 'Generando contenido...'}
              {progress >= 75 && 'Finalizando...'}
            </p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className={`p-4 rounded-lg border ${
            result.success 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-start gap-2">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-medium">{result.message}</p>
                {result.filesCreated && result.filesCreated.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Archivos creados:</p>
                    <ul className="text-sm list-disc list-inside mt-1">
                      {result.filesCreated.map((file, index) => (
                        <li key={index}>{file}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.errors && result.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Errores:</p>
                    <ul className="text-sm list-disc list-inside mt-1">
                      {result.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <Button 
              onClick={resetForm}
              variant="outline" 
              size="sm" 
              className="mt-3"
            >
              Generar más contenido
            </Button>
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded">
          <p className="font-medium mb-1">¿Cómo funciona?</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Selecciona un archivo que tenga el formato que quieres copiar</li>
            <li>Selecciona un archivo que contenga las ideas/contenido a crear</li>
            <li>El sistema creará nuevos archivos siguiendo el formato del ejemplo</li>
          </ol>
          <p className="mt-2 text-xs">
            <strong>Ejemplo:</strong> Usa "01 – BePolite.md" como ejemplo y "101 Tips.md" como ideas para generar más tips.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}; 