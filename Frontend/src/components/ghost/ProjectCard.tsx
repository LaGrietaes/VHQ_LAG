import { Project } from "@/lib/ghost-agent-data";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Book, FileText, Rss, Share2, Twitter, Twitch, Youtube, Instagram, Facebook, Trash2 } from "lucide-react";
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmationDialog } from "../ui/ConfirmationDialog";

// A simple component for the TikTok icon
const TikTokIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.03-4.83-.95-6.43-2.88-1.59-1.92-2.31-4.56-2.09-7.18.2-2.43 1.1-4.72 2.4-6.61l.01-.02c1.8-2.61 4.9-4.06 8.02-4.27.1-3.39.08-6.78.02-10.16z"></path>
    </svg>
);

const socialIcons = {
    Twitter: <Twitter />,
    Twitch: <Twitch />,
    YouTube: <Youtube />,
    Instagram: <Instagram />,
    Facebook: <Facebook />,
    x: <Twitter />,
  tiktok: <TikTokIcon />,
    youtube_shorts: <Youtube />
};

type ProjectCardProps = {
  project: Project;
    onSelectProject: (project: Project) => void;
  onUpdateProject: (project: Project) => void;
  onDeleteProject?: (project: Project) => void;
};

export const ProjectCard = ({ project, onSelectProject, onUpdateProject, onDeleteProject }: ProjectCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(project.title);
    const [editedDescription, setEditedDescription] = useState(project.description || "");
  const [socialPlatforms, setSocialPlatforms] = useState(project.socialPlatforms || []);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  const isDirty = () => {
        return editedTitle !== project.title || 
               editedDescription !== (project.description || "") ||
               JSON.stringify(socialPlatforms.sort()) !== JSON.stringify((project.socialPlatforms || []).sort());
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(true);
    };

    const handleSave = (e?: React.MouseEvent) => {
        if(e) e.stopPropagation();
        if (isDirty()) {
            onUpdateProject({ ...project, title: editedTitle, description: editedDescription, socialPlatforms });
        }
        setIsEditing(false);
    };

    const handleCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        if(isDirty()){
            setShowSaveConfirm(true);
        } else {
            setIsEditing(false);
        }
    };
    
    const handleConfirmLeave = () => {
        setEditedTitle(project.title);
        setEditedDescription(project.description || "");
    setSocialPlatforms(project.socialPlatforms || []);
    setIsEditing(false);
    setShowSaveConfirm(false);
  };

    const handleSocialPlatformChange = (platform: string) => {
        setSocialPlatforms(prev => 
            prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
        );
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(false);  // Close the edit dialog first
        setDeleteConfirmText("");  // Reset the confirmation text
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        try {
            console.log('Attempting to delete project:', {
                title: project.title,
                confirmText: deleteConfirmText,
                path: project.path
            });

            if (deleteConfirmText !== project.title) {
                console.log('Delete confirmation text does not match');
                return;
            }

            const response = await fetch('/api/workspace/deleteItem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectRootPath: project.path,
                    itemId: null // Delete entire project
                }),
            });

            const data = await response.json();
            console.log('Delete response:', data);

            if (!response.ok) {
                throw new Error(data.message || data.details || 'Failed to delete project');
            }

            setShowDeleteConfirm(false);
            setDeleteConfirmText("");
            onDeleteProject?.(project);
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Failed to delete project: ' + (error as Error).message);
        }
    };

    const progress = project.status === "Completed" ? 100 : (project.progress || 0);
    const statusColor = project.status === "Completed" ? "bg-green-500" :
                        project.status === "In Progress" ? "bg-blue-500" :
                        project.status === "Planning" ? "bg-yellow-500" : "bg-gray-500";

    const getIcon = () => {
        switch(project.type) {
            case 'book': return <Book className="h-6 w-6 text-gray-400" />;
            case 'script': return <FileText className="h-6 w-6 text-gray-400" />;
            case 'blog': return <Rss className="h-6 w-6 text-gray-400" />;
            case 'social': return <Share2 className="h-6 w-6 text-gray-400" />;
            default: return null;
        }
    };

    return (
        <Card ref={cardRef} onClick={() => onSelectProject(project)} className="bg-gray-900/50 border-gray-800 text-white font-mono flex flex-col justify-between hover:border-red-600 transition-colors cursor-pointer min-h-[280px] overflow-hidden">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="flex-grow">
                        <CardTitle className="text-lg font-bold text-red-500">{project.title}</CardTitle>
                        <CardDescription className="text-gray-400 text-sm mt-1">{project.description || ""}</CardDescription>
                    </div>
                    {getIcon()}
                </div>
            </CardHeader>
            <CardContent>
                {project.type === 'social' && project.socialPlatforms && (
                     <div className="flex flex-wrap gap-2">
                        {project.socialPlatforms.map(platform => (
                            <Badge key={platform} variant="secondary" className="gap-1.5 pl-2 pr-2.5 py-1 text-xs">
                                {socialIcons[platform]}
                                {platform}
                            </Badge>
                        ))}
                    </div>
                )}
                {project.type !== 'social' && (
                    <>
                        <div className="text-sm text-gray-400 mb-2">Status: <span className={`font-bold ${
                            project.status === "Completed" ? "text-green-400" :
                            project.status === "In Progress" ? "text-blue-400" :
                            "text-yellow-400"
                        }`}>{project.status}</span></div>
                        <Progress value={progress} className="w-full [&>div]:bg-red-600 h-2" />
                    </>
                )}
            </CardContent>
            <CardFooter className="mt-auto flex justify-end p-4 gap-2">
                <Dialog 
                    open={isEditing} 
                    onOpenChange={(isOpen) => {
                        if (!isOpen) {
                            handleCancel(new MouseEvent('click') as any);
                        }
                    }}
                >
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={handleEdit} className="text-gray-400 hover:text-red-400">Edit</Button>
                    </DialogTrigger>
                    <DialogContent onClick={(e) => e.stopPropagation()} className="bg-gray-900/95 border-gray-700 text-white backdrop-blur-sm">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-red-500">Edit Project Details</DialogTitle>
                            <DialogDescription className="text-gray-300">
                                Make changes to your project here. Click save when you're done.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="title" className="text-right text-gray-300">Title</label>
                                <Input 
                                    id="title" 
                                    value={editedTitle} 
                                    onChange={e => {
                                        e.stopPropagation();
                                        setEditedTitle(e.target.value);
                                    }}
                                    onClick={e => e.stopPropagation()}
                                    className="col-span-3 bg-gray-800 border-gray-700 text-white" 
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="description" className="text-right text-gray-300">Description</label>
                                <Textarea 
                                    id="description" 
                                    value={editedDescription} 
                                    onChange={e => {
                                        e.stopPropagation();
                                        setEditedDescription(e.target.value);
                                    }}
                                    onClick={e => e.stopPropagation()}
                                    className="col-span-3 bg-gray-800 border-gray-700 text-white" 
                                />
                            </div>
                            {project.type === 'social' && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <label className="text-right text-gray-300">Platforms</label>
                                    <div className="col-span-3 grid grid-cols-3 gap-2">
                                        {Object.keys(socialIcons).map(platform => (
                                            <label key={platform} className="flex items-center gap-2 text-sm cursor-pointer text-gray-300">
                                                <input
                                                    type="checkbox"
                                                    checked={socialPlatforms.includes(platform)}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        handleSocialPlatformChange(platform);
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="accent-red-500"
                                                />
                                                {platform}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={handleCancel} className="bg-transparent hover:bg-gray-800">Cancel</Button>
                            <Button 
                                variant="destructive" 
                                onClick={handleDelete} 
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Delete Project
                            </Button>
                            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <ConfirmationDialog
                    isOpen={showSaveConfirm}
                    onCancel={() => setShowSaveConfirm(false)}
                    onConfirm={handleConfirmLeave}
                    title="Discard changes?"
                    message="You have unsaved changes. Are you sure you want to discard them?"
                    confirmText="Discard"
                    confirmVariant="destructive"
                />

                <ConfirmationDialog
                    isOpen={showDeleteConfirm}
                    onCancel={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmText("");
                    }}
                    onConfirm={confirmDelete}
                    onConfirmationTextChange={setDeleteConfirmText}
                    title="Delete Project Permanently"
                    message={`This will permanently delete the project "${project.title}" and ALL its files. This action cannot be undone.\n\nType "${project.title}" to confirm deletion.`}
                    confirmText="Delete Project"
                    confirmVariant="destructive"
                    requireConfirmationText={project.title}
                    confirmationPlaceholder={`Type "${project.title}" to confirm`}
                />
            </CardFooter>
        </Card>
    );
}; 