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
} from "@/components/ui/dropdown-menu";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useState, useEffect, useRef, Fragment } from "react";
import { cn } from "@/lib/utils";
import { ConfirmationDialog } from "../ui/ConfirmationDialog";
import { LinkProjectDialog } from "./LinkProjectDialog";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import EmojiPicker, { EmojiClickData, Theme, EmojiStyle, SuggestionMode } from "emoji-picker-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const platformIcons: { [key in Platform]: React.ReactNode } = {
  youtube: <Youtube size={16} />,
  instagram: <Instagram size={16} />,
  tiktok: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.528 8.004H16.18V4.348h-3.652v11.397a4.348 4.348 0 1 1-4.348-4.348" /></svg>,
  youtube_shorts: <svg width="16" height="16" viewBox="0 0 24 24" strokeWidth="1.5" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 15.5V8.5L16 12L10 15.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" /><path d="M2 12C2 16.9706 6.02944 21 11 21C15.9706 21 20 16.9706 20 12C20 7.02944 15.9706 3 11 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /><path d="M22 12C22 16.9706 17.9706 21 13 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  x: <Twitter size={14} />,
  threads: <MessageSquare size={14} />,
};

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

type SocialWorkspaceProps = {
  project: Project;
  onBack: () => void;
  onUpdateProject: (project: Project) => void;
  allProjects: Project[];
};

export const SocialWorkspace = ({ project, onBack, onUpdateProject, allProjects }: SocialWorkspaceProps) => {
  const [isDirty, setIsDirty] = useState(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [platformContents, setPlatformContents] = useState<{ [key: string]: string }>({});
  const [activeEmojiPicker, setActiveEmojiPicker] = useState<Platform | null>(null);
  const textareaRefs = useRef<{ [key in Platform]?: HTMLTextAreaElement | null }>({});

  useEffect(() => {
      const initialContents: { [key: string]: string } = {};
      if (project.socialPlatforms) {
        project.socialPlatforms.forEach(p => {
          initialContents[p] = project.platformOverrides?.[p] ?? project.content ?? "";
        });
      }
      setPlatformContents(initialContents);
  }, [project]);

  useEffect(() => {
      const originalContent = project.content || "";
      const originalOverrides = project.platformOverrides || {};
      const dirty = Object.keys(platformContents).some(platform => {
        const original = originalOverrides[platform as Platform] ?? originalContent;
        return platformContents[platform] !== original;
      });
      setIsDirty(dirty);
  }, [platformContents, project]);

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
    console.log("Saving social content:", platformContents);
    setIsDirty(false);
    
    const newOverrides: { [key in Platform]?: string } = {};
    Object.keys(platformContents).forEach(p => {
        newOverrides[p as Platform] = platformContents[p];
    });
    onUpdateProject({ ...project, platformOverrides: newOverrides });
  };

  const handleSaveAndExit = () => {
    handleSave();
    onBack();
  };

  const handleTemplateSelect = (templateContent: string, platform?: Platform) => {
      if (platform) {
          if (project.socialPlatforms?.includes(platform)) {
              setPlatformContents(prev => ({...prev, [platform]: templateContent}));
          }
      } else {
          const newPlatformContents: { [key: string]: string } = {};
          (project.socialPlatforms || []).forEach(p => {
              newPlatformContents[p] = templateContent;
          });
          setPlatformContents(prev => ({...prev, ...newPlatformContents}));
      }
  };

  const handleEmojiSelect = (emojiData: EmojiClickData, platform: Platform) => {
    const ref = textareaRefs.current[platform];
    if (ref) {
      const start = ref.selectionStart;
      const end = ref.selectionEnd;
      const text = ref.value;
      const newText = text.substring(0, start) + emojiData.emoji + text.substring(end);
      
      handleEditorChange(newText, platform)

      setTimeout(() => {
        ref.focus();
        ref.selectionStart = ref.selectionEnd = start + emojiData.emoji.length;
      }, 0);
    }
  };

  const handleEditorChange = (value: string, platform: Platform) => {
      setPlatformContents(prev => ({...prev, [platform]: value }));
  }

  const handleSocialPlatformToggle = (platform: Platform) => {
    const currentPlatforms = project.socialPlatforms || [];
    const newPlatforms = currentPlatforms.includes(platform)
      ? currentPlatforms.filter(p => p !== platform)
      : [...currentPlatforms, platform];

    if (!newPlatforms.includes(platform)) {
        setPlatformContents(prev => {
            const newContents = {...prev};
            delete newContents[platform];
            return newContents;
        })
    }

    onUpdateProject({ ...project, socialPlatforms: newPlatforms });
  };

  const leftColPlatforms = (project.socialPlatforms || []).filter((_, i) => i % 2 === 0);
  const rightColPlatforms = (project.socialPlatforms || []).filter((_, i) => i % 2 === 1);

  return (
    <div className="h-full flex flex-col bg-black text-gray-300 font-mono">
      <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack} className="text-gray-400 hover:bg-gray-800 hover:text-red-400">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-bold text-white">
            {project.title}
          </h2>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsLinkDialogOpen(true)} className="border-gray-700 hover:border-red-600 hover:bg-gray-900 hover:text-red-400 flex items-center gap-2">
              <Link className="h-4 w-4" /> LINK CONTENT
            </Button>
            <Button variant="outline" className="border-gray-700 hover:border-red-600 hover:bg-gray-900 hover:text-red-400">
              <FileSignature className="h-4 w-4 mr-2"/> GEN DRAFT
            </Button>
        </div>
      </header>
      <PanelGroup direction="horizontal" className="flex-grow flex h-[calc(100%-73px)]">
          <Panel defaultSize={75}>
            <main className="w-full h-full flex flex-col bg-black">
                <div className="p-4 flex-grow h-full">
                    {(!project.socialPlatforms || project.socialPlatforms.length === 0) ? (
                        <div className="col-span-full flex items-center justify-center text-gray-600 h-full">
                            Selecciona una plataforma social en la parte inferior para empezar.
                        </div>
                    ) : (
                        <PanelGroup direction="horizontal" className="h-full w-full">
                            <Panel defaultSize={50} minSize={25}>
                                <PanelGroup direction="vertical">
                                    {leftColPlatforms.map((platform, index) => (
                                        <Fragment key={platform}>
                                            <Panel id={platform} order={index} minSize={20}>
                                                 <div className="bg-gray-900/50 rounded-lg border border-gray-800 h-full overflow-hidden flex flex-row">
                                                    <div className="flex-grow p-3 flex flex-col relative">
                                                         <div className="absolute top-3 right-3 text-gray-600">
                                                            {platformIcons[platform]}
                                                        </div>
                                                        <textarea 
                                                            ref={(el) => { textareaRefs.current[platform] = el; }}
                                                            className="w-full flex-grow bg-transparent text-gray-300 font-mono text-sm border-none focus:outline-none leading-relaxed resize-none pr-4"
                                                            value={platformContents[platform] ?? ''}
                                                            onChange={(e) => handleEditorChange(e.target.value, platform)}
                                                            placeholder={`Escribe para ${platform}...`}
                                                        />
                                                        <div className="text-right text-xs text-gray-500 pt-2 font-mono flex-shrink-0 flex items-center justify-end gap-2">
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-500 hover:text-white" onClick={() => setActiveEmojiPicker(activeEmojiPicker === platform ? null : platform)}>
                                                                <Smile size={14}/>
                                                            </Button>
                                                            <span>
                                                                {platformContents[platform]?.length || 0} / {platformCharLimits[platform]}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {activeEmojiPicker === platform && (
                                                        <div className="flex-shrink-0 border-l border-gray-800 bg-black/20" style={{'--epr-bg-color': 'transparent'} as React.CSSProperties}>
                                                            <EmojiPicker 
                                                                onEmojiClick={(emojiData) => handleEmojiSelect(emojiData, platform)}
                                                                theme={Theme.DARK}
                                                                emojiStyle={EmojiStyle.NATIVE}
                                                                height="100%"
                                                                width={300}
                                                                searchDisabled={false}
                                                                suggestedEmojisMode={SuggestionMode.RECENT}
                                                                previewConfig={{ showPreview: false }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </Panel>
                                            {index < leftColPlatforms.length - 1 && (
                                                <PanelResizeHandle className="w-2 mx-1 bg-gray-800 hover:bg-red-600 transition-colors rounded-full" />
                                            )}
                                        </Fragment>
                                    ))}
                                </PanelGroup>
                            </Panel>
                            <PanelResizeHandle className="w-2 mx-1 bg-gray-800 hover:bg-red-600 transition-colors rounded-full" />
                            <Panel defaultSize={50} minSize={25}>
                                 <PanelGroup direction="vertical">
                                    {rightColPlatforms.map((platform, index) => (
                                        <Fragment key={platform}>
                                            <Panel id={platform} order={index} minSize={20}>
                                                 <div className="bg-gray-900/50 rounded-lg border border-gray-800 h-full overflow-hidden flex flex-row">
                                                    <div className="flex-grow p-3 flex flex-col relative">
                                                         <div className="absolute top-3 right-3 text-gray-600">
                                                            {platformIcons[platform]}
                                                        </div>
                                                        <textarea 
                                                            ref={(el) => { textareaRefs.current[platform] = el; }}
                                                            className="w-full flex-grow bg-transparent text-gray-300 font-mono text-sm border-none focus:outline-none leading-relaxed resize-none pr-4"
                                                            value={platformContents[platform] ?? ''}
                                                            onChange={(e) => handleEditorChange(e.target.value, platform)}
                                                            placeholder={`Escribe para ${platform}...`}
                                                        />
                                                        <div className="text-right text-xs text-gray-500 pt-2 font-mono flex-shrink-0 flex items-center justify-end gap-2">
                                                             <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-500 hover:text-white" onClick={() => setActiveEmojiPicker(activeEmojiPicker === platform ? null : platform)}>
                                                                <Smile size={14}/>
                                                            </Button>
                                                             <span>
                                                                {platformContents[platform]?.length || 0} / {platformCharLimits[platform]}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {activeEmojiPicker === platform && (
                                                        <div className="flex-shrink-0 border-l border-gray-800 bg-black/20" style={{'--epr-bg-color': 'transparent'} as React.CSSProperties}>
                                                            <EmojiPicker 
                                                                onEmojiClick={(emojiData) => handleEmojiSelect(emojiData, platform)}
                                                                theme={Theme.DARK}
                                                                emojiStyle={EmojiStyle.NATIVE}
                                                                height="100%"
                                                                width={300}
                                                                searchDisabled={false}
                                                                suggestedEmojisMode={SuggestionMode.RECENT}
                                                                previewConfig={{ showPreview: false }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </Panel>
                                            {index < rightColPlatforms.length - 1 && (
                                                <PanelResizeHandle className="w-full h-1 bg-gray-800 hover:bg-red-600 transition-colors" />
                                            )}
                                        </Fragment>
                                    ))}
                                </PanelGroup>
                            </Panel>
                        </PanelGroup>
                    )}
                </div>
                <footer className="flex-shrink-0 flex items-center justify-between p-2 border-t border-gray-800 bg-black">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 p-1 border border-gray-700 rounded-md h-full">
                            {socialPlatformOptions.map(p => {
                                const isSelected = project.socialPlatforms?.includes(p) ?? false;
                                return (
                                    <TooltipProvider key={p}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => handleSocialPlatformToggle(p)}
                                                    className={cn("hover:bg-gray-800 h-full aspect-square", isSelected ? 'text-red-500' : 'text-gray-600 hover:text-red-400')}
                                                >
                                                    {platformIcons[p]}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-gray-800 text-white border-gray-700">
                                                <p>{p.charAt(0).toUpperCase() + p.slice(1)}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )
                            })}
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="border-gray-700 hover:border-red-600 hover:bg-gray-900 hover:text-red-400">
                                    <FilePlus className="h-4 w-4 mr-2" /> Insertar Plantilla
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-64 bg-gray-900 border-gray-700 text-gray-300">
                                <DropdownMenuLabel>Plantillas Generales</DropdownMenuLabel>
                                {socialTemplates
                                    .filter(t => !t.platform)
                                    .map(template => (
                                        <DropdownMenuItem 
                                            key={template.title} 
                                            onSelect={() => handleTemplateSelect(template.content)}
                                            className="hover:bg-gray-800 hover:text-white"
                                        >
                                            {template.title}
                                        </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator className="bg-gray-700"/>
                                <DropdownMenuLabel>Plantillas por Plataforma</DropdownMenuLabel>
                                {socialPlatformOptions.map(platform => {
                                    const platformTemplates = socialTemplates.filter(t => t.platform === platform);
                                    if (platformTemplates.length === 0) return null;
                                    return (
                                        <DropdownMenuSub key={platform}>
                                            <DropdownMenuSubTrigger className="hover:bg-gray-800 hover:text-white focus:bg-gray-700">
                                                <span>{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuPortal>
                                                <DropdownMenuSubContent className="w-56 bg-gray-900 border-gray-700 text-gray-300" sideOffset={8} alignOffset={-5}>
                                                    {platformTemplates.map(template => (
                                                        <DropdownMenuItem 
                                                            key={template.title}
                                                            onSelect={() => handleTemplateSelect(template.content, platform)}
                                                            className="hover:bg-gray-800 hover:text-white"
                                                        >
                                                            {template.title}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuSubContent>
                                            </DropdownMenuPortal>
                                        </DropdownMenuSub>
                                    );
                                })}
                                <DropdownMenuSeparator className="bg-gray-700"/>
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger className="text-green-400 focus:bg-green-900/50 focus:text-green-300 data-[state=open]:bg-green-900/50">
                                        <FilePlus className="h-4 w-4 mr-2" />
                                        <span>Añadir nueva plantilla</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                        <DropdownMenuSubContent className="w-56 bg-gray-900 border-gray-700 text-gray-300" sideOffset={8} alignOffset={-5}>
                                            <DropdownMenuItem onSelect={() => alert('TODO: Implement Import Template')} className="hover:bg-gray-800 hover:text-white">
                                                Importar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => alert('TODO: Implement Create New Template')} className="hover:bg-gray-800 hover:text-white">
                                                Crear desde cero
                                            </DropdownMenuItem>
                                        </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                </DropdownMenuSub>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="flex items-center">
                        <Button onClick={handleSave} disabled={!isDirty} variant="default" className="bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-700 disabled:text-gray-500">
                            <Save className="h-4 w-4 mr-2" /> Guardar Cambios
                        </Button>
                    </div>
                </footer>
            </main>
        </Panel>
        <PanelResizeHandle className="w-2 bg-gray-800 hover:bg-red-600 transition-colors" />
        <Panel defaultSize={25} minSize={15} maxSize={40} collapsible={true} collapsedSize={4} className="bg-gray-900/30 border-l border-gray-800 flex flex-col min-w-[50px]">
            <Tabs defaultValue="cm" className="flex flex-col h-full">
                <div className="p-1 border-b border-gray-800">
                    <TabsList className="grid w-full grid-cols-2 bg-gray-900/50">
                        <TabsTrigger value="cm">CM</TabsTrigger>
                        <TabsTrigger value="psico">Psico</TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="cm" className="flex-grow p-4">
                    <p className="text-gray-500 text-center">Community Manager oversight tools will appear here.</p>
                </TabsContent>
                <TabsContent value="psico" className="flex-grow p-4">
                    <p className="text-gray-500 text-center">Psychology insights will appear here.</p>
                </TabsContent>
            </Tabs>
        </Panel>
    </PanelGroup>
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