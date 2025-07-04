"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Book, FileText, Rss, Share2, ListChecks, Clock, Bot } from "lucide-react";
import { Project, ScriptProject, BlogPostProject, BookProject } from "@/lib/ghost-agent-data";
import { useState, useEffect, useCallback } from "react";
import BookWorkspace from "./BookWorkspace";
import { ScriptWorkspace } from "./ScriptWorkspace";
import { BlogWorkspace } from "./BlogWorkspace";
import { cn } from "@/lib/utils";
import { ProjectCard } from "./ProjectCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const UpcomingTasks = () => (
  <Card className="bg-gray-900/50 border-gray-800">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-red-500">Upcoming Tasks</CardTitle>
      <ListChecks className="w-4 h-4 text-gray-500" />
    </CardHeader>
    <CardContent>
      <div className="text-sm text-gray-400">- Finalize Chapter 3 of "AI Revolution"</div>
      <div className="text-sm text-gray-400">- Draft script for "Web3 Explained"</div>
      <div className="text-sm text-gray-400">- Schedule social media posts for launch</div>
    </CardContent>
  </Card>
);

const Deadlines = () => (
  <Card className="bg-gray-900/50 border-gray-800">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-red-500">Deadlines</CardTitle>
      <Clock className="w-4 h-4 text-gray-500" />
    </CardHeader>
    <CardContent>
        <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">"AI Revolution" First Draft</span>
            <span className="font-bold text-amber-400">3 days</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-400">"Web3 Explained" Script</span>
            <span className="font-bold text-red-500">Tomorrow</span>
        </div>
    </CardContent>
  </Card>
);

const AgentLogs = () => (
    <Card className="bg-gray-900/50 border-gray-800">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-red-500">Agent Logs</CardTitle>
      <Bot className="w-4 h-4 text-gray-500" />
    </CardHeader>
    <CardContent className="text-xs text-gray-500 space-y-2">
        <div><span className="font-bold text-cyan-400">[SEO]</span> Analyzed keywords for "Web3 Explained". High competition.</div>
        <div><span className="font-bold text-pink-400">[PSY]</span> User sentiment on last post was 85% positive.</div>
        <div><span className="font-bold text-lime-400">[CM]</span> Found 3 new trending topics in the AI niche.</div>
    </CardContent>
  </Card>
)

interface NewProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
}

const NewProjectDialog = ({ isOpen, onClose, onProjectCreated }: NewProjectDialogProps) => {
    const [projectName, setProjectName] = useState("");
    const [projectType, setProjectType] = useState<'book' | 'blog' | 'script'>('book');

    const handleCreate = async () => {
        if (!projectName) return;
        try {
            const response = await fetch('/api/projects/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: projectName, type: projectType }),
            });
            if (response.ok) {
                onProjectCreated();
                onClose();
            } else {
                const err = await response.json();
                console.error("Failed to create project", err.error);
            }
        } catch (error) {
            console.error("Error creating project", error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Input
                        placeholder="Project Name"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                    />
                    <Select onValueChange={(value) => setProjectType(value as 'book' | 'blog' | 'script')} defaultValue={projectType}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="book">Book</SelectItem>
                            <SelectItem value="blog">Blog Post</SelectItem>
                            <SelectItem value="script">Script</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button onClick={handleCreate}>Create Project</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const ProjectList = ({ projects, onProjectSelect, onUpdateProject, onDeleteProject }: { 
  projects: Project[], 
  onProjectSelect: (project: Project) => void,
  onUpdateProject: (project: Project) => void,
  onDeleteProject: (project: Project) => void
}) => {
  if (!projects || projects.length === 0) {
    return <div className="text-gray-500 text-center py-8">No projects found.</div>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {projects.map((project) => (
        <div key={project.id}>
          <ProjectCard 
            project={project}
            onSelectProject={onProjectSelect}
            onUpdateProject={onUpdateProject}
            onDeleteProject={onDeleteProject}
          />
        </div>
      ))}
    </div>
  );
};

type ScriptCategory = "all" | "Video" | "Short";

const ScriptCategoryFilters = ({ activeCategory, setCategory }: { activeCategory: ScriptCategory, setCategory: (category: ScriptCategory) => void }) => {
  const categories: ScriptCategory[] = ["all", "Video", "Short"];
  return (
    <div className="flex items-center gap-2 mb-4">
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => setCategory(cat)}
          className={cn(
            "px-3 py-1 text-sm font-mono border transition-colors",
            activeCategory === cat 
              ? "bg-red-600 border-red-600 text-white" 
              : "bg-gray-800 border-gray-700 text-gray-400 hover:border-red-600"
          )}
        >
          {cat.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

const BlogCategoryFilters = ({ activeCategory, setCategory }: { activeCategory: string, setCategory: (category: string) => void }) => {
    const categories = ["all", "Street Art", "Cultura", "Deporte", "Musica", "Comida", "Viajes", "Fotografia", "Diseño"];
  return (
    <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => setCategory(cat)}
          className={cn(
            "px-3 py-1 text-sm font-mono border transition-colors flex-shrink-0",
            activeCategory === cat 
              ? "bg-blue-600 border-blue-600 text-white" 
              : "bg-gray-800 border-gray-700 text-gray-400 hover:border-blue-600"
          )}
        >
          {cat.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

export const GhostWriterView = () => {
  const [projectsData, setProjectsData] = useState<{
    scripts: ScriptProject[];
    blogs: BlogPostProject[];
    books: BookProject[];
  }>({ scripts: [], blogs: [], books: [] });

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [scriptCategory, setScriptCategory] = useState<ScriptCategory>("all");
  const [blogCategory, setBlogCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<'scripts' | 'blogs' | 'books'>('scripts');
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);

  const fetchProjects = async () => {
    try {
        const response = await fetch('/api/projects');
        if (!response.ok) throw new Error("Failed to fetch projects");
        const data = await response.json();
        setProjectsData(data);
    } catch (error) {
        console.error("Failed to fetch projects:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectSelect = (project: Project) => {
    const projectType = projectsData.scripts.some(p => p.id === project.id) ? 'scripts'
                      : projectsData.blogs.some(p => p.id === project.id) ? 'blogs'
                      : 'books';
    setActiveTab(projectType);
    setSelectedProject(project);
  };

  const handleUpdateProject = useCallback((updatedProject: Project) => {
    if (!updatedProject) {
        console.warn("handleUpdateProject called with undefined project");
        return;
    }

    setProjectsData(prevData => {
        let categoryKey: "scripts" | "blogs" | "books" | null = null;
        if (updatedProject.type === 'script' && prevData.scripts.some(p => p?.id === updatedProject.id)) categoryKey = "scripts";
        else if (updatedProject.type === 'blog' && prevData.blogs.some(p => p?.id === updatedProject.id)) categoryKey = "blogs";
        else if (updatedProject.type === 'book' && prevData.books.some(p => p?.id === updatedProject.id)) categoryKey = "books";

        if (categoryKey) {
            return {
                ...prevData,
                [categoryKey]: prevData[categoryKey]!.map(p =>
                    p.id === updatedProject.id ? updatedProject : p
                )
            };
        }
        return prevData;
    });
    
    setSelectedProject(currentSelected => 
        (currentSelected && currentSelected.id === updatedProject.id) ? updatedProject : currentSelected
    );
  }, []);

  const handleBack = () => {
    setSelectedProject(null);
    fetchProjects();
  };
  
  const allProjects = [...projectsData.scripts, ...projectsData.blogs, ...projectsData.books];

  const handleDeleteProject = async (project: Project) => {
    try {
      // Remove the project from state immediately for better UX
      setProjectsData(prevData => {
        const categoryKey = project.type === 'script' ? 'scripts' 
                        : project.type === 'blog' ? 'blogs' 
                        : 'books';
        return {
          ...prevData,
          [categoryKey]: prevData[categoryKey].filter(p => p.id !== project.id)
        };
      });

      // If this was the selected project, clear the selection
      if (selectedProject?.id === project.id) {
        setSelectedProject(null);
      }

      // Refresh the projects list to ensure sync with backend
      await fetchProjects();

    } catch (error) {
      console.error('Error handling project deletion:', error);
      // Revert the state change if there was an error
      fetchProjects();
      alert('Failed to delete project: ' + (error as Error).message);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {selectedProject ? (
        <>
          {selectedProject.type === 'book' && (
            <BookWorkspace
              project={selectedProject as BookProject}
              onBack={handleBack}
              onUpdateProject={handleUpdateProject}
              allProjects={allProjects}
            />
          )}
          {selectedProject.type === 'script' && (
            <ScriptWorkspace 
              project={selectedProject as ScriptProject} 
              onBack={handleBack} 
              onUpdateProject={handleUpdateProject}
              allProjects={allProjects}
            />
          )}
          {selectedProject.type === 'blog' && (
            <BlogWorkspace 
              project={selectedProject as BlogPostProject} 
              onBack={handleBack} 
              onUpdateProject={handleUpdateProject}
              allProjects={allProjects}
            />
          )}
        </>
      ) : (
        <div className="p-8 h-full overflow-y-auto">
            <header className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Proyectos de GHOST</h2>
              <Button onClick={() => setIsNewProjectDialogOpen(true)}>Nuevo Proyecto</Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <UpcomingTasks />
                <Deadlines />
                <AgentLogs />
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-900/80">
              <TabsTrigger value="scripts"><FileText className="w-4 h-4 mr-2" />Guiones</TabsTrigger>
              <TabsTrigger value="blogs"><Rss className="w-4 h-4 mr-2" />Blogs</TabsTrigger>
              <TabsTrigger value="books"><Book className="w-4 h-4 mr-2" />Libros</TabsTrigger>
            </TabsList>
            <TabsContent value="scripts" className="mt-6">
              <ScriptCategoryFilters activeCategory={scriptCategory} setCategory={setScriptCategory} />
              <ProjectList 
                projects={projectsData.scripts.filter(p => scriptCategory === 'all' || p.category === scriptCategory)} 
                onProjectSelect={handleProjectSelect}
                onUpdateProject={handleUpdateProject}
                onDeleteProject={handleDeleteProject}
              />
            </TabsContent>
            <TabsContent value="blogs" className="mt-6">
              <BlogCategoryFilters activeCategory={blogCategory} setCategory={setBlogCategory} />
               <ProjectList 
                projects={projectsData.blogs.filter(p => blogCategory === 'all' || p.blogCategory === blogCategory)} 
                onProjectSelect={handleProjectSelect}
                onUpdateProject={handleUpdateProject}
                onDeleteProject={handleDeleteProject}
              />
            </TabsContent>
            <TabsContent value="books" className="mt-6">
              <ProjectList 
                projects={projectsData.books} 
                onProjectSelect={handleProjectSelect} 
                onUpdateProject={handleUpdateProject}
                onDeleteProject={handleDeleteProject}
              />
            </TabsContent>
          </Tabs>

          <NewProjectDialog 
            isOpen={isNewProjectDialogOpen}
            onClose={() => setIsNewProjectDialogOpen(false)}
            onProjectCreated={() => {
              fetchProjects();
            }}
          />
        </div>
      )}
    </div>
  );
};