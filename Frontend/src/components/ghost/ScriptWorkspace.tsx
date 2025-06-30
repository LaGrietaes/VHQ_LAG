import { Project, platformCharLimits, Platform } from "@/lib/ghost-agent-data";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BrainCircuit, Globe, Settings2, FileSignature, BookText, Share2, Save, ChevronsUp, FilePlus, Upload, Link, Youtube, Instagram, Twitter, MessageSquare, Smile } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuSubPortal
} from "@/components/ui/dropdown-menu";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ConfirmationDialog } from "../ui/ConfirmationDialog";
import { LinkProjectDialog } from "./LinkProjectDialog";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import EmojiPicker, { EmojiClickData, Theme, EmojiStyle, SuggestionMode } from "emoji-picker-react";

const platformIcons: { [key in Platform]: React.ReactNode } = {
  youtube: <Youtube size={16} />,
  instagram: <Instagram size={16} />,
  tiktok: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.528 8.004H16.18V4.348h-3.652v11.397a4.348 4.348 0 1 1-4.348-4.348" /></svg>,
  youtube_shorts: <svg width="16" height="16" viewBox="0 0 24 24" strokeWidth="1.5" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 15.5V8.5L16 12L10 15.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" /><path d="M2 12C2 16.9706 6.02944 21 11 21C15.9706 21 20 16.9706 20 12C20 7.02944 15.9706 3 11 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /><path d="M22 12C22 16.9706 17.9706 21 13 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  x: <Twitter size={14} />,
  threads: <MessageSquare size={14} />,
};

// Mock data for outline and content
const mockWorkspaceData = {
    outline: [
        { id: 'sec-1', title: 'Introducción' },
        { id: 'sec-2', title: 'Capítulo 1: El Despertar' },
        { id: 'sec-3', title: 'Capítulo 2: La Conexión' },
        { id: 'sec-4', title: 'Conclusión' },
    ],
    content: "Descripción detallada para un video de YouTube.\n\nTIMESTAMP:\n00:00 - Introducción\n\n#SEO #VideoMarketing"
};

const scriptTemplates = [
    { 
        title: "Guion de Video (Hook, Story, Offer)", 
        content: "### HOOK (Primeros 3-5 segundos)\n\n*   Visual: Algo llamativo.\n*   Audio: Una frase que genere curiosidad.\n\n### STORY (Cuerpo del video)\n\n*   Presentación del problema o idea.\n*   Desarrollo de la narrativa.\n*   Climax o punto de inflexión.\n\n### OFFER (Cierre)\n\n*   Llamada a la acción clara (subscribirse, visitar un link, etc.).\n*   Pantalla final con información relevante." 
    },
    {
        title: "Guion para Short/Reel",
        content: "### HOOK RÁPIDO (1-2 segundos)\n\n*   PREGUNTA o AFIRMACIÓN POLÉMICA\n\n### DESARROLLO (5-10 segundos)\n\n*   Punto 1\n*   Punto 2\n*   Punto 3\n\n### CTA (Call To Action)\n\n*   'Sígueme para más' o 'Comenta tu opinión'"
    }
];

const blogTemplates = [
    { 
        title: "Estructura de Blog Post", 
        content: "# Título del Blog Post\n\n## Introducción\n\n*   Hook: Una pregunta o declaración audaz.\n*   Breve introducción al tema.\n\n## Punto Principal 1\n\n*   Desarrollo de la primera idea.\n*   Ejemplos o datos de apoyo.\n\n## Punto Principal 2\n\n*   Desarrollo de la segunda idea.\n*   Ejemplos o datos de apoyo.\n\n## Conclusión\n\n*   Resumen de los puntos clave.\n*   Llamada a la acción (CTA)." 
    },
];

const bookTemplates = [
     { 
        title: "Capítulo de Libro", 
        content: "# Capítulo X: Título del Capítulo\n\n## Apertura\n\n*   Anécdota o cita para empezar.\n\n## Desarrollo de la Tesis\n\n*   Argumento principal del capítulo.\n\n## Subsección 1\n\n*   Detalles y evidencias.\n\n## Subsección 2\n\n*   Más detalles y contraargumentos.\n\n## Cierre del Capítulo\n\n*   Resumen de lo aprendido.\n*   Transición al siguiente capítulo." 
    },
];

const socialTemplates = [
    {
        title: "Hook para X/Threads",
        content: "Este es un hook para X o Threads.\n\n#hashtag1 #hashtag2",
        platform: "x" as Platform
    },
    {
        title: "Descripción de YouTube",
        content: "Descripción detallada para un video de YouTube.\n\nTIMESTAMP:\n00:00 - Introducción\n\n#SEO #VideoMarketing",
        platform: "youtube" as Platform
    },
    {
        title: "Guion para TikTok",
        content: "### Trend/Sonido Popular\n\n- Hook Visual Rápido (1s)\n- Punto Clave 1 (3s)\n- Punto Clave 2 (5s)\n- CTA + Loop Visual (2s)",
        platform: "tiktok" as Platform
    },
    {
        title: "Copy para Post de Instagram",
        content: "Aquí va la descripción para Instagram.\n.\n.\n.\n#Hashtag1 #Hashtag2 #Hashtag3",
        platform: "instagram" as Platform
    },
    {
        title: "Idea General para Post",
        content: "## Idea Principal\n\n- Punto de apoyo 1\n- Punto de apoyo 2"
    }
];

const socialPlatformOptions: Platform[] = ["x", "instagram", "tiktok", "youtube"];

type Templates = {
    scripts: typeof scriptTemplates;
    blogs: typeof blogTemplates;
    books: typeof bookTemplates;
    socials: typeof socialTemplates;
}

type ProjectWorkspaceProps = {
  project: Project;
  onBack: () => void;
  onUpdateProject: (project: Project) => void;
  allProjects: Project[];
};

export const ScriptWorkspace = ({ project, onBack, onUpdateProject, allProjects }: ProjectWorkspaceProps) => {
  const [content, setContent] = useState(project.content || "");
  const [isDirty, setIsDirty] = useState(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [editingMode, setEditingMode] = useState<'project' | 'template'>('project');
  const [newTemplateContent, setNewTemplateContent] = useState("");
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [templates, setTemplates] = useState(scriptTemplates);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (editingMode === 'project') {
      setContent(project.content || "");
    }
  }, [project, editingMode]);

  useEffect(() => {
    if (editingMode === 'project') {
      setIsDirty(content !== (project.content || ""));
    }
  }, [content, project, editingMode]);

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
    console.log("Saving script content:", content);
    setIsDirty(false);
    onUpdateProject({ ...project, content });
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

  const handleImportFile = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setNewTemplateContent(text);
        setEditingMode('template');
      };
      reader.readAsText(file);
    }
    if(event.target) {
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
    setContent(templateContent);
  };

  const handleEditorChange = (value: string) => {
      if (editingMode === 'template') {
          setNewTemplateContent(value);
      } else {
          setContent(value);
      }
  }

  const editorContent = editingMode === 'project' ? content : newTemplateContent;

  return (
    <div className="h-full flex flex-col bg-black text-gray-300 font-mono">
      <input 
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        className="hidden"
        accept=".md,.txt"
      />
      
      <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={editingMode === 'project' ? handleBack : cancelTemplateCreation} className="text-gray-400 hover:bg-gray-800 hover:text-red-400">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-bold text-white">
            {editingMode === 'project' ? project.title : "Crear Nueva Plantilla"}
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
      <div className="flex-grow flex h-[calc(100%-73px)]">
        <aside className="w-1/3 lg:w-1/4 p-4 border-r border-gray-800 bg-gradient-to-r from-gray-900 to-black overflow-y-auto flex flex-col">
            <div>
                <h3 className="text-lg font-semibold mb-4 text-red-600">OUTLINE</h3>
                <ul className="space-y-2">
                    {mockWorkspaceData.outline.map(item => (
                        <li key={item.id} className={cn(
                          "cursor-pointer p-2 hover:bg-gray-800 rounded-md transition-colors text-sm",
                          editingMode === 'template' && "opacity-50 cursor-not-allowed"
                        )}>
                            {item.title}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mt-auto pt-4">
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
                          <FilePlus className="h-4 w-4" /> PLANTILLAS DE SCRIPT
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
                         <DropdownMenuItem onSelect={handleImportFile} className="hover:bg-gray-800 hover:text-white flex items-center gap-2">
                           <Upload className="h-4 w-4" /> Importar Archivo
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </aside>

        <main className="w-2/3 lg:w-3/4 flex flex-col bg-black">
           <div className="p-4 flex-grow">
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