"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BookText, 
  FileText, 
  FolderOpen, 
  Plus, 
  BrainCircuit, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  Settings,
  FileText as Template,
  Lightbulb,
  Code,
  Download,
  Upload,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { QuickAction, QuickActionResult, QuickActionsManager } from '@/lib/quick-actions';
import { ProjectContext } from '@/lib/project-context-loader';
import { TemplateFile, TemplateManager } from '@/lib/template-manager';

interface EnhancedQuickActionsPanelProps {
  projectContext: ProjectContext | null;
  onActionComplete?: (result: QuickActionResult) => void;
  onRefreshProject?: () => void;
  onTemplateSelect?: (template: TemplateFile) => void;
}

const EnhancedQuickActionsPanel: React.FC<EnhancedQuickActionsPanelProps> = ({
  projectContext,
  onActionComplete,
  onRefreshProject,
  onTemplateSelect
}) => {
  const [availableActions, setAvailableActions] = useState<QuickAction[]>([]);
  const [availableTemplates, setAvailableTemplates] = useState<TemplateFile[]>([]);
  const [executingAction, setExecutingAction] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<QuickActionResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateFile | null>(null);
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const [customPrompt, setCustomPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'actions' | 'templates' | 'custom'>('actions');

  const actionsManager = QuickActionsManager.getInstance();
  const templateManager = TemplateManager.getInstance();

  useEffect(() => {
    if (projectContext) {
      loadActionsAndTemplates();
    }
  }, [projectContext]);

  const loadActionsAndTemplates = async () => {
    if (!projectContext) return;

    // Load quick actions
    const actions = actionsManager.getAvailableActions(projectContext);
    setAvailableActions(actions);

    // Load templates
    try {
      const templates = await templateManager.loadTemplatesFromProject(projectContext.projectPath);
      setAvailableTemplates(templates);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

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

      if (result.success && onRefreshProject) {
        setTimeout(() => {
          onRefreshProject();
        }, 1000);
      }

      // Auto-hide results after 5 seconds
      setTimeout(() => {
        setShowResults(false);
      }, 5000);

    } catch (error) {
      console.error('Error executing action:', error);
      setLastResult({
        success: false,
        message: `Error: ${error}`,
        messageEn: `Error: ${error}`,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
      setShowResults(true);
      
      // Auto-hide error results after 8 seconds
      setTimeout(() => {
        setShowResults(false);
      }, 8000);
    } finally {
      setExecutingAction(null);
    }
  };

  const handleTemplateSelect = (template: TemplateFile) => {
    setSelectedTemplate(template);
    setTemplateVariables({});
    setShowTemplateModal(true);
  };

  const handleTemplateUse = async () => {
    if (!selectedTemplate) return;

    try {
      const processedContent = templateManager.processTemplate(selectedTemplate.id, templateVariables);
      
      // Create a custom action with the processed template
      const customAction: QuickAction = {
        id: `custom_template_${Date.now()}`,
        name: `Use ${selectedTemplate.name}`,
        nameEn: `Use ${selectedTemplate.nameEn}`,
        description: `Apply template: ${selectedTemplate.description}`,
        descriptionEn: `Apply template: ${selectedTemplate.descriptionEn}`,
        action: 'custom_template',
        category: 'content',
        color: 'blue',
        requiresContext: true,
        templateId: selectedTemplate.id,
        processedContent
      };

      setExecutingAction(customAction.id);
      setShowResults(false);
      setLastResult(null);

      // Simulate action execution
      await new Promise(resolve => setTimeout(resolve, 1000));

      const result: QuickActionResult = {
        success: true,
        message: `Template "${selectedTemplate.name}" applied successfully`,
        messageEn: `Template "${selectedTemplate.nameEn}" applied successfully`,
        data: {
          templateId: selectedTemplate.id,
          content: processedContent,
          variables: templateVariables
        }
      };

      setLastResult(result);
      setShowResults(true);
      setShowTemplateModal(false);

      if (onTemplateSelect) {
        onTemplateSelect(selectedTemplate);
      }

      if (onActionComplete) {
        onActionComplete(result);
      }

      // Auto-hide results after 5 seconds
      setTimeout(() => {
        setShowResults(false);
      }, 5000);

    } catch (error) {
      console.error('Error using template:', error);
      setLastResult({
        success: false,
        message: `Error applying template: ${error}`,
        messageEn: `Error applying template: ${error}`,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
      setShowResults(true);
      
      // Auto-hide error results after 8 seconds
      setTimeout(() => {
        setShowResults(false);
      }, 8000);
    } finally {
      setExecutingAction(null);
    }
  };

  const handleCustomPrompt = async () => {
    if (!customPrompt.trim() || !projectContext) return;

    setExecutingAction('custom_prompt');
    setShowResults(false);
    setLastResult(null);

    try {
      // Send custom prompt to AI agent
      const response = await fetch('/api/ai/ghost-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: customPrompt,
          contexts: [{
            path: projectContext.projectPath,
            title: projectContext.projectName
          }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        setLastResult({
          success: true,
          message: 'Custom prompt executed successfully',
          messageEn: 'Custom prompt executed successfully',
          data: data
        });
      } else {
        throw new Error('Failed to execute custom prompt');
      }

    } catch (error) {
      console.error('Error executing custom prompt:', error);
      setLastResult({
        success: false,
        message: `Error: ${error}`,
        messageEn: `Error: ${error}`,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    } finally {
      setExecutingAction(null);
      setShowResults(true);
      
      // Auto-hide results after 5 seconds
      setTimeout(() => {
        setShowResults(false);
      }, 5000);
    }
  };

  const getActionIcon = (action: QuickAction) => {
    const iconMap: Record<string, React.ReactNode> = {
      'generate_tip': <Plus className="w-3 h-3" />,
      'generate_chapter': <BookText className="w-3 h-3" />,
      'generate_content': <FileText className="w-3 h-3" />,
      'create_section': <FileText className="w-3 h-3" />,
      'create_outline': <BrainCircuit className="w-3 h-3" />,
      'organize_workspace': <FolderOpen className="w-3 h-3" />,
      'custom_template': <Template className="w-3 h-3" />
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

  if (!projectContext) {
    return (
      <div className="flex-shrink-0 px-4 py-2 border-b border-gray-800">
        <div className="text-xs text-gray-400 mb-2 font-medium">Enhanced Quick Actions</div>
        <div className="text-xs text-gray-500">Cargando contexto del proyecto...</div>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 px-4 py-2 border-b border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-gray-400 font-medium">Enhanced Quick Actions</div>
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

      {/* Tabs */}
      <div className="flex space-x-1 mb-3">
        <Button
          variant={activeTab === 'actions' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('actions')}
          className="text-xs h-6 px-2"
        >
          Actions
        </Button>
        <Button
          variant={activeTab === 'templates' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('templates')}
          className="text-xs h-6 px-2"
        >
          Templates
        </Button>
        <Button
          variant={activeTab === 'custom' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('custom')}
          className="text-xs h-6 px-2"
        >
          Custom
        </Button>
      </div>

      {/* Actions Tab */}
      {activeTab === 'actions' && (
        <div className="space-y-3">
          {['content', 'structure', 'organization'].map(category => {
            const categoryActions = availableActions.filter(action => action.category === category);
            if (categoryActions.length === 0) return null;

            return (
              <div key={category}>
                <div className="text-xs text-gray-500 mb-2 font-medium capitalize">
                  {category}
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
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-2">
          {availableTemplates.length === 0 ? (
            <div className="text-xs text-gray-500 text-center py-4">
              No templates available. Create templates in the project directory.
            </div>
          ) : (
            availableTemplates.map(template => (
              <Card key={template.id} className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => handleTemplateSelect(template)}>
                <CardContent className="p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Template className="w-3 h-3" />
                      <span className="text-xs font-medium">{template.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {template.type}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {template.description}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Custom Tab */}
      {activeTab === 'custom' && (
        <div className="space-y-3">
          <div>
            <Label htmlFor="custom-prompt" className="text-xs">Custom Prompt</Label>
            <Textarea
              id="custom-prompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Enter your custom prompt for the AI agent..."
              className="text-xs h-20"
            />
          </div>
          <Button
            onClick={handleCustomPrompt}
            disabled={!customPrompt.trim() || executingAction !== null}
            className="w-full text-xs h-7"
          >
            {executingAction === 'custom_prompt' ? (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <BrainCircuit className="w-3 h-3 mr-1" />
            )}
            Execute Custom Prompt
          </Button>
        </div>
      )}

      {/* Results Panel */}
      {showResults && lastResult && (
        <Card className="mt-3 border-gray-700 bg-gray-800/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                {lastResult.success ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                )}
                Resultado
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowResults(false)}
                className="h-6 w-6 p-0 hover:bg-gray-700"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-gray-300 mb-2">
              {lastResult.message}
            </p>
            {lastResult.errors && lastResult.errors.length > 0 && (
              <div className="text-xs text-red-400">
                {lastResult.errors.map((error, index) => (
                  <div key={index}>• {error}</div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Template Modal */}
      {showTemplateModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Use Template: {selectedTemplate.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTemplateModal(false)}
                  className="h-6 w-6 p-0 hover:bg-gray-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
              
              {selectedTemplate.variables.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">Template Variables</Label>
                  {selectedTemplate.variables.map(variable => (
                    <div key={variable} className="space-y-1">
                      <Label htmlFor={variable} className="text-xs">{variable}</Label>
                      <Input
                        id={variable}
                        value={templateVariables[variable] || ''}
                        onChange={(e) => setTemplateVariables({
                          ...templateVariables,
                          [variable]: e.target.value
                        })}
                        placeholder={`Enter ${variable}`}
                        className="text-xs"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTemplateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleTemplateUse}
                  disabled={executingAction !== null}
                >
                  {executingAction ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-1" />
                  )}
                  Use Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EnhancedQuickActionsPanel; 