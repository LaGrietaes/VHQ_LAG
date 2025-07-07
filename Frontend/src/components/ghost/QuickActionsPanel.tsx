"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookText, 
  FileText, 
  FolderOpen, 
  Plus, 
  BrainCircuit, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { QuickAction, QuickActionResult, QuickActionsManager } from '@/lib/quick-actions';
import { ProjectContext } from '@/lib/project-context-loader';

interface QuickActionsPanelProps {
  projectContext: ProjectContext | null;
  onActionComplete?: (result: QuickActionResult) => void;
  onRefreshProject?: () => void;
}

const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  projectContext,
  onActionComplete,
  onRefreshProject
}) => {
  const [availableActions, setAvailableActions] = useState<QuickAction[]>([]);
  const [executingAction, setExecutingAction] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<QuickActionResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  const actionsManager = QuickActionsManager.getInstance();

  useEffect(() => {
    if (projectContext) {
      const actions = actionsManager.getAvailableActions(projectContext);
      setAvailableActions(actions);
    }
  }, [projectContext]);

  const handleActionClick = async (action: QuickAction) => {
    if (!projectContext || executingAction) return;

    setExecutingAction(action.id);
    setShowResults(false);
    setLastResult(null);

    try {
      const result = await actionsManager.executeAction(action.id, projectContext);
      setLastResult(result);
      setShowResults(true);

      if (result.success && onActionComplete) {
        onActionComplete(result);
      }

      // Auto-refresh project after successful action
      if (result.success && onRefreshProject) {
        setTimeout(() => {
          onRefreshProject();
        }, 1000);
      }

    } catch (error) {
      console.error('Error executing action:', error);
      setLastResult({
        success: false,
        message: `Error: ${error}`,
        messageEn: `Error: ${error}`,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
      setShowResults(true);
    } finally {
      setExecutingAction(null);
    }
  };

  const getActionIcon = (action: QuickAction) => {
    const iconMap: Record<string, React.ReactNode> = {
      'generate_tip': <Plus className="w-3 h-3" />,
      'generate_chapter': <BookText className="w-3 h-3" />,
      'generate_content': <FileText className="w-3 h-3" />,
      'create_section': <FileText className="w-3 h-3" />,
      'create_outline': <BrainCircuit className="w-3 h-3" />,
      'organize_workspace': <FolderOpen className="w-3 h-3" />
    };
    return iconMap[action.action] || <Plus className="w-3 h-3" />;
  };

  const getActionColor = (action: QuickAction) => {
    const colorMap: Record<string, string> = {
      'green': 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20 hover:border-green-500/50',
      'blue': 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50',
      'purple': 'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/50',
      'orange': 'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20 hover:border-orange-500/50',
      'indigo': 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 hover:border-indigo-500/50',
      'gray': 'bg-gray-500/10 border-gray-500/30 text-gray-400 hover:bg-gray-500/20 hover:border-gray-500/50'
    };
    return colorMap[action.color] || colorMap.gray;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'content': 'Contenido',
      'structure': 'Estructura',
      'organization': 'Organización',
      'generation': 'Generación'
    };
    return labels[category] || category;
  };

  if (!projectContext) {
    return (
      <div className="flex-shrink-0 px-4 py-2 border-b border-gray-800">
        <div className="text-xs text-gray-400 mb-2 font-medium">Quick Actions</div>
        <div className="text-xs text-gray-500">Cargando contexto del proyecto...</div>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 px-4 py-2 border-b border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-gray-400 font-medium">Quick Actions</div>
        <Badge variant="outline" className="text-xs">
          {projectContext.bookType?.name || 'Unknown'}
        </Badge>
      </div>

      {/* Project Info */}
      <div className="mb-3 p-2 bg-gray-800/30 rounded text-xs">
        <div className="flex justify-between items-center mb-1">
          <span className="text-gray-400">Progreso:</span>
          <span className="text-primary">{projectContext.metadata?.progress?.completion || 0}%</span>
        </div>
        <Progress value={projectContext.metadata?.progress?.completion || 0} className="h-1 mb-1" />
        <div className="flex justify-between text-gray-500">
          <span>{projectContext.currentStructure?.totalFiles || 0} archivos</span>
          <span>{(projectContext.metadata?.progress?.words || 0).toLocaleString()} palabras</span>
        </div>
      </div>

      {/* Actions by Category */}
      {['content', 'structure', 'organization'].map(category => {
        const categoryActions = availableActions.filter(action => action.category === category);
        if (categoryActions.length === 0) return null;

        return (
          <div key={category} className="mb-3">
            <div className="text-xs text-gray-500 mb-2 font-medium">
              {getCategoryLabel(category)}
            </div>
            <div className="flex flex-wrap gap-2">
              {categoryActions.map(action => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleActionClick(action)}
                  disabled={executingAction !== null}
                  className={cn(
                    "text-xs h-7 px-2",
                    getActionColor(action)
                  )}
                  title={action.description}
                >
                  {executingAction === action.id ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    getActionIcon(action)
                  )}
                  <span className="ml-1">{action.name}</span>
                </Button>
              ))}
            </div>
          </div>
        );
      })}

      {/* Results Panel */}
      {showResults && lastResult && (
        <Card className="mt-3 border-gray-700 bg-gray-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              {lastResult.success ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400" />
              )}
              Resultado
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-gray-300 mb-2">
              {lastResult.success ? lastResult.message : lastResult.message}
            </p>
            
            {lastResult.filesCreated && lastResult.filesCreated.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-gray-400 mb-1">Archivos creados:</p>
                <div className="space-y-1">
                  {lastResult.filesCreated.map((file, index) => (
                    <div key={index} className="text-xs text-green-400 bg-green-500/10 p-1 rounded">
                      ✓ {file}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {lastResult.errors && lastResult.errors.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Errores:</p>
                <div className="space-y-1">
                  {lastResult.errors.map((error, index) => (
                    <div key={index} className="text-xs text-red-400 bg-red-500/10 p-1 rounded">
                      ✗ {error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResults(false)}
                className="text-xs h-6"
              >
                Cerrar
              </Button>
              {lastResult.success && onRefreshProject && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefreshProject}
                  className="text-xs h-6"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Actualizar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips Info (for tips books) */}
      {projectContext.availableTips && projectContext.availableTips.length > 0 && (
        <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/30 rounded text-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-blue-400 font-medium">Tips Disponibles:</span>
            <Badge variant="outline" className="text-xs bg-blue-500/20 border-blue-500/40">
              {projectContext.availableTips.length}
            </Badge>
          </div>
          <p className="text-gray-400">
            Usa "Generar Tip" para crear nuevos tips siguiendo el formato del proyecto.
          </p>
        </div>
      )}
    </div>
  );
};

export default QuickActionsPanel; 