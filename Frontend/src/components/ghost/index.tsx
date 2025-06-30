import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Book, FileText, Rss, Share2, ListChecks, Clock, Bot } from "lucide-react";
import { mockProjects as initialMockProjects, Project, initialBlogCategories } from "@/lib/ghost-agent-data";
import { useState } from "react";
import { ProjectWorkspace } from "./Workspace";
import { BookWorkspace } from "./BookWorkspace";
import { ScriptWorkspace } from "./ScriptWorkspace";
import { BlogWorkspace } from "./BlogWorkspace";
import { SocialWorkspace } from "./SocialWorkspace";
import { cn } from "@/lib/utils";
import { ProjectCard } from "./ProjectCard";

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
    
    if (activeTab === 'scripts') {
        return <ScriptWorkspace
            project={currentProjectData}
            onBack={handleBack}
            onUpdateProject={handleUpdateProject}
            allProjects={allProjects}
        />;
    }
    if (activeTab === 'blogs') {
        return <BlogWorkspace
            project={currentProjectData}
            onBack={handleBack}
            onUpdateProject={handleUpdateProject}
            allProjects={allProjects}
        />;
    }
    if (activeTab === 'books') {
        return <BookWorkspace
            project={currentProjectData}
            onBack={handleBack}
            onUpdateProject={handleUpdateProject}
            allProjects={allProjects}
        />;
    }
    if (activeTab === 'socials') {
        return <SocialWorkspace
            project={currentProjectData}
            onBack={handleBack}
            onUpdateProject={handleUpdateProject}
            allProjects={allProjects}
        />;
    }
    
    // Fallback in case something goes wrong, though it shouldn't be reached.
    return <div>Error: Workspace not found for the selected project.</div>;
  }

  return (
    <div className="h-full w-full bg-transparent text-foreground">
      <div className="h-full w-full flex flex-col">
        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
            <FileText className="h-5 w-5 text-red-600" />
            GHOST WRITER DASHBOARD
          </h2>
        </header>

        <div className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-hidden">
          {/* Main Content Area */}
          <div className="col-span-12 lg:col-span-9 flex flex-col h-full">
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

          {/* Sidebar */}
          <aside className="col-span-12 lg:col-span-3 flex flex-col gap-6 overflow-y-auto">
            <UpcomingTasks />
            <Deadlines />
            <AgentLogs />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default GhostWriterView; 