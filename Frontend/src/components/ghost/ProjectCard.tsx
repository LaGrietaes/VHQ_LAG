import { Project, Platform, initialBlogCategories } from "@/lib/ghost-agent-data";
import { useState, useRef, useEffect } from "react";
import { Edit, Save, XCircle, Monitor, Smartphone, Youtube, Instagram, Clock, Timer, Link, Share2, Twitter, MessageSquare } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { socialPlatforms as socialPlatformOptions } from "@/lib/ghost-agent-data";
import { ConfirmationDialog } from "../ui/ConfirmationDialog";

// A simple component for the TikTok icon
const TikTokIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.528 8.004H16.18V4.348h-3.652v11.397a4.348 4.348 0 1 1-4.348-4.348" />
  </svg>
);

const YoutubeShortsIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" strokeWidth="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-red-500">
        <path d="M10 15.5V8.5L16 12L10 15.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" />
        <path d="M2 12C2 16.9706 6.02944 21 11 21C15.9706 21 20 16.9706 20 12C20 7.02944 15.9706 3 11 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 12C22 16.9706 17.9706 21 13 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const platformIcons: { [key in Platform]: React.ReactNode } = {
  youtube: <Youtube size={16} className="text-red-600" />,
  instagram: <Instagram size={16} className="text-pink-500" />,
  tiktok: <TikTokIcon />,
  youtube_shorts: <YoutubeShortsIcon />,
  x: <Twitter size={14} className="text-sky-500" />,
  threads: <MessageSquare size={14} className="text-gray-400" />,
};

const scriptPlatforms: Platform[] = ["youtube", "instagram", "tiktok", "youtube_shorts"];

type ProjectCardProps = {
  project: Project;
  onUpdateProject: (project: Project) => void;
  onSelectProject: (project: Project) => void;
};

export const ProjectCard = ({ project, onUpdateProject, onSelectProject }: ProjectCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(project.title);
  const [category, setCategory] = useState(project.category);
  const [platforms, setPlatforms] = useState(project.platforms || []);
  const [blogCategory, setBlogCategory] = useState(project.blogCategory);
  const [duration, setDuration] = useState(project.duration);
  const [readingTime, setReadingTime] = useState(project.readingTime);
  const [socialPlatforms, setSocialPlatforms] = useState(project.socialPlatforms || []);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const isDirty = () => {
    return (
      title !== project.title ||
      category !== project.category ||
      blogCategory !== project.blogCategory ||
      duration !== project.duration ||
      readingTime !== project.readingTime ||
      JSON.stringify(platforms.sort()) !== JSON.stringify((project.platforms || []).sort()) ||
      JSON.stringify(socialPlatforms.sort()) !== JSON.stringify((project.socialPlatforms || []).sort())
    );
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        if (isDirty()) {
          setShowSaveConfirm(true);
        } else {
          setIsEditing(false);
        }
      }
    };

    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing, title, category, blogCategory, duration, readingTime, platforms, socialPlatforms]);

  const handlePlatformChange = (platform: Platform) => {
    setPlatforms(prev =>
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  const handleSave = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onUpdateProject({ ...project, title, category, platforms, blogCategory, duration, readingTime, socialPlatforms });
    setIsEditing(false);
    setShowSaveConfirm(false);
  };

  const handleCancel = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setTitle(project.title);
    setCategory(project.category);
    setPlatforms(project.platforms || []);
    setBlogCategory(project.blogCategory);
    setDuration(project.duration);
    setReadingTime(project.readingTime);
    setSocialPlatforms(project.socialPlatforms || []);
    setIsEditing(false);
    setShowSaveConfirm(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <>
        <div ref={cardRef} className="bg-gradient-to-b from-gray-800 to-gray-900 border border-red-600 p-4 flex flex-col justify-between group transition-all relative">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-black text-white font-mono text-lg font-bold mb-2 p-1 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-red-500"
            onClick={(e) => e.stopPropagation()}
          />
          {project.category && (
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as "Video" | "Short")}
              className="bg-black text-white text-xs p-1 border border-gray-700 w-full mb-4 font-mono focus:outline-none focus:ring-1 focus:ring-red-500"
              onClick={(e) => e.stopPropagation()}
            >
              <option value="Video">Video</option>
              <option value="Short">Short</option>
            </select>
          )}
          {project.blogCategory && (
              <select
                  value={blogCategory}
                  onChange={(e) => setBlogCategory(e.target.value)}
                  className="bg-black text-white text-xs p-1 border border-gray-700 w-full mb-4 font-mono focus:outline-none focus:ring-1 focus:ring-red-500"
                  onClick={(e) => e.stopPropagation()}
              >
                  {initialBlogCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
          )}
          {project.socialPlatforms && (
            <div className="space-y-2 my-4">
              <h4 className="text-xs text-gray-400 font-mono">Platforms</h4>
              <div className="grid grid-cols-3 gap-2">
                {socialPlatformOptions.map(platform => (
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
          {project.duration !== undefined && (
               <div className="mt-2">
                  <label className="text-xs text-gray-400 font-mono">Duration (mm:ss)</label>
                  <input
                      type="text" value={duration} onChange={(e) => setDuration(e.target.value)}
                      className="bg-black text-white text-xs p-1 border border-gray-700 w-full mt-1 font-mono focus:outline-none focus:ring-1 focus:ring-red-500"
                      onClick={(e) => e.stopPropagation()}
                  />
              </div>
          )}
           {project.category && (
            <div className="space-y-2 my-4">
              <h4 className="text-xs text-gray-400 font-mono">Platforms</h4>
              <div className="grid grid-cols-2 gap-2">
                {scriptPlatforms.map(platform => (
                  <label key={platform} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={platforms.includes(platform)}
                      onChange={() => handlePlatformChange(platform)}
                      className="accent-red-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                    {platform.replace('_', ' ')}
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-auto pt-4">
            <button onClick={handleCancel} className="p-1 text-gray-500 hover:text-red-400" aria-label="Cancel"><XCircle size={20} /></button>
            <button onClick={handleSave} className="p-1 text-gray-500 hover:text-green-400" aria-label="Save"><Save size={20} /></button>
          </div>
        </div>
        <ConfirmationDialog
            isOpen={showSaveConfirm}
            onSave={() => handleSave()}
            onDiscard={() => handleCancel()}
            onCancel={() => setShowSaveConfirm(false)}
            title="Guardar Cambios"
            message="Tienes cambios sin guardar. ¿Quieres guardarlos?"
        />
      </>
    );
  }

  return (
    <div
      onClick={() => onSelectProject(project)}
      className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4 flex flex-col justify-between cursor-pointer group hover:border-red-600 transition-all relative"
    >
      <button onClick={handleEditClick} className="absolute top-2 right-2 p-1 text-gray-600 group-hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Edit Project">
        <Edit size={16} />
      </button>

      <div className="pr-6">
        <div className="flex items-center gap-3 mb-2">
           {project.category === 'Video' && <Monitor size={20} className="text-gray-600 flex-shrink-0" />}
           {project.category === 'Short' && <Smartphone size={20} className="text-gray-600 flex-shrink-0" />}
           <h3 className="text-lg font-bold text-white font-mono group-hover:text-red-400 transition-colors truncate">
              {project.title}
           </h3>
        </div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 ${project.status === 'Finalizado' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'}`}>{project.status}</span>
            {project.blogCategory && (
                <span className="text-xs px-2 py-0.5 bg-blue-800 text-white">{project.blogCategory}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {project.duration && (
                <div className="flex items-center gap-1 text-xs text-gray-500 font-mono">
                    <Clock size={12} />
                    <span>{project.duration}</span>
                </div>
            )}
            {project.readingTime && (
                 <div className="flex items-center gap-1 text-xs text-gray-500 font-mono">
                    <Timer size={12} />
                    <span>{project.readingTime}</span>
                </div>
            )}
            {project.platforms?.map(p => <span key={p}>{platformIcons[p]}</span>)}
          </div>
        </div>
      </div>
      <div className="flex items-center mt-auto pt-4">
        <div className="w-full bg-gray-800 h-2">
          <div className="bg-red-600 h-2" style={{ width: `${project.progress}%` }}></div>
        </div>
        {project.relatedProjectIds && project.relatedProjectIds.length > 0 && (
          <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Link size={14} />
                    <span className="text-xs">{project.relatedProjectIds.length}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-800 text-white border-gray-700">
                  <p>Linked to {project.relatedProjectIds.length} other items</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    </div>
  );
}; 