import { Project, OutlineItem, BookProject } from "@/lib/ghost-agent-data";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BrainCircuit, Globe, Settings2, FileSignature, BookText, Share2, Save, ChevronsUp, FilePlus as FilePlusIcon, Upload, Link, FolderPlus, FileUp, FolderUp, LayoutPanelLeft } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ConfirmationDialog } from "../ui/ConfirmationDialog";
import { LinkProjectDialog } from "./LinkProjectDialog";
import { v4 as uuidv4 } from 'uuid';
import { ImportDialog, StagedFile } from "./ImportDialog";
import { OutlineItemView } from "./OutlineItemView";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Input } from "@/components/ui/input";
import * as path from 'path';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

type RenderableItem = OutlineItem & { level: number };

const bookTemplates = [
     {
        title: "Capítulo de Libro",
        content: "# Capítulo X: Título del Capítulo\n\n## Apertura\n\n*   Anécdota o cita para empezar.\n\n## Desarrollo de la Tesis\n\n*   Argumento principal del capítulo.\n\n## Subsección 1\n\n*   Detalles y evidencias.\n\n## Subsección 2\n\n*   Más detalles y contraargumentos.\n\n## Cierre del Capítulo\n\n*   Resumen de lo aprendido.\n*   Transición al siguiente capítulo."
    },
];

type BookWorkspaceProps = {
  project: BookProject;
  onBack: () => void;
  onUpdateProject: (project: Project) => void;
  allProjects: Project[];
};

export const BookWorkspace = ({ project: initialProject, onBack, onUpdateProject, allProjects }: BookWorkspaceProps) => {
    const [project, setProject] = useState<BookProject | null>(null);
    const [content, setContent] = useState("");
    const [isDirty, setIsDirty] = useState(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [editingMode, setEditingMode] = useState<'project' | 'template'>('project');
    const [newTemplateContent, setNewTemplateContent] = useState("");
    const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
    const [templates, setTemplates] = useState(bookTemplates);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [editingItemTitle, setEditingItemTitle] = useState("");
    const [activeItemId, setActiveItemId] = useState<string | null>(null);
    const [outlineKey, setOutlineKey] = useState(Date.now());
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);
    const [isContextPanelOpen, setIsContextPanelOpen] = useState(false);

    useEffect(() => {
        const fetchProjectDetails = async (id: string) => {
            try {
                const timestamp = Date.now();
                const response = await fetch(`/api/projects/structure?id=${id}&t=${timestamp}`);
                if (response.ok) {
                    const data = await response.json();
                    setProject(data.project as BookProject);
                } else {
                    console.error("Failed to fetch project details for id:", id);
                    setProject(initialProject as BookProject);
                }
            } catch (error) {
                console.error("Error fetching project details:", error);
                setProject(initialProject as BookProject);
            }
        };

        if (initialProject?.id) {
             fetchProjectDetails(initialProject.id);
        }
    }, [initialProject?.id]);

    const refreshProject = async () => {
        if (initialProject?.id) {
            try {
                const timestamp = Date.now();
                const response = await fetch(`/api/projects/structure?id=${initialProject.id}&t=${timestamp}`);
                if (response.ok) {
                    const data = await response.json();
                    setProject(data.project as BookProject);
                }
            } catch (error) {
                console.error("Error refreshing project:", error);
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

    useEffect(() => {
        if (project && editingMode === 'project') {
            const activeItem = activeItemId ? findItemInTree(project.outline || [], activeItemId) : null;
            setIsDirty(content !== (activeItem?.content || ""));
        }
    }, [content, project, editingMode, activeItemId]);

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

        try {
            const response = await fetch('/api/workspace/updateItemContent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectRootPath: project.path,
                    itemId: activeItemId,
                    content: content,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save content');
            }

            const newOutline = updateItemContentInTree(project.outline || [], activeItemId, content);
            setProject({ ...project, outline: newOutline });
            setIsDirty(false);

        } catch (error) {
            console.error('Error saving content:', error);
            // Here you might want to show an error to the user
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

                            lines.forEach(line => {
                                const match = line.match(/^(#+)\\s(.*)/);
                                if (match) {
                                    const level = match[1].length;
                                    const title = match[2].trim();
                                    const newItem: OutlineItem = {
                                        id: uuidv4(),
                                        title,
                                        type: 'file',
                                        content: text,
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
                            parsedStructure = [{ id: uuidv4(), title: `Unsupported file type: ${file.name}`, type: 'file', content: `Content of ${file.name} could not be read.` }];
                        }
                        resolve({ file, parsedStructure });
                    };
                    reader.onerror = reject;
                    reader.readAsText(file);
                });
            });

            Promise.all(filePromises).then(results => {
                setStagedFiles(results);
                setIsImportDialogOpen(true);
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
                    if (file.type.startsWith('text/') || file.name.endsWith('.md')) {
                        const reader = new FileReader();
                        reader.onload = (e) => resolve({ file, content: e.target?.result as string });
                        reader.onerror = reject;
                        reader.readAsText(file);
                    } else {
                        resolve({ file, content: `Unsupported file type: ${file.name}` });
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

                    pathMap[currentPath].children?.push({
                        id: uuidv4(),
                        title: fileName,
                        type: 'file',
                        content,
                    });
                });
                setStagedFiles([{ file: new File([], "folder"), parsedStructure: root.children || [] }]);
                setIsImportDialogOpen(true);
            });
        }
        if (event.target) {
            event.target.value = "";
        }
    };

    const saveNewTemplate = () => {
        const newTemplate = { title: "Custom Template", content: newTemplateContent };
        setTemplates([...templates, newTemplate]);
        setEditingMode('project');
        setNewTemplateContent("");
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

    const handleEditorChange = (value: string) => {
        setContent(value || "");
    };

    const handleTitleDoubleClick = (item: OutlineItem) => {
        setEditingItemId(item.id);
        setEditingItemTitle(item.title);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditingItemTitle(e.target.value);
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
        for (const node of nodes) {
            if (node.id === id) return node;
            if (node.children) {
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
            const response = await fetch('/api/workspace/renameItem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectRootPath: project.path,
                    itemId: editingItemId,
                    newTitle: editingItemTitle,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Failed to rename item:', errorData.message || 'Unknown error');
                // Revert the title change in UI
                setEditingItemTitle(item.title);
            } else {
                // Refresh the entire project to get updated UUIDs and structure
                await refreshProject();
            }
        } catch (error) {
            console.error('Error renaming item:', error);
            // Revert the title change in UI
            setEditingItemTitle(item.title);
        } finally {
            setEditingItemId(null);
            setOutlineKey(Date.now());
        }
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleTitleBlur();
        } else if (e.key === 'Escape') {
            setEditingItemId(null);
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

    const onDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;

        const newOutline = [...project.outline];

        const findAndRemove = (nodes: OutlineItem[], id: string): OutlineItem | null => {
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i].id === id) {
                    return nodes.splice(i, 1)[0];
                }
                if (nodes[i].children) {
                    const found = findAndRemove(nodes[i].children!, id);
                    if (found) return found;
                }
            }
            return null;
        };

        const findParentAndIndex = (nodes: OutlineItem[], targetId: string, parent: OutlineItem | null = null): { parent: OutlineItem | null, index: number } | null => {
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i].id === targetId) {
                    return { parent, index: i };
                }
                const children = nodes[i].children;
                if (children) {
                    const found = findParentAndIndex(children, targetId, nodes[i]);
                    if (found) return found;
                }
            }
            return null;
        }

        const findAndAdd = (nodes: OutlineItem[], targetId: string, itemToAdd: OutlineItem): boolean => {
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i].id === targetId && nodes[i].type === 'folder') {
                    const targetNode = nodes[i];
                    if (!targetNode.children) {
                        targetNode.children = [];
                    }
                    targetNode.children.splice(destination.index, 0, itemToAdd);
                    return true;
                }
                const children = nodes[i].children;
                if (children) {
                    if (findAndAdd(children, targetId, itemToAdd)) {
                        return true;
                    }
                }
            }
            return false;
        };

        const movedItem = findAndRemove(newOutline, draggableId);
        if (!movedItem) return;

        if (destination.droppableId === 'outline-root') {
            newOutline.splice(destination.index, 0, movedItem);
        } else {
            const parentId = destination.droppableId.replace('droppable-', '');
            if (!findAndAdd(newOutline, parentId, movedItem)) {
                newOutline.splice(source.index, 0, movedItem);
            }
        }

        setProject({ ...project, outline: newOutline });
        setOutlineKey(Date.now());
    };

    const flattenTree = (tree: OutlineItem[]): RenderableItem[] => {
        const result: RenderableItem[] = [];
        function recurse(nodes: OutlineItem[], level: number) {
            for (const node of nodes) {
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
        const parentId = activeItemId || project.id;
        const newItem: OutlineItem = {
            id: uuidv4(),
            title: type === 'file' ? 'New File' : 'New Folder',
            type: type,
            children: type === 'folder' ? [] : undefined,
            content: type === 'file' ? '' : undefined,
        };

        try {
            const response = await fetch('/api/workspace/addItem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectRootPath: project.path,
                    parentId: parentId === project.id ? null : parentId,
                    item: newItem,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create item');
            }

            const { updatedProject } = await response.json();
            setProject(prev => prev ? { ...prev, outline: updatedProject.outline } : null);
            setOutlineKey(Date.now());
            setActiveItemId(newItem.id);
            setEditingItemId(newItem.id);

        } catch (error) {
            console.error('Failed to create item:', error);
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
        project.outline.filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  return (
    <div className="flex flex-1 w-full bg-background text-foreground">
      {/* Left Panel: Outline */}
      <div className="w-1/4 min-w-[300px] border-r border-gray-800 flex flex-col bg-gray-900/50">
            <div className="p-4 flex-shrink-0">
                <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Proyectos
                </Button>
                <h2 className="text-2xl font-bold truncate text-primary">{project.name}</h2>
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
                    <Button variant="ghost" size="icon" onClick={() => handleAddItem('file')} title="Nuevo Archivo">
                        <FilePlusIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleAddItem('folder')} title="Nueva Carpeta">
                        <FolderPlus className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-gray-800 mx-1" />
                    <Button variant="ghost" size="icon" onClick={() => handleImportFile(false)} title="Importar Archivo">
                        <FileUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleImportFile(true)} title="Importar Carpeta">
                        <FolderUp className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-gray-800 mx-1" />
                    <Button variant="ghost" size="icon" onClick={() => setIsLinkDialogOpen(true)} title="Vincular Proyecto">
                        <Link className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto">
                 <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="outline-root" type="DEFAULT">
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={cn("p-4 space-y-1", snapshot.isDraggingOver ? "bg-primary/10" : "")}
                        >
                          {filteredAndFlattenedOutline.map((item, index) => (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                    <OutlineItemView
                                        item={item}
                                        level={item.level}
                                        onSelect={() => setActiveItemId(item.id)}
                                        isSelected={activeItemId === item.id}
                                        onDoubleClick={() => handleTitleDoubleClick(item)}
                                        isEditing={editingItemId === item.id}
                                        editingTitle={editingItemTitle}
                                        onTitleChange={handleTitleChange}
                                        onTitleBlur={handleTitleBlur}
                                        onTitleKeyDown={handleTitleKeyDown}
                                        isExpanded={expandedItems.has(item.id)}
                                        onToggleExpand={() => handleToggleExpand(item.id)}
                                    />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
            </div>
      </div>

      {/* Main Panel: Editor */}
      <div className={cn("flex-grow flex flex-col transition-all duration-300 ease-in-out", isContextPanelOpen ? "w-1/2" : "w-3/4")}>
         <div className="flex-shrink-0 p-4 border-b border-gray-800 flex justify-between items-center">
                <div>
                    <Button variant={editingMode === 'project' ? "secondary" : "ghost"} size="sm" onClick={() => setEditingMode('project')}>Editor</Button>
                    <Button variant={editingMode === 'template' ? "secondary" : "ghost"} size="sm" onClick={handleCreateNewTemplate}>Plantillas</Button>
                </div>
                <div>
                    <Button variant="ghost" size="icon" onClick={handleSave} disabled={!isDirty}>
                        <Save className={cn("h-5 w-5", isDirty ? "text-primary" : "")} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setIsContextPanelOpen(!isContextPanelOpen)}>
                        <LayoutPanelLeft className="h-5 w-5" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><ChevronsUp className="h-5 w-5" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>Opciones de IA</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Sugerir Mejoras</DropdownMenuItem>
                            <DropdownMenuItem>Optimizar para SEO</DropdownMenuItem>
                            <DropdownMenuItem>Cambiar Tono</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto p-2">
                 {editingMode === 'project' ? (
                    <textarea
                        className="w-full h-full p-4 bg-transparent resize-none focus:outline-none text-base leading-relaxed"
                        value={content}
                        onChange={(e) => handleEditorChange(e.target.value)}
                        placeholder="Selecciona un archivo del esquema para empezar a escribir..."
                    />
                ) : (
                    <div className="p-4">
                        <h3 className="text-xl font-bold mb-4">Plantillas de Contenido</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {templates.map((template, index) => (
                                <Card key={index} className="cursor-pointer hover:border-primary p-0 gap-0 rounded-lg" onClick={() => handleTemplateSelect(template.content)}>
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
            <div className="w-1/4 min-w-[300px] border-l border-gray-800 flex flex-col bg-gray-900/50 animate-in slide-in-from-right duration-300">
                <div className="p-4 border-b border-gray-800">
                <h3 className="text-lg font-semibold text-primary">Contexto del Proyecto</h3>
                </div>
                <div className="flex-grow p-4 overflow-y-auto">
                    {/* Context widgets go here */}
                </div>
            </div>
        )}

      <ConfirmationDialog
        isOpen={isConfirmModalOpen}
        onCancel={() => setConfirmModalOpen(false)}
        onDiscard={handleConfirmLeave}
        title="¿Descartar cambios?"
        message="Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?"
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
            onImport={(itemsToImport: OutlineItem[]) => {
                 setProject(prev => {
                    if (!prev) return null;
                    const newOutline = [...prev.outline, ...itemsToImport];
                    return { ...prev, outline: newOutline };
                });
                setIsImportDialogOpen(false);
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
    </div>
  );
};