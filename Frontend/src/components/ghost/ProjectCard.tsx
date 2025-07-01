import { Project } from "@/lib/ghost-agent-data";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Book, FileText, Rss, Share2, Twitter, Twitch, Youtube, Instagram, Facebook } from "lucide-react";
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
};

export const ProjectCard = ({ project, onSelectProject, onUpdateProject }: ProjectCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(project.title);
    const [editedDescription, setEditedDescription] = useState(project.description || "");
  const [socialPlatforms, setSocialPlatforms] = useState(project.socialPlatforms || []);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
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
            <CardFooter className="mt-auto flex justify-end p-4">
                 <Dialog open={isEditing} onOpenChange={(isOpen) => !isOpen && handleCancel(new MouseEvent('click') as any)}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={handleEdit} className="text-gray-400 hover:text-red-400">Edit</Button>
                    </DialogTrigger>
                    <DialogContent onClick={(e) => e.stopPropagation()} className="bg-gray-900 border-gray-700 text-white">
                        <DialogHeader>
                            <DialogTitle>Edit Project Details</DialogTitle>
                            <DialogDescription>
                                Make changes to your project here. Click save when you're done.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="title" className="text-right">Title</label>
                                <Input id="title" value={editedTitle} onChange={e => setEditedTitle(e.target.value)} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="description" className="text-right">Description</label>
                                <Textarea id="description" value={editedDescription} onChange={e => setEditedDescription(e.target.value)} className="col-span-3" />
                            </div>
                            {project.type === 'social' && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <label className="text-right">Platforms</label>
                                    <div className="col-span-3 grid grid-cols-3 gap-2">
                                        {Object.keys(socialIcons).map(platform => (
                  <label key={platform} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={socialPlatforms.includes(platform)}
                      onChange={() => handleSocialPlatformChange(platform)}
                      className="accent-red-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                    {platform}
                  </label>
                ))}
              </div>
            </div>
          )}
              </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                            <Button onClick={handleSave}>Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
        <ConfirmationDialog
            isOpen={showSaveConfirm}
                    onClose={() => setShowSaveConfirm(false)}
                    onConfirm={handleConfirmLeave}
                    title="Discard changes?"
                    description="You have unsaved changes. Are you sure you want to discard them?"
                />
            </CardFooter>
        </Card>
  );
}; 