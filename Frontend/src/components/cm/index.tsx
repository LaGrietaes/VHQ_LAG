"use client";

import { useState } from "react";
import { Project, mockProjects } from "@/lib/ghost-agent-data";
import { ProjectCard } from "@/components/ghost/ProjectCard";
import { SocialWorkspace } from "@/components/ghost/SocialWorkspace";
import { Share2 } from "lucide-react";

const ProjectList = ({ projects, onProjectSelect }: {
  projects: Project[],
  onProjectSelect: (project: Project) => void,
}) => {
  if (projects.length === 0) {
    return <p className="text-center text-muted-foreground mt-8">No social media projects.</p>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {projects.map((p) => (
        <ProjectCard
          key={p.id}
          project={p}
          onSelectProject={onProjectSelect}
          onUpdateProject={() => {}} // Not needed for CM view yet
        />
      ))}
    </div>
  );
};

export const CMWorkspaceView = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // For now, we'll use the mock data for social projects.
  const socialProjects = mockProjects.socials;

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
  };

  const handleBack = () => {
    setSelectedProject(null);
  };

  if (selectedProject) {
    const allProjects = socialProjects;
    return <SocialWorkspace
        project={selectedProject}
        onBack={handleBack}
        onUpdateProject={() => {}} // Not needed for CM view yet
        allProjects={allProjects}
    />;
  }

  return (
    <div className="h-full w-full bg-transparent text-foreground">
      <div className="h-full w-full flex flex-col">
        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
            <Share2 className="h-5 w-5 text-red-600" />
            COMMUNITY MANAGER DASHBOARD
          </h2>
        </header>

        <div className="flex-1 p-6 overflow-y-auto">
            <ProjectList projects={socialProjects} onProjectSelect={handleProjectSelect} />
        </div>
      </div>
    </div>
  );
}; 