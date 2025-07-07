"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  FileText, 
  Edit, 
  Trash2, 
  Download, 
  Upload, 
  Copy,
  Eye,
  Settings,
  FolderOpen,
  BookOpen,
  Lightbulb,
  Code
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TemplateFile, TemplateManager } from '@/lib/template-manager';
import { ProjectContext } from '@/lib/project-context-loader';

interface TemplateManagerProps {
  projectContext: ProjectContext | null;
  onTemplateSelect?: (template: TemplateFile) => void;
  onTemplateCreate?: (template: TemplateFile) => void;
  onTemplateUpdate?: (template: TemplateFile) => void;
  onTemplateDelete?: (templateId: string) => void;
}

const TemplateManager: React.FC<TemplateManagerProps> = ({
  projectContext,
  onTemplateSelect,
  onTemplateCreate,
  onTemplateUpdate,
  onTemplateDelete
}) => {
  const [templates, setTemplates] = useState<TemplateFile[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<TemplateFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('templates');
  
  // Template creation/editing
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateFile | null>(null);
  const [newTemplate, setNewTemplate] = useState<Partial<TemplateFile>>({
    name: '',
    nameEn: '',
    description: '',
    descriptionEn: '',
    type: 'template',
    category: 'general',
    content: '',
    language: 'both',
    tags: []
  });

  const templateManager = TemplateManager.getInstance();

  useEffect(() => {
    if (projectContext) {
      loadTemplates();
    }
  }, [projectContext]);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchQuery, selectedType, selectedCategory]);

  const loadTemplates = async () => {
    if (!projectContext) return;
    
    setIsLoading(true);
    try {
      const projectTemplates = await templateManager.loadTemplatesFromProject(projectContext.projectPath);
      const globalTemplates = await templateManager.loadTemplatesFromGlobal();
      
      setTemplates([...projectTemplates, ...globalTemplates]);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(template => template.type === selectedType);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    setFilteredTemplates(filtered);
  };

  const handleCreateTemplate = () => {
    setIsCreating(true);
    setEditingTemplate(null);
    setNewTemplate({
      name: '',
      nameEn: '',
      description: '',
      descriptionEn: '',
      type: 'template',
      category: 'general',
      content: '',
      language: 'both',
      tags: []
    });
  };

  const handleEditTemplate = (template: TemplateFile) => {
    setEditingTemplate(template);
    setNewTemplate({ ...template });
    setIsCreating(true);
  };

  const handleSaveTemplate = async () => {
    if (!newTemplate.name || !newTemplate.content) {
      alert('Name and content are required');
      return;
    }

    try {
      const template: TemplateFile = {
        id: editingTemplate?.id || `template_${Date.now()}`,
        name: newTemplate.name,
        nameEn: newTemplate.nameEn || newTemplate.name,
        description: newTemplate.description || '',
        descriptionEn: newTemplate.descriptionEn || newTemplate.description || '',
        type: newTemplate.type || 'template',
        category: newTemplate.category || 'general',
        content: newTemplate.content,
        variables: templateManager.extractVariables(newTemplate.content),
        language: newTemplate.language || 'both',
        tags: newTemplate.tags || [],
        createdAt: editingTemplate?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usage: editingTemplate?.usage || 0
      };

      const success = await templateManager.saveTemplate(template);
      if (success) {
        await loadTemplates();
        setIsCreating(false);
        setEditingTemplate(null);
        if (onTemplateCreate) onTemplateCreate(template);
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error saving template');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const success = await templateManager.deleteTemplate(templateId);
      if (success) {
        await loadTemplates();
        if (onTemplateDelete) onTemplateDelete(templateId);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Error deleting template');
    }
  };

  const handleUseTemplate = (template: TemplateFile) => {
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
  };

  const getTypeIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'template': <FileText className="w-4 h-4" />,
      'sample': <BookOpen className="w-4 h-4" />,
      'example': <Lightbulb className="w-4 h-4" />,
      'guide': <Code className="w-4 h-4" />
    };
    return iconMap[type] || <FileText className="w-4 h-4" />;
  };

  const getTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      'template': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      'sample': 'bg-green-500/10 text-green-400 border-green-500/30',
      'example': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
      'guide': 'bg-purple-500/10 text-purple-400 border-purple-500/30'
    };
    return colorMap[type] || 'bg-gray-500/10 text-gray-400 border-gray-500/30';
  };

  if (isCreating) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {editingTemplate ? 'Edit Template' : 'Create New Template'}
          </h3>
          <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>
            Cancel
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={newTemplate.name}
              onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
              placeholder="Template name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={newTemplate.type}
              onValueChange={(value) => setNewTemplate({ ...newTemplate, type: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="template">Template</SelectItem>
                <SelectItem value="sample">Sample</SelectItem>
                <SelectItem value="example">Example</SelectItem>
                <SelectItem value="guide">Guide</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={newTemplate.category}
              onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
              placeholder="Category"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select
              value={newTemplate.language}
              onValueChange={(value) => setNewTemplate({ ...newTemplate, language: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={newTemplate.description}
            onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
            placeholder="Template description"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={newTemplate.content}
            onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
            placeholder="Template content with {variables}"
            rows={10}
            className="font-mono text-sm"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsCreating(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveTemplate}>
            {editingTemplate ? 'Update Template' : 'Create Template'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Template Manager</h3>
        <Button size="sm" onClick={handleCreateTemplate}>
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="samples">Samples</TabsTrigger>
          <TabsTrigger value="guides">Guides</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="template">Templates</SelectItem>
                <SelectItem value="sample">Samples</SelectItem>
                <SelectItem value="example">Examples</SelectItem>
                <SelectItem value="guide">Guides</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="tips">Tips</SelectItem>
                <SelectItem value="chapters">Chapters</SelectItem>
                <SelectItem value="sections">Sections</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading templates...</div>
          ) : (
            <div className="grid gap-4">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(template.type)}
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <Badge variant="outline" className={cn("text-xs", getTypeColor(template.type))}>
                          {template.type}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUseTemplate(template)}
                          title="Use Template"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTemplate(template)}
                          title="Edit Template"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTemplate(template.id)}
                          title="Delete Template"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-2">
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <span>{template.category}</span>
                        <span>•</span>
                        <span>{template.language}</span>
                        {template.variables.length > 0 && (
                          <>
                            <span>•</span>
                            <span>{template.variables.length} variables</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        {template.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {template.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredTemplates.length === 0 && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              No templates found. Create your first template to get started.
            </div>
          )}
        </TabsContent>

        <TabsContent value="samples" className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            Sample files management coming soon...
          </div>
        </TabsContent>

        <TabsContent value="guides" className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            Guide management coming soon...
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TemplateManager; 