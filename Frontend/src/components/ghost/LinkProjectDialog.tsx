import { Project } from "@/lib/ghost-agent-data";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, X } from "lucide-react";

type LinkProjectDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  currentProject: Project;
  allProjects: Project[];
  onUpdateProject: (project: Project) => void;
};

export const LinkProjectDialog = ({ isOpen, onClose, currentProject, allProjects, onUpdateProject }: LinkProjectDialogProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(currentProject.relatedProjectIds || []);

  const handleToggle = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    // Update the current project
    onUpdateProject({ ...currentProject, relatedProjectIds: selectedIds });

    // Update the linked projects to ensure two-way binding
    const allProjectIdsToUpdate = [...selectedIds, ...currentProject.relatedProjectIds || []];
    const uniqueIds = [...new Set(allProjectIdsToUpdate)];
    
    uniqueIds.forEach(id => {
      if (id === currentProject.id) return;
      
      const projectToUpdate = allProjects.find(p => p.id === id);
      if (projectToUpdate) {
        let relatedIds = projectToUpdate.relatedProjectIds || [];
        if (selectedIds.includes(id)) { // If it's currently selected, it should link back
          if (!relatedIds.includes(currentProject.id)) {
            relatedIds.push(currentProject.id);
          }
        } else { // If it was unselected, remove the link back
          relatedIds = relatedIds.filter(relId => relId !== currentProject.id);
        }
        onUpdateProject({ ...projectToUpdate, relatedProjectIds: relatedIds });
      }
    });

    onClose();
  };
  
  if (!isOpen) return null;

  const otherProjects = allProjects.filter(p => p.id !== currentProject.id);
  const categorizedProjects = {
    scripts: otherProjects.filter(p => 'category' in p),
    blogs: otherProjects.filter(p => 'blogCategory' in p),
    books: otherProjects.filter(p => !('category' in p) && !('blogCategory' in p)),
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center font-mono">
      <div 
        className="bg-gradient-to-b from-gray-900 to-black border border-gray-700 p-6 rounded-lg shadow-lg w-full max-w-2xl flex flex-col gap-4 max-h-[80vh]"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Link className="text-red-500" />
            Link Content to "{currentProject.title}"
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
            <X />
          </Button>
        </div>
        <p className="text-sm text-gray-400">Select content to create a campaign bundle. Linked items can be analyzed together by other agents.</p>
        <ScrollArea className="flex-grow my-4 border-y border-gray-800">
          <div className="p-4">
            {Object.entries(categorizedProjects).map(([category, projects]) => (
              projects.length > 0 && (
                <div key={category} className="mb-6">
                  <h3 className="font-bold text-red-500 mb-3 capitalize">{category}</h3>
                  <div className="space-y-2">
                    {projects.map(p => (
                      <label key={p.id} className="flex items-center gap-3 p-2 bg-gray-900/50 rounded-md hover:bg-gray-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(p.id)}
                          onChange={() => handleToggle(p.id)}
                          className="accent-red-500 w-5 h-5"
                        />
                        <span className="font-semibold">{p.title}</span>
                        <span className="text-xs text-gray-500 ml-auto">ID: {p.id}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onClose} className="border-gray-700 hover:border-white hover:bg-gray-800 hover:text-white">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700 text-white">
            Save Links
          </Button>
        </div>
      </div>
    </div>
  );
}; 