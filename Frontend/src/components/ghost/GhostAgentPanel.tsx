"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, Loader2, BrainCircuit, BookOpen, Lightbulb, Play, FileText, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface GhostAgentPanelProps {
  projectPath: string;
  exampleFile?: string;
  ideasFile?: string;
  onContentGenerated: () => void;
}

interface AnalysisResult {
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
}

interface ContentType {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  examples: string[];
}

const CONTENT_TYPES: ContentType[] = [
  {
    id: 'tips_book',
    name: 'Libro de Tips',
    nameEn: 'Tips Book',
    description: 'Libro estructurado con consejos y tips prácticos',
    examples: ['101 Tips para Hablar con la IA', 'Guía de Productividad']
  },
  {
    id: 'guide_book',
    name: 'Guía/Manual',
    nameEn: 'Guide/Manual',
    description: 'Guía paso a paso o manual técnico',
    examples: ['Guía de Programación', 'Manual de Usuario']
  },
  {
    id: 'novel',
    name: 'Novela/Historia',
    nameEn: 'Novel/Story',
    description: 'Narrativa ficticia o historia',
    examples: ['Novela de Ciencia Ficción', 'Historia Corta']
  },
  {
    id: 'blog_series',
    name: 'Serie de Blog Posts',
    nameEn: 'Blog Series',
    description: 'Serie de artículos relacionados',
    examples: ['Serie de Tutoriales', 'Artículos Educativos']
  },
  {
    id: 'course_content',
    name: 'Contenido de Curso',
    nameEn: 'Course Content',
    description: 'Material educativo estructurado',
    examples: ['Curso de Marketing', 'Lecciones de Cocina']
  }
];

export const GhostAgentPanel: React.FC<GhostAgentPanelProps> = ({
  projectPath,
  exampleFile,
  ideasFile,
  onContentGenerated
}) => {
  const [currentStep, setCurrentStep] = useState<'bosquejo' | 'tipo' | 'generar'>('bosquejo');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  // Bosquejo step
  const [bosquejoResult, setBosquejoResult] = useState<AnalysisResult | null>(null);
  
  // Tipo de Contenido step
  const [selectedContentType, setSelectedContentType] = useState<string>('');
  const [detectedContentType, setDetectedContentType] = useState<ContentType | null>(null);
  const [contentTypeConfirmed, setContentTypeConfirmed] = useState(false);
  
  // Generar Contenido step
  const [generationMode, setGenerationMode] = useState<'single' | 'bulk'>('single');
  const [itemsToGenerate, setItemsToGenerate] = useState(1);
  const [bulkAmount, setBulkAmount] = useState(5);
  const [generationResults, setGenerationResults] = useState<string[]>([]);

  // Check if we can proceed to next steps
  const canProceedToTipo = bosquejoResult?.success;
  const canProceedToGenerar = contentTypeConfirmed;

  const handleBosquejo = async () => {
    if (!exampleFile || !ideasFile) {
      setResult({
        success: false,
        message: 'Necesitas marcar un archivo como ejemplo y otro como ideas',
        errors: ['Missing files']
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResult(null);

    try {
      setProgress(25);

      // Get file contents
      const exampleContent = await getFileContent(exampleFile);
      const ideasContent = await getFileContent(ideasFile);

      if (!exampleContent || !ideasContent) {
        throw new Error('No se pudo leer el contenido de los archivos');
      }

      setProgress(50);

      const prompt = `Analiza los siguientes archivos para determinar el tipo de contenido y estructura:

ARCHIVO DE EJEMPLO:
${exampleContent}

ARCHIVO DE IDEAS:
${ideasContent}

Proporciona un análisis detallado que incluya:
1. Tipo de contenido detectado
2. Estructura del ejemplo
3. Cantidad de elementos a generar
4. Recomendaciones para la generación

Responde en formato JSON:
{
  "contentType": "tips_book|guide_book|novel|blog_series|course_content",
  "structure": "descripción de la estructura",
  "estimatedItems": número,
  "recommendations": ["recomendación1", "recomendación2"]
}`;

      setProgress(75);

      const response = await fetch('/api/ai/ghost-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          projectPath: projectPath
        }),
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setProgress(100);

      // Parse the analysis result
      const analysis = parseAnalysisResult(data.aiResponse);
      
      setBosquejoResult({
        success: true,
        message: 'Análisis completado exitosamente',
        data: analysis
      });

      // Auto-detect content type
      if (analysis.contentType) {
        const detectedType = CONTENT_TYPES.find(t => t.id === analysis.contentType);
        if (detectedType) {
          setDetectedContentType(detectedType);
          setSelectedContentType(detectedType.id);
        }
      }

    } catch (error) {
      console.error('Error in bosquejo:', error);
      setBosquejoResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmContentType = () => {
    if (selectedContentType) {
      setContentTypeConfirmed(true);
      setCurrentStep('generar');
    }
  };

  const handleGenerateContent = async () => {
    if (!exampleFile || !ideasFile || !selectedContentType) {
      setResult({
        success: false,
        message: 'Configuración incompleta',
        errors: ['Missing configuration']
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResult(null);
    setGenerationResults([]);

    try {
      const exampleContent = await getFileContent(exampleFile);
      const ideasContent = await getFileContent(ideasFile);

      if (!exampleContent || !ideasContent) {
        throw new Error('No se pudo leer el contenido de los archivos');
      }

      const contentType = CONTENT_TYPES.find(t => t.id === selectedContentType);
      const amount = generationMode === 'bulk' ? bulkAmount : itemsToGenerate;

      setProgress(25);

      const prompt = `Genera ${amount} elementos de contenido siguiendo el formato del ejemplo.

TIPO DE CONTENIDO: ${contentType?.name}
MODO: ${generationMode === 'bulk' ? 'Generación masiva' : 'Generación individual'}

ARCHIVO DE EJEMPLO:
${exampleContent}

ARCHIVO DE IDEAS:
${ideasContent}

INSTRUCCIONES:
1. Analiza el formato del archivo de ejemplo
2. Lee las descripciones en el archivo de ideas
3. Crea ${amount} nuevos archivos siguiendo el formato del ejemplo
4. Usa el formato === FILE_OPERATION === para crear cada archivo
5. Mantén el mismo estilo, tono y estructura del ejemplo

Proyecto: ${projectPath}
Idioma: Español`;

      setProgress(50);

      const response = await fetch('/api/ai/ghost-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          projectPath: projectPath
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

      setGenerationResults(filesCreated);
      setResult({
        success,
        message: success 
          ? `¡Éxito! Se crearon ${filesCreated.length} archivos`
          : 'No se detectaron operaciones de archivos',
        data: { filesCreated },
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
      setIsProcessing(false);
    }
  };

  const getFileContent = async (fileName: string): Promise<string> => {
    try {
      // First, get the project structure to find the full path
      const structureResponse = await fetch(`/api/unified-file-operations?projectPath=${encodeURIComponent(projectPath)}`);
      if (!structureResponse.ok) {
        console.error('Failed to get project structure');
        return '';
      }
      
      const structureData = await structureResponse.json();
      if (!structureData.success || !structureData.structure) {
        console.error('Invalid project structure response');
        return '';
      }
      
      // Search for the file in the project structure
      const findFileInStructure = (items: any[], targetName: string): string | null => {
        for (const item of items) {
          if (item.name === targetName) {
            return item.path;
          }
          if (item.children) {
            const found = findFileInStructure(item.children, targetName);
            if (found) return found;
          }
        }
        return null;
      };
      
      const fullFilePath = findFileInStructure(structureData.structure.items, fileName) || fileName;
      console.log(`[GhostAgentPanel] Looking for file: ${fileName}, found path: ${fullFilePath}`);
      
      const response = await fetch('/api/unified-file-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getContent',
          projectPath: projectPath,
          filePath: fullFilePath
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.data?.content || '';
      }
      return '';
    } catch (error) {
      console.error('Error getting file content:', error);
      return '';
    }
  };

  const parseAnalysisResult = (aiResponse: string): any => {
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return {};
    } catch (error) {
      console.error('Error parsing analysis result:', error);
      return {};
    }
  };

  const resetWorkflow = () => {
    setCurrentStep('bosquejo');
    setBosquejoResult(null);
    setDetectedContentType(null);
    setContentTypeConfirmed(false);
    setResult(null);
    setGenerationResults([]);
    setProgress(0);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-purple-500" />
          Ghost Agent - Generador de Contenido
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
              currentStep === 'bosquejo' ? "bg-blue-500 text-white" : "bg-gray-600 text-gray-300"
            )}>
              1
            </div>
            <span className={cn(
              "text-sm",
              currentStep === 'bosquejo' ? "text-blue-500" : "text-gray-400"
            )}>
              Bosquejo
            </span>
          </div>
          <div className="w-8 h-1 bg-gray-600" />
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
              currentStep === 'tipo' ? "bg-blue-500 text-white" : 
              canProceedToTipo ? "bg-green-500 text-white" : "bg-gray-600 text-gray-300"
            )}>
              2
            </div>
            <span className={cn(
              "text-sm",
              currentStep === 'tipo' ? "text-blue-500" : 
              canProceedToTipo ? "text-green-500" : "text-gray-400"
            )}>
              Tipo
            </span>
          </div>
          <div className="w-8 h-1 bg-gray-600" />
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
              currentStep === 'generar' ? "bg-blue-500 text-white" : 
              canProceedToGenerar ? "bg-green-500 text-white" : "bg-gray-600 text-gray-300"
            )}>
              3
            </div>
            <span className={cn(
              "text-sm",
              currentStep === 'generar' ? "text-blue-500" : 
              canProceedToGenerar ? "text-green-500" : "text-gray-400"
            )}>
              Generar
            </span>
          </div>
        </div>

        {/* Step 1: Bosquejo */}
        {currentStep === 'bosquejo' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <h3 className="font-medium">Análisis de Contenido</h3>
            </div>
            
            <div className="text-sm text-gray-400 space-y-2">
              <p>Archivo de ejemplo: <span className="text-blue-500">{exampleFile || 'No seleccionado'}</span></p>
              <p>Archivo de ideas: <span className="text-yellow-500">{ideasFile || 'No seleccionado'}</span></p>
            </div>

            <Button 
              onClick={handleBosquejo}
              disabled={!exampleFile || !ideasFile || isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <BrainCircuit className="w-4 h-4 mr-2" />
                  Realizar Análisis
                </>
              )}
            </Button>

            {bosquejoResult && (
              <div className={`p-4 rounded-lg border ${
                bosquejoResult.success 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-start gap-2">
                  {bosquejoResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{bosquejoResult.message}</p>
                    {bosquejoResult.data && (
                      <div className="mt-2 text-sm">
                        <p><strong>Tipo detectado:</strong> {bosquejoResult.data.contentType}</p>
                        <p><strong>Elementos estimados:</strong> {bosquejoResult.data.estimatedItems}</p>
                        <p><strong>Estructura:</strong> {bosquejoResult.data.structure}</p>
                      </div>
                    )}
                  </div>
                </div>
                {bosquejoResult.success && (
                  <Button 
                    onClick={() => setCurrentStep('tipo')}
                    className="mt-3"
                    size="sm"
                  >
                    Continuar al Siguiente Paso
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Tipo de Contenido */}
        {currentStep === 'tipo' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <h3 className="font-medium">Tipo de Contenido</h3>
            </div>

            <div className="space-y-3">
              <Label>Tipo de contenido detectado:</Label>
              <Select value={selectedContentType} onValueChange={setSelectedContentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo de contenido" />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{type.name}</span>
                        <span className="text-xs text-gray-500">{type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {detectedContentType && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">
                    Tipo detectado automáticamente: {detectedContentType.name}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {detectedContentType.description}
                  </p>
                </div>
              )}

              <Button 
                onClick={handleConfirmContentType}
                disabled={!selectedContentType}
                className="w-full"
              >
                Confirmar Tipo de Contenido
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Generar Contenido */}
        {currentStep === 'generar' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              <h3 className="font-medium">Generar Contenido</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Modo de generación:</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="single-mode"
                      checked={generationMode === 'single'}
                      onCheckedChange={() => setGenerationMode('single')}
                    />
                    <Label htmlFor="single-mode">Individual</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="bulk-mode"
                      checked={generationMode === 'bulk'}
                      onCheckedChange={() => setGenerationMode('bulk')}
                    />
                    <Label htmlFor="bulk-mode">Masiva</Label>
                  </div>
                </div>
              </div>

              {generationMode === 'single' ? (
                <div className="space-y-2">
                  <Label htmlFor="items-count">Cantidad de elementos:</Label>
                  <Input
                    id="items-count"
                    type="number"
                    min="1"
                    max="10"
                    value={itemsToGenerate}
                    onChange={(e) => setItemsToGenerate(parseInt(e.target.value) || 1)}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="bulk-amount">Cantidad total a generar:</Label>
                  <Input
                    id="bulk-amount"
                    type="number"
                    min="1"
                    max="50"
                    value={bulkAmount}
                    onChange={(e) => setBulkAmount(parseInt(e.target.value) || 5)}
                  />
                </div>
              )}

              <Button 
                onClick={handleGenerateContent}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generando Contenido...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Generar {generationMode === 'bulk' ? bulkAmount : itemsToGenerate} Elementos
                  </>
                )}
              </Button>
            </div>

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
                    {generationResults.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Archivos creados:</p>
                        <ul className="text-sm list-disc list-inside mt-1">
                          {generationResults.map((file, index) => (
                            <li key={index}>{file}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Progress Bar */}
        {isProcessing && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-xs text-center text-muted-foreground">
              {progress < 25 && 'Preparando...'}
              {progress >= 25 && progress < 50 && 'Analizando contenido...'}
              {progress >= 50 && progress < 75 && 'Procesando...'}
              {progress >= 75 && 'Finalizando...'}
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={resetWorkflow}
            size="sm"
          >
            Reiniciar
          </Button>
          {currentStep === 'tipo' && canProceedToTipo && (
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep('bosquejo')}
              size="sm"
            >
              Anterior
            </Button>
          )}
          {currentStep === 'generar' && canProceedToGenerar && (
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep('tipo')}
              size="sm"
            >
              Anterior
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 