import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Book, FileText, Rss, Share2 } from "lucide-react";
import { mockProjects as initialMockProjects, Project, initialBlogCategories } from "@/lib/ghost-agent-data";
import { useState } from "react";
import { ProjectWorkspace } from "./Workspace";
import { cn } from "@/lib/utils";
import { ProjectCard } from "./ProjectCard";

const ProjectList = ({ projects, onProjectSelect, onUpdateProject }: { 
  projects: Project[], 
  onProjectSelect: (project: Project) => void,
  onUpdateProject: (project: Project) => void
}) => {
  if (projects.length === 0) {
    return <p className="text-center text-muted-foreground mt-8">No projects in this category.</p>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {projects.map((p) => (
        <ProjectCard 
          key={p.id}
          project={p}
          onSelectProject={onProjectSelect}
          onUpdateProject={onUpdateProject}
        />
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
  const categories = ["all", ...initialBlogCategories];
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
  const [projectsData, setProjectsData] = useState(initialMockProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [scriptCategory, setScriptCategory] = useState<ScriptCategory>("all");
  const [blogCategory, setBlogCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<'scripts' | 'blogs' | 'books' | 'socials'>('scripts');

  const handleProjectSelect = (project: Project, type: 'scripts' | 'blogs' | 'books' | 'socials') => {
    setActiveTab(type);
    setSelectedProject(project);
  };

  const handleUpdateProject = (updatedProject: Project) => {
    let categoryKey: "scripts" | "blogs" | "books" | "socials" | null = null;
    if (projectsData.scripts.some(p => p.id === updatedProject.id)) categoryKey = "scripts";
    else if (projectsData.blogs.some(p => p.id === updatedProject.id)) categoryKey = "blogs";
    else if (projectsData.books.some(p => p.id === updatedProject.id)) categoryKey = "books";
    else if (projectsData.socials.some(p => p.id === updatedProject.id)) categoryKey = "socials";

    if (categoryKey) {
        setProjectsData(prevData => ({
            ...prevData,
            [categoryKey]: prevData[categoryKey]!.map(p =>
                p.id === updatedProject.id ? updatedProject : p
            )
        }));
    }
  };

  const handleBack = () => {
    setSelectedProject(null);
  };

  const filteredScripts = projectsData.scripts.filter(script => {
    if (scriptCategory === "all") return true;
    return script.category === scriptCategory;
  });

  const filteredBlogs = projectsData.blogs.filter(blog => {
    if (blogCategory === "all") return true;
    return blog.blogCategory === blogCategory;
  });

  if (selectedProject) {
    const allProjects = [...projectsData.scripts, ...projectsData.blogs, ...projectsData.books, ...projectsData.socials];
    const currentProjectData = allProjects.find(p => p.id === selectedProject.id) || selectedProject;
    
    return <ProjectWorkspace 
              project={currentProjectData} 
              projectType={activeTab} 
              onBack={handleBack}
              onUpdateProject={handleUpdateProject}
              allProjects={allProjects}
            />;
  }

  return (
    <div className="h-full w-full bg-transparent text-foreground">
      <div className="h-full w-full flex flex-col">
        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
            <FileText className="h-5 w-5 text-red-600" />
            GHOST WRITER
          </h2>
          <div className="flex items-center space-x-2">
            {/* Control buttons can go here */}
          </div>
        </header>

        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as 'scripts' | 'blogs' | 'books' | 'socials')}
            className="flex flex-col flex-1"
          >
            <TabsList className="grid w-full grid-cols-4 bg-gray-900 border border-gray-800">
              <TabsTrigger value="scripts" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">Scripts</TabsTrigger>
              <TabsTrigger value="blogs" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">Blog Posts</TabsTrigger>
              <TabsTrigger value="books" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">Books</TabsTrigger>
              <TabsTrigger value="socials" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">Social Media</TabsTrigger>
            </TabsList>

            <div className="mt-4 flex-1 overflow-y-auto">
              <TabsContent value="scripts">
                <ScriptCategoryFilters activeCategory={scriptCategory} setCategory={setScriptCategory} />
                <ProjectList projects={filteredScripts} onProjectSelect={(p) => handleProjectSelect(p, 'scripts')} onUpdateProject={handleUpdateProject} />
              </TabsContent>
              <TabsContent value="blogs">
                <BlogCategoryFilters activeCategory={blogCategory} setCategory={setBlogCategory} />
                <ProjectList projects={filteredBlogs} onProjectSelect={(p) => handleProjectSelect(p, 'blogs')} onUpdateProject={handleUpdateProject} />
              </TabsContent>
              <TabsContent value="books">
                <ProjectList projects={projectsData.books} onProjectSelect={(p) => handleProjectSelect(p, 'books')} onUpdateProject={handleUpdateProject} />
              </TabsContent>
              <TabsContent value="socials">
                <ProjectList projects={projectsData.socials} onProjectSelect={(p) => handleProjectSelect(p, 'socials')} onUpdateProject={handleUpdateProject} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default GhostWriterView; 