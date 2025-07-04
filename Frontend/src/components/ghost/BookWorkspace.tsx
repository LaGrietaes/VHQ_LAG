"use client";

import React, { useRef } from 'react';
import { Project, OutlineItem, BookProject } from "@/lib/ghost-agent-data";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BrainCircuit, Globe, Settings2, FileSignature, BookText, Share2, Save, ChevronsUp, FilePlus as FilePlusIcon, Upload, Link, FolderPlus, FileUp, FolderUp, LayoutPanelLeft, ExternalLink, Trash2, RefreshCw, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ConfirmationDialog } from "../ui/ConfirmationDialog";
import { LinkProjectDialog } from "./LinkProjectDialog";
import { v4 as uuidv4 } from 'uuid';
import { ImportDialog, StagedFile } from "./ImportDialog";
import { OutlineItemView } from "./OutlineItemView";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Input } from "@/components/ui/input";
import * as path from 'path';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import dynamic from "next/dynamic";


type RenderableItem = OutlineItem & { level: number };

type Template = {
    id: string;
    title: string;
    content: string;
    type: 'book' | 'blog' | 'script' | 'general';
    createdAt: string;
    updatedAt: string;
};

type BookWorkspaceProps = {
  project: BookProject;
  onBack: () => void;
  onUpdateProject: (project: Project) => void;
  allProjects: Project[];
};

interface DraggableItemProps extends React.PropsWithChildren<{
  item: RenderableItem;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  onSelect: () => void;
  isSelected: boolean;
  onDoubleClick: () => void;
  isEditing: boolean;
  editingTitle: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTitleBlur: () => void;
  onTitleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDelete?: () => void;
}> {}

const ItemTypes = {
  OUTLINE_ITEM: 'outline-item'
};

const DraggableItem = React.memo<DraggableItemProps>(({
  item,
  index,
  moveItem,
  onSelect,
  isSelected,
  onDoubleClick,
  isEditing,
  editingTitle,
  onTitleChange,
  onTitleBlur,
  onTitleKeyDown,
  isExpanded,
  onToggleExpand,
  onDelete
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.OUTLINE_ITEM,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    options: {
      dropEffect: 'move',
    },
  });

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.OUTLINE_ITEM,
    hover: (draggedItem: { index: number }, monitor) => {
      if (!ref.current) return;

      const dragIndex = draggedItem.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveItem(dragIndex, hoverIndex);
      draggedItem.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-200",
        isDragging ? "opacity-50" : "",
        isOver && canDrop ? "bg-primary/10 border-l-2 border-primary" : "",
        "cursor-move"
      )}
      style={{
        outline: 'none',
        userSelect: 'none',
      }}
    >
      <OutlineItemView
        item={item}
        level={item.level}
        onSelect={onSelect}
        isSelected={isSelected}
        onDoubleClick={onDoubleClick}
        isEditing={isEditing}
        editingTitle={editingTitle}
        onTitleChange={onTitleChange}
        onTitleBlur={onTitleBlur}
        onTitleKeyDown={onTitleKeyDown}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
        onDelete={onDelete}
      />
    </div>
  );
});

DraggableItem.displayName = 'DraggableItem';

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const BookWorkspace: React.FC<BookWorkspaceProps> = ({ project: initialProject, onBack, onUpdateProject, allProjects }) => {
    const [project, setProject] = useState<BookProject | null>(null);
    const [content, setContent] = useState("");
    const [isDirty, setIsDirty] = useState(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [editingMode, setEditingMode] = useState<'project' | 'template'>('project');
    const [newTemplateContent, setNewTemplateContent] = useState("");
    const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [editingItemTitle, setEditingItemTitle] = useState("");
    const [activeItemId, setActiveItemId] = useState<string | null>(null);
    const [outlineKey, setOutlineKey] = useState(Date.now());
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);
    const [isContextPanelOpen, setIsContextPanelOpen] = useState(false);
    const [projectContext, setProjectContext] = useState<any>(null);
    const [contextLoading, setContextLoading] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editedProjectName, setEditedProjectName] = useState('');
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const [projectNameToDelete, setProjectNameToDelete] = useState('');
    const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);

    // Convert SimpleFileItem[] to OutlineItem[] - moved before useEffect
    const convertSimpleItemsToOutline = (items: any[]): OutlineItem[] => {
        return items.map(item => ({
            id: item.id,
            title: item.name,
            type: item.type,
            content: item.content,
            children: item.children ? convertSimpleItemsToOutline(item.children) : undefined
        }));
    };

    // Load project state from unified API
    const loadProjectState = async () => {
        if (!initialProject?.id) return;

        try {
            const response = await fetch(`/api/unified-file-operations?projectPath=${encodeURIComponent(initialProject.path)}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.structure) {
                    const outlineItems = convertSimpleItemsToOutline(data.structure.items);
                    const updatedProject = { ...initialProject, outline: outlineItems };
                    setProject(updatedProject);
                    console.log('Loaded project from unified API');
                } else {
                    console.error("Failed to load project structure:", data.message);
                    setProject(initialProject as BookProject);
                }
            } else {
                console.error("Failed to fetch project details for id:", initialProject.id);
                setProject(initialProject as BookProject);
            }
        } catch (error) {
            console.error("Error fetching project details:", error);
            setProject(initialProject as BookProject);
        }
    };

    useEffect(() => {
        loadProjectState();
    }, [initialProject?.id]);

    const refreshProject = async () => {
        if (initialProject?.id) {
            try {
                console.log('Refreshing project:', initialProject.id);
                
                // Preserve current state
                const currentActiveItemId = activeItemId;
                const currentExpandedItems = new Set(expandedItems);
                const currentContent = content;
                
                const response = await fetch(`/api/unified-file-operations?projectPath=${encodeURIComponent(initialProject.path)}`);
                
                console.log('Refresh response status:', response.status);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('Project refreshed successfully:', data.structure?.name);
                    
                    if (data.success && data.structure) {
                        const outlineItems = convertSimpleItemsToOutline(data.structure.items);
                        const updatedProject = { ...initialProject, outline: outlineItems };
                        setProject(updatedProject);
                        
                        // Restore expanded state for existing items
                        const newExpandedItems = new Set<string>();
                        currentExpandedItems.forEach(itemId => {
                            // Check if the item still exists in the updated project
                            if (findItemInTree(updatedProject.outline || [], itemId)) {
                                newExpandedItems.add(itemId);
                            }
                        });
                        setExpandedItems(newExpandedItems);
                        
                        // Restore active item if it still exists
                        if (currentActiveItemId && findItemInTree(updatedProject.outline || [], currentActiveItemId)) {
                            setActiveItemId(currentActiveItemId);
                            // Restore content if it's a file
                            const activeItem = findItemInTree(updatedProject.outline || [], currentActiveItemId);
                            if (activeItem?.type === 'file') {
                                setContent(activeItem.content || currentContent);
                            }
                        } else {
                            // Clear active item if it no longer exists
                            setActiveItemId(null);
                            setContent("");
                        }
                        
                        console.log('State restored after refresh');
                    } else {
                        console.error('Failed to refresh project:', data.message);
                        alert(`Error al refrescar el proyecto: ${data.message}`);
                    }
                } else {
                    console.error('Failed to refresh project:', response.status, response.statusText);
                    alert('Error al refrescar el proyecto. Verifica que el proyecto existe y es accesible.');
                }
            } catch (error) {
                console.error("Error refreshing project:", error);
                alert('Error al refrescar el proyecto. Verifica que el proyecto existe y es accesible.');
            }
        }
    };

    useEffect(() => {
        if (project) {
            onUpdateProject(project);
        }
    }, [project]);

    useEffect(() => {
        if (project && editingMode === 'project') {
            const activeItem = activeItemId ? findItemInTree(project.outline || [], activeItemId) : null;
            setContent(activeItem?.content || "");
        }
    }, [project, editingMode, activeItemId]);

    const loadTemplates = async () => {
        try {
            const response = await fetch('/api/templates?type=book');
            if (response.ok) {
                const data = await response.json();
                setTemplates(data.templates);
            } else {
                console.error('Failed to load templates');
            }
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    };

    useEffect(() => {
        if (project && editingMode === 'project') {
            const activeItem = activeItemId ? findItemInTree(project.outline || [], activeItemId) : null;
            setIsDirty(content !== (activeItem?.content || ""));
        }
    }, [content, project, editingMode, activeItemId]);

    useEffect(() => {
        loadTemplates();
    }, []);

    useEffect(() => {
        if (project) {
            setEditedProjectName(project.name);
        }
    }, [project]);

    // Function to refresh project context for chat drawer
    const refreshProjectContext = () => {
        if (typeof window !== 'undefined') {
            console.log('Dispatching workspace-refresh event');
            window.dispatchEvent(new CustomEvent('workspace-refresh', {
                detail: {
                    projectId: project?.id,
                    projectPath: project?.path,
                    timestamp: Date.now()
                }
            }));
        }
    };

    // Add effect to refresh context when project changes
    useEffect(() => {
        if (project) {
            refreshProjectContext();
        }
    }, [project?.id, project?.path]);

    // Add effect to refresh context when content is saved
    useEffect(() => {
        if (!isDirty && activeItemId) {
            // Content was just saved, refresh context
            refreshProjectContext();
        }
    }, [isDirty, activeItemId]);

    if (!project) {
        return <div className="flex items-center justify-center h-full w-full bg-black text-white">Loading project...</div>;
    }

    const handleBack = () => {
        if (isDirty) {
            setConfirmModalOpen(true);
        } else {
            onBack();
        }
    };

    const handleConfirmLeave = () => {
        onBack();
        setConfirmModalOpen(false);
    };

    const handleSave = async () => {
        if (!activeItemId) return;

        // Check if the selected item is a file (not a folder)
        const activeItem = findItemInTree(project.outline || [], activeItemId);
        if (!activeItem) {
            console.error('Active item not found');
            return;
        }

        if (activeItem.type === 'folder') {
            console.error('Cannot save content to a folder. Please select a file.');
            alert('No se puede guardar contenido en una carpeta. Por favor selecciona un archivo.');
            return;
        }

        try {
            const response = await fetch('/api/unified-file-operations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'updateContent',
                    projectPath: project.path,
                    filePath: activeItem.title, // Use the file name as path
                    content: content,
                }),
            });

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to save content');
            }

            if (data.updatedStructure) {
                // Convert SimpleFileItem[] to OutlineItem[]
                const outlineItems = convertSimpleItemsToOutline(data.updatedStructure.items);
                setProject({ ...project, outline: outlineItems });
            }
            
            setIsDirty(false);

        } catch (error) {
            console.error('Error saving content:', error);
            alert(`Error al guardar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    };

    const handleRevealInExplorer = async () => {
        // For now, we'll use a simple approach to open the project folder
        // This functionality can be enhanced later with proper backend support
        try {
            const activeItem = activeItemId ? findItemInTree(project.outline || [], activeItemId) : null;
            const itemType = activeItem?.type === 'folder' ? 'carpeta' : 'archivo';
            
            console.log(`Opening ${itemType || 'project folder'} in explorer`);
            
            // TODO: Implement proper reveal in explorer functionality
            // For now, just show a message
            alert(`Función de abrir en explorador no implementada aún. ${itemType && activeItem ? `Seleccionaste: ${activeItem.title}` : 'Proyecto: ' + project.title}`);
            
        } catch (error) {
            console.error('Error revealing item in explorer:', error);
            alert('Error al abrir en explorador');
        }
    };

    const handleAISuggestion = async (suggestionType: 'improve' | 'seo' | 'tone') => {
        if (!content.trim()) {
            console.warn('No content to analyze');
            return;
        }

        try {
            const response = await fetch('/api/ai/suggest-improvements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: content,
                    suggestionType: suggestionType
                }),
            });

            if (response.ok) {
                const data = await response.json();
                // For now, we'll log the suggestions. Later we can show them in a modal or side panel
                console.log(`AI Suggestions (${suggestionType}):`, data.suggestions);
                // TODO: Show suggestions in UI - could be a modal, toast, or side panel
                alert(`Sugerencias de IA generadas. Ver consola para detalles. (${data.usingAI ? 'IA' : 'Fallback'})`);
            } else {
                console.error('Failed to get AI suggestions');
            }
        } catch (error) {
            console.error('Error getting AI suggestions:', error);
        }
    };

    const handleGenerateContent = async () => {
        const userPrompt = prompt('¿Qué tipo de contenido quieres generar?');
        if (!userPrompt) return;

        try {
            const response = await fetch('/api/ai/generate-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: userPrompt,
                    contentType: 'general',
                    style: 'professional',
                    length: 500
                }),
            });

            if (response.ok) {
                const data = await response.json();
                // Add the generated content to the current content
                const newContent = content + (content ? '\n\n' : '') + data.content;
                setContent(newContent);
                setIsDirty(true);
                console.log('Generated content metadata:', data.metadata);
            } else {
                console.error('Failed to generate content');
            }
        } catch (error) {
            console.error('Error generating content:', error);
        }
    };

    const loadProjectContext = async () => {
        if (!project?.id) return;
        
        setContextLoading(true);
        try {
            const response = await fetch(`/api/projects/context?id=${encodeURIComponent(project.id)}`);
            if (response.ok) {
                const data = await response.json();
                setProjectContext(data.context);
            } else {
                console.error('Failed to load project context');
            }
        } catch (error) {
            console.error('Error loading project context:', error);
        } finally {
            setContextLoading(false);
        }
    };

    const handleSaveAndExit = () => {
        handleSave();
        onBack();
        setNewTemplateContent("");
    };

    const handleCreateNewTemplate = () => {
        setNewTemplateContent("## Nuevo Título de Plantilla\n\nEscribe tu contenido aquí...");
        setEditingMode('template');
    };

    const handleImportFile = (isFolder: boolean) => {
        if (isFolder) {
            folderInputRef.current?.click();
        } else {
            fileInputRef.current?.click();
        }
    };

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const filePromises = Array.from(files).map(file => {
                return new Promise<StagedFile>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const text = e.target?.result as string;
                        let parsedStructure: OutlineItem[] = [];

                        if (file.type === "text/plain" || file.type === "text/markdown" || file.name.endsWith('.md')) {
                            const lines = text.split('\n');
                            const tempTree: OutlineItem[] = [];
                            const parentStack: OutlineItem[] = [];

                            lines.forEach((line, lineIndex) => {
                                const match = line.match(/^(#+)\s(.*)/);
                                if (match) {
                                    const level = match[1].length;
                                    const title = match[2].trim();
                                    
                                    // Find the content for this heading (until the next heading or end of file)
                                    let content = '';
                                    let nextLineIndex = lineIndex + 1;
                                    while (nextLineIndex < lines.length) {
                                        const nextLine = lines[nextLineIndex];
                                        if (nextLine.match(/^(#+)\s/)) {
                                            break; // Found next heading
                                        }
                                        content += nextLine + '\n';
                                        nextLineIndex++;
                                    }
                                    
                                    const newItem: OutlineItem = {
                                        id: uuidv4(),
                                        title: title.endsWith('.md') ? title : title + '.md',
                                        type: 'file',
                                        content: content.trim(),
                                        children: []
                                    };

                                    while (parentStack.length >= level) {
                                        parentStack.pop();
                                    }

                                    const parent = parentStack[parentStack.length - 1];
                                    if (parent) {
                                        parent.children = parent.children || [];
                                        parent.children.push(newItem);
                                    } else {
                                        tempTree.push(newItem);
                                    }
                                    parentStack.push(newItem);
                                }
                            });
                            parsedStructure = tempTree;

                        } else {
                            parsedStructure = [{ 
                                id: uuidv4(), 
                                title: file.name.endsWith('.md') ? file.name : file.name + '.md', 
                                type: 'file', 
                                content: text 
                            }];
                        }
                        resolve({ file, parsedStructure });
                    };
                    reader.onerror = reject;
                    reader.readAsText(file);
                });
            });

            Promise.all(filePromises).then(results => {
                console.log('[BookWorkspace] File parsing results:', results.map(r => ({
                    fileName: r.file.name,
                    itemCount: r.parsedStructure.length,
                    items: r.parsedStructure.map(item => ({
                        id: item.id,
                        title: item.title,
                        type: item.type,
                        hasContent: !!item.content,
                        contentLength: item.content?.length || 0
                    }))
                })));
                
                setStagedFiles(results);
                setIsImportDialogOpen(true);
                // Disparar evento para refrescar contextos en el chat
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('workspace-refresh'));
                }
            });
        }

        if (event.target) {
            event.target.value = "";
        }
    };

    const handleFolderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const fileReadPromises = Array.from(files).map(file => {
                return new Promise<{ file: File, content: string }>((resolve, reject) => {
                    if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
                        const reader = new FileReader();
                        reader.onload = (e) => resolve({ file, content: e.target?.result as string });
                        reader.onerror = reject;
                        reader.readAsText(file);
                    } else {
                        resolve({ file, content: `[Binary file: ${file.name}]\n\nThis is a binary file and cannot be displayed as text content.` });
                    }
                });
            });

            Promise.all(fileReadPromises).then(readFiles => {
                const root: OutlineItem = { id: uuidv4(), title: "Imported Folder", type: 'folder', children: [] };
                const pathMap: { [key: string]: OutlineItem } = { "": root };

                readFiles.forEach(({ file, content }) => {
                    const pathParts = file.webkitRelativePath.split('/');
                    const fileName = pathParts.pop() || file.name;

                    let currentPath = "";
                    for (let i = 0; i < pathParts.length; i++) {
                        const part = pathParts[i];
                        const parentPath = currentPath;
                        currentPath += (currentPath ? '/' : '') + part;

                        if (!pathMap[currentPath]) {
                            const newFolder: OutlineItem = {
                                id: uuidv4(),
                                title: part,
                                type: 'folder',
                                children: []
                            };
                            pathMap[parentPath].children?.push(newFolder);
                            pathMap[currentPath] = newFolder;
                        }
                    }

                    // Ensure proper file extension
                    const finalFileName = fileName.endsWith('.md') ? fileName : fileName + '.md';
                    
                    pathMap[currentPath].children?.push({
                        id: uuidv4(),
                        title: finalFileName,
                        type: 'file',
                        content,
                    });
                });
                setStagedFiles([{ file: new File([], "folder"), parsedStructure: root.children || [] }]);
                setIsImportDialogOpen(true);
                // Disparar evento para refrescar contextos en el chat
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('workspace-refresh'));
                }
            });
        }
        if (event.target) {
            event.target.value = "";
        }
    };

    const saveNewTemplate = async () => {
        try {
            const response = await fetch('/api/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: "Custom Template",
                    content: newTemplateContent,
                    type: 'book'
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setTemplates([...templates, data.template]);
                setEditingMode('project');
                setNewTemplateContent("");
            } else {
                console.error('Failed to save template');
            }
        } catch (error) {
            console.error('Error saving template:', error);
        }
    };

    const cancelTemplateCreation = () => {
        setEditingMode('project');
        setNewTemplateContent("");
    };

    const handleTemplateSelect = (templateContent: string) => {
        if (!activeItemId) {
            console.warn("No active item to apply template to.");
            return;
        }
        const updatedOutline = addTemplateContentInTree(project.outline, activeItemId, templateContent);
        setProject({ ...project, outline: updatedOutline });
    };

    const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value || "");
    };

    const handleTitleDoubleClick = (item: OutlineItem) => {
        console.log('[BookWorkspace] Double-click triggered for item:', {
            id: item.id,
            title: item.title,
            type: item.type
        });
        setEditingItemId(item.id);
        setEditingItemTitle(item.title);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditingItemTitle(e.target.value);
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleTitleBlur();
        } else if (e.key === 'Escape') {
            setEditingItemId(null);
        }
    };

    const updateItemInTree = (nodes: OutlineItem[], id: string, newTitle: string): OutlineItem[] => {
        return nodes.map(node => {
            if (node.id === id) {
                return { ...node, title: newTitle };
            }
            if (node.children) {
                return { ...node, children: updateItemInTree(node.children, id, newTitle) };
            }
            return node;
        });
    };

    const findItemInTree = (nodes: OutlineItem[], id: string): OutlineItem | null => {
        if (!nodes || !Array.isArray(nodes)) return null;
        
        for (const node of nodes) {
            if (node && node.id === id) return node;
            if (node && node.children) {
                const found = findItemInTree(node.children, id);
                if (found) return found;
            }
        }
        return null;
    };

    const findParent = (nodes: OutlineItem[], id: string, parent: OutlineItem | null = null): OutlineItem | null => {
        for (const node of nodes) {
            if (node.id === id) return parent;
            if (node.children) {
                const found = findParent(node.children, id, node);
                if (found) return found;
            }
        }
        return null;
    };

    const updateItemContentInTree = (nodes: OutlineItem[], id: string, newContent: string): OutlineItem[] => {
        return nodes.map(node => {
            if (node.id === id) {
                return { ...node, content: newContent };
            }
            if (node.children) {
                return { ...node, children: updateItemContentInTree(node.children, id, newContent) };
            }
            return node;
        });
    };

    const addTemplateContentInTree = (nodes: OutlineItem[], id: string, templateContent: string): OutlineItem[] => {
        return nodes.map(node => {
            if (node.id === id) {
                return { ...node, content: (node.content || "") + "\n" + templateContent };
            }
            if (node.children) {
                return { ...node, children: addTemplateContentInTree(node.children, id, templateContent) };
            }
            return node;
        });
    };

    const findItemPath = (nodes: OutlineItem[], id: string, currentPath: string[] = []): string | null => {
        for(const node of nodes) {
            const nextPath = [...currentPath, node.title];
            if (node.id === id) {
                return path.join(...nextPath);
            }
            if (node.children) {
                const foundPath = findItemPath(node.children, id, nextPath);
                if (foundPath) return foundPath;
            }
        }
        return null;
    };

    const handleTitleBlur = async () => {
        if (!editingItemId) return;

        const item = findItemInTree(project.outline, editingItemId);
        if (!item) return;

        if (editingItemTitle === item.title) {
            setEditingItemId(null);
            return;
        }

        try {
            console.log('Attempting to rename item:', {
                projectPath: project.path,
                oldPath: item.title,
                newTitle: editingItemTitle,
            });
            
            const response = await fetch('/api/unified-file-operations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'rename',
                    projectPath: project.path,
                    oldPath: item.title,
                    newName: editingItemTitle,
                }),
            });
            
            const data = await response.json();
            console.log('Rename response:', data);

            if (!data.success) {
                console.error('Failed to rename item:', data.message);
                alert(`Error al renombrar: ${data.message}`);
                // Revert the title change in UI
                setEditingItemTitle(item.title);
            } else {
                if (data.updatedStructure) {
                    const outlineItems = convertSimpleItemsToOutline(data.updatedStructure.items);
                    setProject({ ...project, outline: outlineItems });
                }
            }
        } catch (error) {
            console.error('Error renaming item:', error);
            alert(`Error al renombrar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            // Revert the title change in UI
            setEditingItemTitle(item.title);
        } finally {
            setEditingItemId(null);
            setOutlineKey(Date.now());
        }
    };

    const handleToggleExpand = (itemId: string) => {
        setExpandedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    const onDragEnd = (result: { source: { index: number }; destination?: { index: number } }) => {
        if (!result.destination) return;

        const { source, destination } = result;
        const newOutline = [...project.outline];
        const [removed] = newOutline.splice(source.index, 1);
        newOutline.splice(destination.index, 0, removed);
        setProject({ ...project, outline: newOutline });
        setOutlineKey(Date.now());
    };

    const moveItem = async (dragIndex: number, hoverIndex: number) => {
        if (!project) return;

        const flattenedOutline = flattenTree(project.outline || []);
        const draggedItem = flattenedOutline[dragIndex];
        const targetItem = flattenedOutline[hoverIndex];

        if (!draggedItem || !targetItem) {
            console.error('Invalid drag/drop indices');
            return;
        }

        // Don't allow dropping on itself
        if (draggedItem.id === targetItem.id) {
            console.log('Cannot drop item on itself');
            return;
        }

        // Determine target parent
        let targetParentPath: string | undefined = undefined;
        
        // If target is a folder, move into it
        if (targetItem.type === 'folder') {
            targetParentPath = targetItem.title;
        } else {
            // If target is a file, move to its parent
            const targetParent = findParent(project.outline || [], targetItem.id);
            targetParentPath = targetParent?.title;
        }

        // Don't allow moving into itself or its own children
        if (targetParentPath === draggedItem.title) {
            console.log('Cannot move item into itself');
            return;
        }

        // Check if target is a child of the dragged item
        if (targetParentPath && isChildOf(draggedItem.id, targetParentPath, project.outline || [])) {
            console.log('Cannot move item into its own child');
            return;
        }

        try {
            console.log('Moving item:', {
                itemTitle: draggedItem.title,
                targetParentPath: targetParentPath || 'root'
            });

            const response = await fetch('/api/unified-file-operations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'move',
                    projectPath: project.path,
                    itemPath: draggedItem.title,
                    targetParentPath: targetParentPath,
                }),
            });

            const data = await response.json();
            console.log('Move response:', data);

            if (!data.success) {
                throw new Error(data.message || 'Failed to move item');
            }

            if (data.updatedStructure) {
                // Preserve current expanded state
                const currentExpandedItems = new Set(expandedItems);
                
                const outlineItems = convertSimpleItemsToOutline(data.updatedStructure.items);
                setProject({ ...project, outline: outlineItems });
                
                // Expand target parent if moving into a folder
                if (targetParentPath) {
                    const targetParent = findItemInTree(outlineItems, targetParentPath);
                    if (targetParent) {
                        currentExpandedItems.add(targetParent.id);
                    }
                }
                setExpandedItems(currentExpandedItems);
                
                // Refresh context
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('workspace-refresh'));
                }
                
                console.log('Item moved successfully:', draggedItem.title);
            } else {
                console.error('No updated structure received from backend');
                await refreshProject();
            }

        } catch (error) {
            console.error('Failed to move item:', error);
            alert(`Error al mover ${draggedItem.type === 'folder' ? 'carpeta' : 'archivo'}: ${(error as Error).message}`);
        }
    };

    const isChildOf = (parentId: string, childPath: string | undefined, nodes: OutlineItem[]): boolean => {
        if (!childPath || !parentId) return false;
        
        // Find the parent node by ID
        const parentNode = findItemInTree(nodes, parentId);
        if (!parentNode || !parentNode.children) {
            return false;
        }
        
        // Search for childPath in the parent's children
        function searchInTree(nodes: OutlineItem[], targetPath: string): boolean {
            for (const node of nodes) {
                if (node.title === targetPath) {
                    return true;
                }
                if (node.children && node.children.length > 0) {
                    if (searchInTree(node.children, targetPath)) {
                        return true;
                    }
                }
            }
            return false;
        }
        
        return searchInTree(parentNode.children, childPath);
    };

    const flattenTree = (tree: OutlineItem[]): RenderableItem[] => {
        if (!tree || !Array.isArray(tree)) {
            console.warn('flattenTree: Invalid tree input:', tree);
            return [];
        }
        
        const result: RenderableItem[] = [];
        function recurse(nodes: OutlineItem[], level: number) {
            if (!nodes || !Array.isArray(nodes)) return;
            
            for (const node of nodes) {
                if (!node || !node.id) {
                    console.warn('flattenTree: Invalid node found:', node);
                    continue;
                }
                
                result.push({ ...node, level });
                if (node.children && expandedItems.has(node.id)) {
                    recurse(node.children, level + 1);
                }
            }
        }
        recurse(tree, 0);
        return result;
    };

    const handleAddItem = async (type: 'file' | 'folder') => {
        const parentId = activeItemId || null; // Use null for root-level items
        const newItem: OutlineItem = {
            id: uuidv4(),
            title: type === 'file' ? 'New File' : 'New Folder',
            type: type,
            children: type === 'folder' ? [] : undefined,
            content: type === 'file' ? '' : undefined,
        };

        console.log('Creating new item:', { type, parentId, newItem, projectPath: project.path });

        try {
            const response = await fetch('/api/unified-file-operations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: type === 'file' ? 'createFile' : 'createFolder',
                    projectPath: project.path,
                    fileName: type === 'file' ? newItem.title : undefined,
                    folderName: type === 'folder' ? newItem.title : undefined,
                    content: type === 'file' ? newItem.content : undefined,
                    parentPath: parentId ? findItemInTree(project.outline || [], parentId)?.title : undefined,
                }),
            });

            const data = await response.json();
            console.log('Add item response:', data);
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to create item');
            }

            if (data.updatedStructure) {
                // Preserve current expanded state
                const currentExpandedItems = new Set(expandedItems);
                
                const outlineItems = convertSimpleItemsToOutline(data.updatedStructure.items);
                setProject({ ...project, outline: outlineItems });
                
                // Find the newly created item in the updated structure
                const newItemInStructure = findItemInTree(outlineItems, newItem.title);
                if (newItemInStructure) {
                    setActiveItemId(newItemInStructure.id);
                    setEditingItemId(newItemInStructure.id);
                    setEditingItemTitle(newItemInStructure.title);
                }
                
                // Expand parent folder if item was added to a folder
                if (parentId) {
                    currentExpandedItems.add(parentId);
                }
                setExpandedItems(currentExpandedItems);
                
                // Disparar evento para refrescar contextos en el chat
                if (typeof window !== 'undefined') {
                    console.log('Dispatching workspace-refresh event');
                    window.dispatchEvent(new CustomEvent('workspace-refresh'));
                }
                
                console.log('New item created successfully:', newItem.title);
            } else {
                console.error('No updated structure received from backend');
                await refreshProject();
            }

        } catch (error) {
            console.error('Failed to create item:', error);
            alert(`Error al crear ${type === 'file' ? 'archivo' : 'carpeta'}: ${(error as Error).message}`);
        }
    };

    const removeItemFromTree = (nodes: OutlineItem[], id: string): OutlineItem[] => {
        return nodes.reduce((acc, node) => {
            if (node.id === id) {
                return acc;
            }
            if (node.children) {
                node.children = removeItemFromTree(node.children, id);
            }
            acc.push(node);
            return acc;
        }, [] as OutlineItem[]);
    };

    const setItemPersisted = (nodes: OutlineItem[], id: string, newTitle: string): OutlineItem[] => {
      return nodes.map(node => {
        if (node.id === id) {
          return { ...node, title: newTitle, isNew: false };
        }
        if (node.children) {
          return { ...node, children: setItemPersisted(node.children, id, newTitle) };
        }
        return node;
      });
    };

    const filteredAndFlattenedOutline = flattenTree(
        (project.outline || []).filter(item => {
            if (!item || !item.title) {
                console.warn('Invalid item in project outline:', item);
                return false;
            }
            return item.title.toLowerCase().includes(searchTerm.toLowerCase());
        })
    );

    const handleRenameProject = async () => {
        if (!project || !editedProjectName.trim()) return;

        try {
            // For project renaming, we need to rename the project directory
            // This is a more complex operation that might require backend support
            // For now, we'll just update the local state
            const updatedProject = { ...project, name: editedProjectName, title: editedProjectName };
            setProject(updatedProject);
            onUpdateProject(updatedProject);
            setIsEditDialogOpen(false);
            
            // TODO: Implement actual project directory renaming in the backend
            console.log('Project renamed locally. Backend renaming not yet implemented.');
        } catch (error) {
            console.error('Error renaming project:', error);
            alert(`Error al renombrar el proyecto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    };

    const handleDeleteProject = async () => {
        if (!project) return;

        console.log('Attempting to delete project:', {
            title: project.title,
            confirmText: projectNameToDelete,
            path: project.path
        });

        if (projectNameToDelete !== project.title) {
            console.log('Delete confirmation text does not match');
            return;
        }

        try {
            // For project deletion, we need to delete the entire project directory
            // This is a more complex operation that might require backend support
            // For now, we'll just navigate back
            console.log('Project deletion not yet implemented in backend');
            
            setDeleteConfirmationOpen(false);
            setProjectNameToDelete("");
            onBack();
            
            // TODO: Implement actual project directory deletion in the backend
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Delete operation failed: ' + (error as Error).message);
        }
    };

    const handleDeleteItem = async (item: RenderableItem) => {
        if (!project) return;

        const itemType = item.type === 'folder' ? 'carpeta' : 'archivo';
        const confirmMessage = `¿Estás seguro de que quieres eliminar la ${itemType} "${item.title}"?`;
        
        if (!confirm(confirmMessage)) {
            return;
        }

        try {
            const response = await fetch('/api/unified-file-operations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'delete',
                    projectPath: project.path,
                    itemPath: item.title,
                }),
            });

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to delete item');
            }

            if (data.updatedStructure) {
                const outlineItems = convertSimpleItemsToOutline(data.updatedStructure.items);
                setProject({ ...project, outline: outlineItems });
            }

            // Clear active item if it was the deleted one
            if (activeItemId === item.id) {
                setActiveItemId(null);
                setContent("");
            }

            // Remove from expanded items if it was a folder
            if (item.type === 'folder') {
                const newExpandedItems = new Set(expandedItems);
                newExpandedItems.delete(item.id);
                setExpandedItems(newExpandedItems);
            }

            console.log(`${itemType} eliminado exitosamente:`, item.title);
        } catch (error) {
            console.error('Error deleting item:', error);
            alert(`Error al eliminar ${itemType}: ${(error as Error).message}`);
            
            // Refresh project to ensure UI is in sync
            await refreshProject();
        }
    };

    // Convert JSX to string for the 'message' prop
    const editProjectNameMessage = "Enter new project name";
    const deleteProjectMessage = "This will delete ALL project files and cannot be undone.";

    return (
        <div className="flex w-full h-full min-h-0 bg-background text-foreground">
            {/* Left Panel: Outline */}
            <div className={cn(
                "w-1/4 min-w-[300px] border-r border-gray-800 flex flex-col bg-gray-900/50 h-full min-h-0",
                isChatDrawerOpen && "w-1/5 min-w-[250px]"
            )}>
                <div className="p-4 flex-shrink-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBack}
                        className="mb-4"
                        type="button"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Proyectos
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsEditDialogOpen(true)}
                            title="Edit Project Name"
                        >
                            <FileSignature className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setProjectNameToDelete("");
                                setDeleteConfirmationOpen(true);
                            }}
                            title="Delete Project"
                            className="text-destructive hover:text-destructive/80"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    <h2 className="text-2xl font-bold truncate text-primary">{project?.title}</h2>
                    <Input
                        type="search"
                        placeholder="Buscar en el esquema..."
                        className="mt-4"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex-shrink-0 px-4 pb-2 border-b border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleAddItem('file')}
                            title="Nuevo Archivo"
                            type="button"
                        >
                            <FilePlusIcon className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleAddItem('folder')}
                            title="Nueva Carpeta"
                            type="button"
                        >
                            <FolderPlus className="h-4 w-4" />
                        </Button>
                        <div className="w-px h-6 bg-gray-800 mx-1" />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleImportFile(false)}
                            title="Importar Archivo"
                            type="button"
                        >
                            <FileUp className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleImportFile(true)}
                            title="Importar Carpeta"
                            type="button"
                        >
                            <FolderUp className="h-4 w-4" />
                        </Button>
                        <div className="w-px h-6 bg-gray-800 mx-1" />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsLinkDialogOpen(true)}
                            title="Vincular Proyecto"
                            type="button"
                        >
                            <Link className="h-4 w-4" />
                        </Button>
                        <div className="w-px h-6 bg-gray-800 mx-1" />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={refreshProject}
                            title="Refrescar Proyecto"
                            type="button"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>

                    </div>
                </div>

                <div className="flex-grow overflow-y-auto min-h-0">
                    <DndProvider backend={HTML5Backend}>
                        <div className="p-4 space-y-1">
                            {filteredAndFlattenedOutline.map((item, index) => (
                                <div key={item.id}>
                                    <DraggableItem
                                        item={item}
                                        index={index}
                                        moveItem={moveItem}
                                        onSelect={() => {
                                            console.log('[BookWorkspace] Item selected:', {
                                                id: item.id,
                                                title: item.title,
                                                type: item.type,
                                                hasContent: !!item.content,
                                                contentLength: item.content?.length || 0
                                            });
                                            
                                            // Only allow files to be selected for editing
                                            if (item.type === 'file') {
                                                setActiveItemId(item.id);
                                            } else {
                                                // For folders, just toggle expansion
                                                handleToggleExpand(item.id);
                                            }
                                        }}
                                        isSelected={activeItemId === item.id}
                                        onDoubleClick={() => {
                                            // Allow both files and folders to be renamed
                                            handleTitleDoubleClick(item);
                                        }}
                                        isEditing={editingItemId === item.id}
                                        editingTitle={editingItemTitle}
                                        onTitleChange={handleTitleChange}
                                        onTitleBlur={handleTitleBlur}
                                        onTitleKeyDown={handleTitleKeyDown}
                                        isExpanded={expandedItems.has(item.id)}
                                        onToggleExpand={() => handleToggleExpand(item.id)}
                                        onDelete={() => handleDeleteItem(item)}
                                    />
                                </div>
                            ))}
                        </div>
                    </DndProvider>
                </div>
            </div>

            {/* Main Panel: Editor */}
            <div className={cn(
                "flex flex-col flex-1 min-h-0 transition-all duration-300 ease-in-out",
                isContextPanelOpen ? "w-1/2" : "w-3/4",
                isChatDrawerOpen && "w-1/2"
            )}>
                <div className="flex-shrink-0 p-4 border-b border-gray-800 flex justify-between items-center">
                    <div>
                        <Button variant={editingMode === 'project' ? "secondary" : "ghost"} size="sm" onClick={() => setEditingMode('project')}>Editor</Button>
                        <Button variant={editingMode === 'template' ? "secondary" : "ghost"} size="sm" onClick={handleCreateNewTemplate}>Plantillas</Button>
                    </div>
                    
                    {/* Active Chapter Title - Centered */}
                    <div className="flex-1 flex justify-center items-center px-4">
                        {activeItemId && editingMode === 'project' ? (
                            <div className="text-center">
                                {(() => {
                                    const activeItem = findItemInTree(project.outline || [], activeItemId);
                                    const isFolder = activeItem?.type === 'folder';
                                    return (
                                        <div className="flex flex-col items-center">
                                            <h2 className={cn(
                                                "font-bold text-lg leading-tight break-words max-w-md",
                                                isFolder ? "text-muted-foreground" : "text-primary"
                                            )}>
                                                {activeItem?.title || 'Sin título'}
                                            </h2>
                                            {isFolder && (
                                                <span className="text-xs text-muted-foreground mt-1">
                                                    (Carpeta - no editable)
                                                </span>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        ) : (
                            <div className="text-center">
                                <h2 className="font-bold text-lg text-muted-foreground leading-tight">
                                    {editingMode === 'template' ? 'Plantillas de Contenido' : 'Selecciona un archivo'}
                                </h2>
                            </div>
                        )}
                    </div>
                    
                    <div>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleSave} 
                        disabled={!isDirty || (activeItemId ? findItemInTree(project.outline || [], activeItemId)?.type === 'folder' : false)}
                        title={activeItemId && findItemInTree(project.outline || [], activeItemId)?.type === 'folder' ? 'No se puede guardar contenido en una carpeta' : 'Guardar cambios'}
                    >
                        <Save className={cn("h-5 w-5", isDirty ? "text-primary" : "")} />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleRevealInExplorer}
                        title={activeItemId ? 
                            (findItemInTree(project.outline || [], activeItemId)?.type === 'folder' ? 
                                "Abrir carpeta en explorador" : 
                                "Localizar archivo en explorador") : 
                            "Abrir carpeta del proyecto"}
                    >
                        <ExternalLink className="h-5 w-5" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => {
                            setIsContextPanelOpen(!isContextPanelOpen);
                            if (!isContextPanelOpen && !projectContext) {
                                loadProjectContext();
                            }
                        }}
                    >
                        <LayoutPanelLeft className="h-5 w-5" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="icon"
                                disabled={activeItemId ? findItemInTree(project.outline || [], activeItemId)?.type === 'folder' : false}
                                title={activeItemId && findItemInTree(project.outline || [], activeItemId)?.type === 'folder' ? 'No disponible para carpetas' : 'Opciones de IA'}
                            >
                                <ChevronsUp className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-background border border-border shadow-lg backdrop-blur-sm">
                            <DropdownMenuLabel className="text-primary font-semibold bg-muted/50 px-3 py-2 rounded-t-md">Opciones de IA</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                onClick={() => handleAISuggestion('improve')}
                                disabled={activeItemId ? findItemInTree(project.outline || [], activeItemId)?.type === 'folder' : false}
                                className="hover:bg-primary/10 focus:bg-primary/10"
                            >
                                Sugerir Mejoras
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={() => handleAISuggestion('seo')}
                                disabled={activeItemId ? findItemInTree(project.outline || [], activeItemId)?.type === 'folder' : false}
                                className="hover:bg-primary/10 focus:bg-primary/10"
                            >
                                Optimizar para SEO
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={() => handleAISuggestion('tone')}
                                disabled={activeItemId ? findItemInTree(project.outline || [], activeItemId)?.type === 'folder' : false}
                                className="hover:bg-primary/10 focus:bg-primary/10"
                            >
                                Cambiar Tono
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                onClick={() => handleGenerateContent()}
                                disabled={activeItemId ? findItemInTree(project.outline || [], activeItemId)?.type === 'folder' : false}
                                className="hover:bg-primary/10 focus:bg-primary/10"
                            >
                                Generar Contenido con IA
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                </div>

                <div className="flex-1 p-2 min-h-0">
                    {editingMode === 'project' ? (
                        <div className="w-full h-full" data-color-mode="dark">
                            <MDEditor
                                value={content}
                                onChange={(value) => setContent(value || "")}
                                height="100%"
                                preview="edit"
                            />
                        </div>
                    ) : (
                        <div className="p-4">
                            <h3 className="text-xl font-bold mb-4">Plantillas de Contenido</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {templates.map((template: Template, index: number) => (
                                    <Card key={template.id} className="cursor-pointer hover:border-primary p-0 gap-0 rounded-lg" onClick={() => handleTemplateSelect(template.content)}>
                                        <CardHeader className="p-6 flex flex-col space-y-1.5">
                                            <CardTitle className="text-2xl tracking-tight">{template.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6 pt-0">
                                            <p className="text-sm text-muted-foreground line-clamp-3">{template.content}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel: Context */}
            {isContextPanelOpen && (
                <div className={cn(
                    "w-1/4 min-w-[300px] border-l border-gray-800 flex flex-col bg-gray-900/50 animate-in slide-in-from-right duration-300 h-full min-h-0",
                    isChatDrawerOpen && "w-1/5 min-w-[250px]"
                )}>
                    <div className="p-4 border-b border-gray-800">
                        <h3 className="text-lg font-semibold text-primary">Contexto del Proyecto</h3>
                    </div>
                    <div className="flex-grow p-4 overflow-y-auto space-y-4 min-h-0">
                        {contextLoading ? (
                            <div className="text-center text-muted-foreground">Cargando contexto...</div>
                        ) : projectContext ? (
                            <>
                                {/* Project Stats */}
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">Estadísticas</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Archivos:</span>
                                            <span>{projectContext.stats.totalFiles}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Carpetas:</span>
                                            <span>{projectContext.stats.totalFolders}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Palabras:</span>
                                            <span>{projectContext.stats.totalWords.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Caracteres:</span>
                                            <span>{projectContext.stats.totalCharacters.toLocaleString()}</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Project Insights */}
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">Insights</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0 space-y-3">
                                        {projectContext.insights.map((insight: any, index: number) => (
                                            <div key={index} className="space-y-1">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium">{insight.title}</span>
                                                    <span className="text-sm text-primary">{insight.value}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{insight.description}</p>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                {/* Recent Activity */}
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">Actividad Reciente</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0 space-y-2">
                                        {projectContext.recentActivity.slice(0, 5).map((activity: any) => (
                                            <div key={activity.id} className="flex items-center space-x-2 text-sm">
                                                <div className="w-2 h-2 rounded-full bg-primary/50"></div>
                                                <span className="flex-1 truncate">{activity.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(activity.lastModified).toLocaleDateString()}
                                                </span>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                {/* File Types */}
                                {Object.keys(projectContext.stats.fileTypes).length > 0 && (
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm">Tipos de Archivo</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-0 space-y-2">
                                            {Object.entries(projectContext.stats.fileTypes).map(([ext, count]) => (
                                                <div key={ext} className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">{ext}</span>
                                                    <span>{count as number}</span>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                )}
                            </>
                        ) : (
                            <div className="text-center text-muted-foreground">
                                <p>No se pudo cargar el contexto del proyecto</p>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={loadProjectContext}
                                    className="mt-2"
                                >
                                    Reintentar
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}



            <ConfirmationDialog
                isOpen={isConfirmModalOpen}
                onCancel={() => setConfirmModalOpen(false)}
                onConfirm={handleConfirmLeave}
                title="Discard changes?"
                message="You have unsaved changes. Are you sure you want to discard them?"
                confirmText="Discard"
                confirmVariant="destructive"
            />

            <LinkProjectDialog
                isOpen={isLinkDialogOpen}
                onClose={() => setIsLinkDialogOpen(false)}
                allProjects={allProjects}
                currentProject={project}
                onUpdateProject={onUpdateProject}
            />

            <ImportDialog
                isOpen={isImportDialogOpen}
                onClose={() => setIsImportDialogOpen(false)}
                stagedFiles={stagedFiles}
                onImport={async (itemsToImport: OutlineItem[]) => {
                    try {
                        console.log('[BookWorkspace] Importing items:', itemsToImport);
                        console.log('[BookWorkspace] Project path:', project.path);
                        console.log('[BookWorkspace] Active item ID:', activeItemId);
                        
                        // Convert OutlineItem[] to the format expected by the API
                        const filesToImport = itemsToImport.map(item => ({
                            name: item.title,
                            content: item.content || ''
                        }));
                        
                        const requestBody = {
                            action: 'import',
                            projectPath: project.path,
                            files: filesToImport,
                            parentPath: activeItemId ? findItemInTree(project.outline || [], activeItemId)?.title : undefined,
                        };
                        
                        console.log('[BookWorkspace] Import request body:', requestBody);
                        
                        const response = await fetch('/api/unified-file-operations', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(requestBody),
                        });

                        const data = await response.json();
                        console.log('[BookWorkspace] Import response:', data);

                        if (!data.success) {
                            throw new Error(data.message || 'Failed to import files');
                        }

                        if (data.updatedStructure) {
                            const outlineItems = convertSimpleItemsToOutline(data.updatedStructure.items);
                            setProject({ ...project, outline: outlineItems });
                        }
                        
                        setIsImportDialogOpen(false);
                        
                        // Disparar evento para refrescar contextos en el chat
                        if (typeof window !== 'undefined') {
                            window.dispatchEvent(new CustomEvent('workspace-refresh'));
                        }
                    } catch (error) {
                        console.error('[BookWorkspace] Import failed:', error);
                        alert(`Error al importar archivos: ${(error as Error).message}`);
                    }
                }}
            />

            <input
                type="file"
                ref={fileInputRef}
                onChange={onFileChange}
                style={{ display: 'none' }}
            />
            <input
                type="file"
                ref={folderInputRef}
                onChange={handleFolderChange}
                style={{ display: 'none' }}
                // These attributes are non-standard but necessary for folder uploads
                {...{ webkitdirectory: "true", mozdirectory: "true", directory: "true" }}
            />

            <ConfirmationDialog
                isOpen={isEditDialogOpen}
                onCancel={() => {
                    setIsEditDialogOpen(false);
                    setEditedProjectName(project?.name || '');
                }}
                onConfirm={() => {
                    if (editedProjectName.trim()) {
                        handleRenameProject();
                    }
                }}
                title="Rename Project"
                message="Enter the new name for your project"
                confirmText="Rename"
                requireConfirmationText={editedProjectName}
                confirmationPlaceholder="Enter new project name"
            />

            <ConfirmationDialog
                isOpen={deleteConfirmationOpen}
                onCancel={() => {
                    setDeleteConfirmationOpen(false);
                    setProjectNameToDelete('');
                }}
                onConfirm={handleDeleteProject}
                onConfirmationTextChange={setProjectNameToDelete}
                title="Delete Project Permanently"
                message={`This will permanently delete the project "${project?.title}" and ALL its files. This action cannot be undone.\n\nType "${project?.title}" to confirm deletion.`}
                confirmText="Delete Project"
                confirmVariant="destructive"
                requireConfirmationText={project?.title}
                confirmationPlaceholder={`Type "${project?.title}" to confirm`}
            />
        </div>
    );
};

export default BookWorkspace;