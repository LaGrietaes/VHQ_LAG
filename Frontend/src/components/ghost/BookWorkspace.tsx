import { Project } from "@/lib/ghost-agent-data";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BrainCircuit, Globe, Settings2, FileSignature, BookText, Share2, Save, ChevronsUp, FilePlus, Upload, Link } from "lucide-react";
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
import { OutlineItemView, TreeOutlineItem } from "./OutlineItemView";

type OutlineItem = {
    id: string;
    title: string;
    type: 'chapter' | 'section';
    content: string;
};

const bookTemplates = [
     { 
        title: "Capítulo de Libro", 
        content: "# Capítulo X: Título del Capítulo\n\n## Apertura\n\n*   Anécdota o cita para empezar.\n\n## Desarrollo de la Tesis\n\n*   Argumento principal del capítulo.\n\n## Subsección 1\n\n*   Detalles y evidencias.\n\n## Subsección 2\n\n*   Más detalles y contraargumentos.\n\n## Cierre del Capítulo\n\n*   Resumen de lo aprendido.\n*   Transición al siguiente capítulo." 
    },
];

type BookWorkspaceProps = {
  project: Project;
  onBack: () => void;
  onUpdateProject: (project: Project) => void;
  allProjects: Project[];
};

export const BookWorkspace = ({ project, onBack, onUpdateProject, allProjects }: BookWorkspaceProps) => {
  const [content, setContent] = useState(project.content || "");
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingMode === 'project') {
      const activeItem = activeItemId ? findItemInTree(project.structure || [], activeItemId) : null;
      setContent(activeItem?.content || "");
    }
  }, [project, editingMode, activeItemId]);

  useEffect(() => {
    if (editingMode === 'project') {
      const activeItem = activeItemId ? findItemInTree(project.structure || [], activeItemId) : null;
      setIsDirty(content !== (activeItem?.content || ""));
    }
  }, [content, project, editingMode, activeItemId]);

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

  const handleSave = () => {
    if(activeItemId) {
        const newStructure = updateItemContentInTree(project.structure || [], activeItemId, content);
        onUpdateProject({ ...project, structure: newStructure });
    }
    setIsDirty(false);
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
            let parsedStructure: TreeOutlineItem[] = [];

            if (file.type === "text/plain" || file.type === "text/markdown" || file.name.endsWith('.md')) {
                const lines = text.split('\n');
                const tempTree: TreeOutlineItem[] = [];
                const parentStack: TreeOutlineItem[] = [];

                lines.forEach(line => {
                    const match = line.match(/^(#+)\s(.*)/);
                    if (match) {
                        const level = match[1].length;
                        const title = match[2].trim();
                        const newItem: TreeOutlineItem = {
                            id: uuidv4(),
                            title,
                            type: 'chapter', // Default type, can be refined
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
                parsedStructure = [{ id: uuidv4(), title: `Unsupported file type: ${file.name}`, type: 'section', content: `Content of ${file.name} could not be read.`, children: [] }];
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
            const root: TreeOutlineItem = { id: uuidv4(), title: "Imported Folder", type: 'folder', children: [] };
            const pathMap: { [key: string]: TreeOutlineItem } = { "": root };

            readFiles.forEach(({ file, content }) => {
                const pathParts = file.webkitRelativePath.split('/');
                const fileName = pathParts.pop() || file.name;

                let currentPath = "";
                for (let i = 0; i < pathParts.length; i++) {
                    const part = pathParts[i];
                    const parentPath = currentPath;
                    currentPath += (currentPath ? '/' : '') + part;

                    if (!pathMap[currentPath]) {
                        const newFolder: TreeOutlineItem = {
                            id: uuidv4(),
                            title: part,
                            type: 'folder',
                            children: []
                        };
                        pathMap[parentPath].children?.push(newFolder);
                        pathMap[currentPath] = newFolder;
                    }
                }

                const parentFolder = pathMap[pathParts.join('/')] || root;
                parentFolder.children?.push({
                    id: uuidv4(),
                    title: fileName,
                    type: 'chapter',
                    content: content
                });
            });

            const newStructure = [...(project.structure || []), ...(root.children || [])];
            onUpdateProject({ ...project, structure: newStructure });
            setOutlineKey(Date.now());
        });
    }
    if (event.target) {
        event.target.value = "";
    }
  };

  const saveNewTemplate = () => {
    const title = newTemplateContent.split('\n')[0].replace('#', '').trim() || "Nueva Plantilla";
    const newTemplate = { title, content: newTemplateContent };
    setTemplates(prev => [...prev, newTemplate]);
    setEditingMode('project');
    setNewTemplateContent("");
  };

  const cancelTemplateCreation = () => {
    setEditingMode('project');
    setNewTemplateContent("");
  };

  const handleTemplateSelect = (templateContent: string) => {
    if (editingMode === 'template') return;
    
    if(activeItemId) {
        const newStructure = addTemplateContentInTree(project.structure || [], activeItemId, templateContent);
        onUpdateProject({ ...project, structure: newStructure });
    }
  };

  const editorContent = editingMode === 'project' ? content : newTemplateContent;
  const handleEditorChange = (value: string) => {
      if (editingMode === 'template') {
          setNewTemplateContent(value);
      } else {
          setContent(value);
      }
  }

  const handleTitleDoubleClick = (item: TreeOutlineItem) => {
    setEditingItemId(item.id);
    setEditingItemTitle(item.title);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingItemTitle(e.target.value);
  };

  const updateItemInTree = (nodes: TreeOutlineItem[], id: string, newTitle: string): TreeOutlineItem[] => {
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

  const findItemInTree = (nodes: TreeOutlineItem[], id: string): TreeOutlineItem | null => {
    for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
            const found = findItemInTree(node.children, id);
            if (found) return found;
        }
    }
    return null;
  };

  const updateItemContentInTree = (nodes: TreeOutlineItem[], id: string, newContent: string): TreeOutlineItem[] => {
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

  const addTemplateContentInTree = (nodes: TreeOutlineItem[], id: string, templateContent: string): TreeOutlineItem[] => {
      return nodes.map(node => {
          if (node.id === id) {
              return { ...node, content: (node.content || "") + templateContent };
          }
          if (node.children) {
              return { ...node, children: addTemplateContentInTree(node.children, id, templateContent) };
          }
          return node;
      });
  };

  const handleTitleBlur = () => {
    if (editingItemId) {
      const newStructure = updateItemInTree(project.structure || [], editingItemId, editingItemTitle)
      onUpdateProject({ ...project, structure: newStructure });
      setEditingItemId(null);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    }
  };

  return (
    <div className="h-full flex flex-col bg-black text-gray-300 font-mono">
      <input 
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        className="hidden"
        accept=".md,.txt,.pdf,.docx"
        multiple
      />
      <input 
        type="file"
        ref={folderInputRef}
        onChange={handleFolderChange}
        className="hidden"
        webkitdirectory=""
        directory=""
      />
      
      <ImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        stagedFiles={stagedFiles}
        onConfirmImport={(selectedItems) => {
            onUpdateProject({ ...project, structure: [...(project.structure || []), ...selectedItems] });
            setIsImportDialogOpen(false);
            setOutlineKey(Date.now());
        }}
      />
      
      <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={editingMode === 'project' ? handleBack : cancelTemplateCreation} className="text-gray-400 hover:bg-gray-800 hover:text-red-400">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-bold text-white">
            {editingMode === 'project' ? project.title : "Crear Nueva Plantilla de Libro"}
          </h2>
          {editingMode === 'project' && (
            <>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-400 flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4" />PSY
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-400 flex items-center gap-2">
                  <Globe className="h-4 w-4" />SEO
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-400">
                  <Settings2 className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {editingMode === 'project' && (
            <>
              <Button variant="outline" onClick={() => setIsLinkDialogOpen(true)} className="border-gray-700 hover:border-red-600 hover:bg-gray-900 hover:text-red-400 flex items-center gap-2">
                <Link className="h-4 w-4" /> LINK CONTENT
              </Button>
              <Button variant="outline" className="border-gray-700 hover:border-red-600 hover:bg-gray-900 hover:text-red-400">
                <FileSignature className="h-4 w-4 mr-2"/> GEN DRAFT
              </Button>
              <Button variant="outline" className="border-gray-700 hover:border-red-600 hover:bg-gray-900 hover:text-red-400">
                <BookText className="h-4 w-4 mr-2"/> SUMMRZ
              </Button>
              <Button variant="outline" className="border-gray-700 hover:border-red-600 hover:bg-gray-900 hover:text-red-400">
                <Share2 className="h-4 w-4 mr-2"/> XPND
              </Button>
            </>
          )}
        </div>
      </header>
      <div className="flex-1 flex min-h-0">
        <aside className="w-1/3 lg:w-1/4 p-4 border-r border-gray-800 bg-gradient-to-r from-gray-900 to-black flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h3 className="text-lg font-semibold text-red-600">OUTLINE</h3>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-400">
                            <Upload className="h-4 w-4 mr-2" />
                            Importar
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => handleImportFile(false)}>
                            Importar Archivos
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleImportFile(true)}>
                            Importar Carpeta
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="flex-grow overflow-y-auto -mr-4 pr-4" key={outlineKey}>
                <ul className="space-y-1">
                    {project.structure && project.structure.length > 0 ? (
                        project.structure.map(item => (
                            <OutlineItemView
                                key={item.id}
                                item={item}
                                level={0}
                                activeItemId={activeItemId}
                                editingItemId={editingItemId}
                                editingItemTitle={editingItemTitle}
                                onItemClick={setActiveItemId}
                                onItemDoubleClick={handleTitleDoubleClick}
                                onTitleChange={handleTitleChange}
                                onTitleBlur={handleTitleBlur}
                                onTitleKeyDown={handleTitleKeyDown}
                            />
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm">El outline está vacío.</p>
                    )}
                </ul>
            </div>

            <div className="mt-auto pt-4 flex-shrink-0">
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild disabled={editingMode === 'template'}>
                        <Button variant="outline" className="w-full border-gray-700 hover:border-red-600 hover:bg-gray-900 hover:text-red-400 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            <FilePlus className="h-4 w-4" />
                            <span>PLANTILLAS</span>
                            <ChevronsUp className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-gray-900 border-gray-700 text-gray-300" side="top">
                        <DropdownMenuLabel className="flex items-center gap-2 text-red-500">
                          <FilePlus className="h-4 w-4" /> PLANTILLAS DE LIBRO
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-gray-700"/>
                        {templates.map(template => (
                             <DropdownMenuItem 
                                key={template.title}
                                onSelect={() => handleTemplateSelect(template.content)}
                                className="hover:bg-gray-800 hover:text-white"
                             >
                                {template.title}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator className="bg-gray-700"/>
                        <DropdownMenuItem onSelect={handleCreateNewTemplate} className="hover:bg-gray-800 hover:text-white flex items-center gap-2">
                           <FilePlus className="h-4 w-4" /> Crear Nueva
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </aside>

        <main className="w-2/3 lg:w-3/4 flex flex-col bg-black">
           <div className="p-4 flex-grow min-h-0">
               <textarea 
                  className="w-full h-full bg-transparent text-gray-300 font-mono text-base border-none resize-none focus:outline-none leading-relaxed"
                  value={editorContent}
                  onChange={(e) => handleEditorChange(e.target.value)}
              />
          </div>
          <footer className="flex-shrink-0 p-4 border-t border-gray-800 flex justify-end items-center gap-4">
            {editingMode === 'project' ? (
              <div className="flex items-center">
                  <Button onClick={handleSave} variant="outline" disabled={!isDirty} className="h-full border-gray-700 hover:border-green-600 hover:bg-gray-900 hover:text-green-400 disabled:opacity-50 disabled:hover:border-gray-700 disabled:hover:text-gray-500">
                    <Save className="h-4 w-4 mr-2" /> SAVE
                  </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                 <Button onClick={cancelTemplateCreation} variant="destructive" className="bg-red-800 hover:bg-red-700 text-white">
                    Cancelar
                </Button>
                <Button onClick={saveNewTemplate} variant="outline" className="border-green-600 text-green-400 hover:bg-green-900 hover:text-green-300">
                  <Save className="h-4 w-4 mr-2" /> Guardar Plantilla
                </Button>
              </div>
            )}
          </footer>
        </main>
      </div>
      <ConfirmationDialog 
        isOpen={isConfirmModalOpen}
        onSave={handleSaveAndExit}
        onDiscard={handleConfirmLeave}
        onCancel={() => setConfirmModalOpen(false)}
        title="Cambios no guardados"
        message="Tienes cambios sin guardar. ¿Qué te gustaría hacer?"
      />
      <LinkProjectDialog 
        isOpen={isLinkDialogOpen}
        onClose={() => setIsLinkDialogOpen(false)}
        currentProject={project}
        allProjects={allProjects}
        onUpdateProject={onUpdateProject}
      />
    </div>
  );
};

declare module 'react' {
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
      webkitdirectory?: string;
      directory?: string;
    }
} 