"use client"

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { MessageSquare, X, Send, Search, PlusSquare, History, Paperclip, XCircle, Link2, Trash2, ChevronDown, FolderOpen, FileText, BookOpen, Square, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { agentsData } from '@/lib/agents-data'
import { cn } from '@/lib/utils'
import { Button } from "@/components/ui/button"
import { Tooltip } from "@/components/ui/tooltip"
import { 
  Message, 
  ChatSession, 
  ChatHistoryManager, 
  formatDateTime, 
  formatBytes, 
  getSessionName, 
  migrateSession,
  generateTextExport,
  generateCsvExport,
  generateConversationTitle
} from '@/lib/chat-history'


// --- Types and Data ---

const tacticalAgents = agentsData.map(agent => ({
  ...agent,
  code: agent.id.split('_')[0]
}))

type ChatNotificationProps = {
  onDrawerStateChange?: (isOpen: boolean) => void;
}

type ChatNotificationIconProps = {
  unreadAgents: [string, number][];
  agentsData: any[];
  currentUnreadAgent: number;
};

// Project context types
interface ProjectContext {
  id: string;
  title: string;
  type: 'book' | 'script' | 'blog';
  path: string;
  specificFile?: string; // Path to specific file within project
}

interface ProjectFile {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  extension?: string;
  isContentFile: boolean;
}

interface ProjectCategory {
  books: ProjectContext[];
  scripts: ProjectContext[];
  blogs: ProjectContext[];
}

function ChatNotificationIcon({ unreadAgents, agentsData, currentUnreadAgent }: ChatNotificationIconProps) {
  // --- ChatNotificationIcon visual layout ---
  // Chat bubble icon size: adjust 'w-9 h-9' below
  // Agent icon size: adjust 'w-5 h-5' below
  // Agent icon is centered inside the chat bubble using 'absolute inset-0 flex items-center justify-center'
  // Badge position and size: adjust 'absolute top-0 right-0 ... w-5 h-5' below
  // -----------------------------------------
  const showBadge = unreadAgents.length > 0;
  const [agentId, count] = showBadge ? unreadAgents[currentUnreadAgent % unreadAgents.length] : [null, null];
  const agent = showBadge ? agentsData.find((a: any) => a.id === agentId) : null;
  const tooltipText = showBadge && unreadAgents.length > 1
    ? unreadAgents.map(([agentId, count]: [string, number]) => {
        const agent = agentsData.find((a: any) => a.id === agentId);
        return `${agent?.name || agentId}: ${count}`;
      }).join('\n')
    : undefined;
  return (
    <div className="relative group">
      {/* Chat bubble icon (adjust size here)
          - Size: 'w-12 h-12'
          - Thickness: adjust 'strokeWidth' prop on MessageSquare below (e.g., strokeWidth={1.5})
      */}
      <MessageSquare className="w-12 h-12 text-white scale-x-[-1]" strokeWidth={1} />
      {showBadge && agent && (
        <span className="absolute inset-0 flex items-center justify-center pointer-events-none -translate-y-1">
          <span className="w-5 h-5 flex items-center justify-center text-primary">{agent.icon}</span>
        </span>
      )}
      {showBadge && (
        // Badge: the unread message count indicator at the top-right of the chat bubble
        <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-primary text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow">
          {count}
        </span>
      )}
      {showBadge && unreadAgents.length > 1 && (
        <span className="absolute inset-0 cursor-help" title={tooltipText} />
      )}
    </div>
  );
}

// Utility to generate a session ID
function getSessionId(agents: string[]) {
  return `${agents.join("_")}_${new Date().toISOString()}`;
}

// Context Finder Component
function ContextFinder({ onContextSelect, selectedContexts, setSelectedContexts }: { 
  onContextSelect?: (context: ProjectContext) => void;
  selectedContexts: ProjectContext[];
  setSelectedContexts: React.Dispatch<React.SetStateAction<ProjectContext[]>>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState<ProjectCategory>({ books: [], scripts: [], blogs: [] });
  const [loading, setLoading] = useState(false);
  const [selectedContext, setSelectedContext] = useState<ProjectContext | null>(null);
  const [currentProject, setCurrentProject] = useState<ProjectContext | null>(null);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [browsingFiles, setBrowsingFiles] = useState(false);
  const [currentPath, setCurrentPath] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Load projects function
  const loadProjects = async () => {
    console.log('ContextFinder: loadProjects called');
    setLoading(true);
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        console.log('ContextFinder: projects loaded:', data);
        setProjects(data);
      } else {
        console.error('Failed to load projects');
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh projects
  const refreshProjects = () => {
    loadProjects();
  };

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Load project files when browsing
  const loadProjectFiles = async (project: ProjectContext, path?: string) => {
    try {
      const targetPath = path || project.path;
      const response = await fetch(`/api/projects/files?path=${encodeURIComponent(targetPath)}`);
      if (response.ok) {
        const data = await response.json();
        setProjectFiles(data.data.files);
        setCurrentProject(project);
        setCurrentPath(targetPath);
        setBrowsingFiles(true);
      }
    } catch (error) {
      console.error('Failed to load project files:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setBrowsingFiles(false);
        setCurrentProject(null);
        setCurrentPath('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter projects based on search term
  const filteredProjects = useMemo(() => {
    if (!searchTerm.trim()) return projects;

    const searchLower = searchTerm.toLowerCase();
    const filtered: ProjectCategory = { books: [], scripts: [], blogs: [] };

    Object.entries(projects).forEach(([category, projectList]) => {
      filtered[category as keyof ProjectCategory] = projectList.filter((project: ProjectContext) =>
        project.title.toLowerCase().includes(searchLower) ||
        project.id.toLowerCase().includes(searchLower)
      );
    });

    return filtered;
  }, [projects, searchTerm]);

  // Filter project files based on search term
  const filteredFiles = useMemo(() => {
    if (!searchTerm.trim()) return projectFiles;

    const searchLower = searchTerm.toLowerCase();
    return projectFiles.filter(file => 
      file.name.toLowerCase().includes(searchLower) ||
      (file.extension && file.extension.toLowerCase().includes(searchLower))
    );
  }, [projectFiles, searchTerm]);

  const handleContextSelect = (context: ProjectContext) => {
    console.log('=== ContextFinder: handleContextSelect called ===');
    console.log('Selected context:', context);
    
    // Add to selectedContexts instead of replacing
    setSelectedContexts(prev => prev.some(c => c.specificFile === context.specificFile && c.id === context.id) ? prev : [...prev, context]);
    setIsOpen(false);
    setSearchTerm('');
    setBrowsingFiles(false);
    setCurrentProject(null);
    setCurrentPath('');
    onContextSelect?.(context);
  };

  const handleFileSelect = async (file: ProjectFile) => {
    if (file.type === 'directory') {
      // Navigate into directory
      await loadProjectFiles(currentProject!, file.path);
    } else if (file.isContentFile) {
      // Select this specific file as context
      const contextWithFile: ProjectContext = {
        ...currentProject!,
        specificFile: file.path
      };
      handleContextSelect(contextWithFile);
    }
  };

  const handleBackToProjects = () => {
    setBrowsingFiles(false);
    setCurrentProject(null);
    setProjectFiles([]);
    setCurrentPath('');
    setSearchTerm('');
  };

  const handleBackToParent = async () => {
    if (currentPath && currentProject) {
      const parentPath = currentPath.split('/').slice(0, -1).join('/');
      if (parentPath && parentPath !== currentProject.path) {
        await loadProjectFiles(currentProject, parentPath);
      } else {
        await loadProjectFiles(currentProject);
      }
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'book': return <BookOpen className="w-4 h-4" />;
      case 'script': return <FileText className="w-4 h-4" />;
      case 'blog': return <FileText className="w-4 h-4" />;
      default: return <FolderOpen className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'book': return 'Book';
      case 'script': return 'Script';
      case 'blog': return 'Blog';
      default: return type;
    }
  };

  const getFileIcon = (file: ProjectFile) => {
    if (file.type === 'directory') return <FolderOpen className="w-4 h-4" />;
    if (file.extension === 'md') return <FileText className="w-4 h-4" />;
    if (file.extension === 'pdf') return <FileText className="w-4 h-4" />;
    if (file.extension === 'doc' || file.extension === 'docx') return <FileText className="w-4 h-4" />;
    if (file.extension === 'json') return <FileText className="w-4 h-4" />;
    if (!file.extension) return <FileText className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const getDisplayName = (context: ProjectContext) => {
    if (context.specificFile) {
      const fileName = context.specificFile.split('/').pop() || context.specificFile;
      return `${context.title} - ${fileName}`;
    }
    return context.title;
  };

  const totalProjects = projects.books.length + projects.scripts.length + projects.blogs.length;
  const contentFiles = projectFiles.filter(f => f.isContentFile);
  const canGoBack = currentPath && currentPath !== currentProject?.path;

  // 1. En ContextFinder, escucha el evento 'workspace-refresh' y llama a loadProjects() cuando ocurra.
  useEffect(() => {
    const handleWorkspaceRefresh = () => {
      console.log('ContextFinder: workspace-refresh event received, loading projects...');
      loadProjects();
    };
    window.addEventListener('workspace-refresh', handleWorkspaceRefresh);
    return () => {
      window.removeEventListener('workspace-refresh', handleWorkspaceRefresh);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-black/30 border border-primary/30 hover:border-primary/50 text-white font-mono text-xs rounded transition-colors min-w-0 w-full"
        title={selectedContexts.length > 0 ? `Contexts: ${selectedContexts.length} selected` : 'Select project context'}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {selectedContexts.length > 0 ? (
            <>
              <Search className="w-3 h-3 text-primary flex-shrink-0" />
              <span className="truncate min-w-0 text-primary">{selectedContexts.length} context{selectedContexts.length > 1 ? 's' : ''} selected</span>
            </>
          ) : (
            <>
              <Search className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground truncate min-w-0">@ Add Context</span>
            </>
          )}
        </div>
        <ChevronDown className={cn("w-3 h-3 transition-transform flex-shrink-0", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-black/95 border border-primary/50 rounded shadow-lg z-50 max-h-64 overflow-hidden min-w-0">
          {/* Header */}
          <div className="p-2 border-b border-primary/30 flex items-center justify-between min-w-0">
            {browsingFiles ? (
              <>
                <div className="flex items-center gap-2 min-w-0">
                  {canGoBack && (
                    <button
                      onClick={handleBackToParent}
                      className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-mono flex-shrink-0"
                      title="Go back to parent directory"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={handleBackToProjects}
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-mono flex-shrink-0"
                  >
                    <ChevronLeft className="w-3 h-3" />
                    Projects
                  </button>
                </div>
                <span className="text-xs text-muted-foreground font-mono truncate min-w-0">
                  {currentProject?.title}
                </span>
              </>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs text-muted-foreground font-mono">Select Project Context</span>
                <button
                  onClick={refreshProjects}
                  disabled={loading}
                  className="text-xs text-primary hover:text-primary/80 font-mono disabled:opacity-50"
                  title="Refresh projects"
                >↻</button>
              </div>
            )}
          </div>

          {/* Search Input */}
          <div className="p-2 border-b border-primary/30">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <input
                type="text"
                placeholder={browsingFiles ? "Search files..." : "Search projects..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 bg-black/50 border border-primary/30 text-white placeholder:text-muted-foreground text-xs font-mono focus:border-primary focus:outline-none rounded"
                autoFocus
              />
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto overflow-x-hidden max-h-48 min-w-0">
            {loading ? (
              <div className="p-3 text-center text-muted-foreground text-xs">
                Loading...
              </div>
            ) : browsingFiles ? (
              // Project Files View
              <div className="p-1 min-w-0">
                {filteredFiles.length === 0 ? (
                  <div className="p-3 text-center text-muted-foreground text-xs">
                    No files found
                  </div>
                ) : (
                  <>
                    {/* Directories */}
                    {filteredFiles.filter(f => f.type === 'directory').map((file) => (
                      <button
                        key={file.path}
                        onClick={() => handleFileSelect(file)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-primary/10 rounded text-xs font-mono transition-colors min-w-0"
                      >
                        <FolderOpen className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        <span className="truncate flex-1 min-w-0">{file.name}/</span>
                      </button>
                    ))}
                    
                    {/* Content Files */}
                    {filteredFiles.filter(f => f.type === 'file' && f.isContentFile).map((file) => (
                      <button
                        key={file.path}
                        onClick={() => handleFileSelect(file)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-primary/10 rounded text-xs font-mono transition-colors min-w-0"
                      >
                        <FileText className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="truncate flex-1 min-w-0">{file.name}</span>
                        {file.size && (
                          <span className="text-muted-foreground text-xs flex-shrink-0">
                            {(file.size / 1024).toFixed(1)}KB
                          </span>
                        )}
                      </button>
                    ))}
                  </>
                )}
              </div>
            ) : (
              // Projects View
              <div className="p-1 min-w-0">
                {totalProjects === 0 ? (
                  <div className="p-3 text-center text-muted-foreground text-xs">
                    No projects found
                  </div>
                ) : (
                  <div className="min-w-0">
                    {Object.entries(filteredProjects).map(([category, projectList]) => 
                      projectList.length > 0 && (
                        <div key={category} className="mb-2 min-w-0">
                          <div className="px-2 py-1 text-xs font-semibold text-primary/80 uppercase tracking-wider">
                            {getTypeLabel(category)} ({projectList.length})
                          </div>
                          {projectList.map((project: ProjectContext) => (
                            <button
                              key={project.id}
                              onClick={() => loadProjectFiles(project)}
                              className="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-primary/10 rounded text-xs font-mono transition-colors min-w-0"
                            >
                              {getTypeIcon(project.type)}
                              <span className="truncate flex-1 min-w-0">{project.title}</span>
                              <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                            </button>
                          ))}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-primary/30 text-xs text-muted-foreground font-mono">
            {browsingFiles ? (
              `${contentFiles.length} content files available`
            ) : (
              `${totalProjects} total projects available`
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced Chat History Manager Implementation
class LocalChatHistoryManager implements ChatHistoryManager {
  private readonly STORAGE_KEY = 'vhq_chat_sessions_v2'
  private readonly VERSION = '2.0.0'

  saveSession(session: ChatSession): void {
    try {
      const sessions = this.loadSessions()
      const existingIndex = sessions.findIndex(s => s.id === session.id)
      
      if (existingIndex >= 0) {
        sessions[existingIndex] = { ...session, version: this.VERSION }
      } else {
        sessions.push({ ...session, version: this.VERSION })
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions))
    } catch (error) {
      console.error('Failed to save chat session:', error)
    }
  }

  loadSessions(): ChatSession[] {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY)
      if (!saved) return []
      
      const sessions = JSON.parse(saved)
      
      // Migrate old sessions to new format
      return sessions.map((session: any) => this.migrateSession(session))
    } catch (error) {
      console.error('Failed to load chat sessions:', error)
      return []
    }
  }

  deleteSession(sessionId: string): void {
    try {
      const sessions = this.loadSessions()
      const filtered = sessions.filter(s => s.id !== sessionId)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered))
    } catch (error) {
      console.error('Failed to delete chat session:', error)
    }
  }

  updateSession(sessionId: string, updates: Partial<ChatSession>): void {
    try {
      const sessions = this.loadSessions()
      const index = sessions.findIndex(s => s.id === sessionId)
      if (index >= 0) {
        sessions[index] = { ...sessions[index], ...updates, version: this.VERSION }
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions))
      }
    } catch (error) {
      console.error('Failed to update chat session:', error)
    }
  }

  async exportSessions(sessionIds?: string[]): Promise<Blob> {
    const JSZip = await import('jszip')
    const zip = new (JSZip.default || JSZip)()
    
    const sessions = this.loadSessions()
    const sessionsToExport = sessionIds 
      ? sessions.filter(s => sessionIds.includes(s.id))
      : sessions

    // Add metadata file
    const metadata = {
      exportDate: new Date().toISOString(),
      version: this.VERSION,
      sessionCount: sessionsToExport.length,
      totalMessages: sessionsToExport.reduce((sum, s) => sum + s.messages.length, 0)
    }
    zip.file('metadata.json', JSON.stringify(metadata, null, 2))

    // Add sessions
    for (const session of sessionsToExport) {
      const folderName = `session_${session.id}`
      const baseName = `${session.name.replace(/\s+/g, '_')}_${formatDateTime(session.createdAt)}`
      
      // JSON export
      zip.file(`${folderName}/${baseName}.json`, JSON.stringify(session, null, 2))
      
      // TXT export
      const txt = this.generateTextExport(session)
      zip.file(`${folderName}/${baseName}.txt`, txt)
      
      // CSV export
      const csv = this.generateCsvExport(session)
      zip.file(`${folderName}/${baseName}.csv`, csv)
    }

    return await zip.generateAsync({ type: 'blob' })
  }

  async importSessions(data: string): Promise<ChatSession[]> {
    try {
      const sessions = JSON.parse(data)
      const importedSessions: ChatSession[] = []
      
      for (const session of sessions) {
        const migratedSession = this.migrateSession(session)
        importedSessions.push(migratedSession)
      }
      
      // Merge with existing sessions
      const existingSessions = this.loadSessions()
      const mergedSessions = [...existingSessions, ...importedSessions]
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mergedSessions))
      return importedSessions
    } catch (error) {
      console.error('Failed to import chat sessions:', error)
      throw error
    }
  }

  clearAllSessions(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  getSessionStats(): { totalSessions: number; totalMessages: number; totalSize: number; lastBackup?: string } {
    const sessions = this.loadSessions()
    const totalMessages = sessions.reduce((sum, s) => sum + s.messages.length, 0)
    const totalSize = new Blob([JSON.stringify(sessions)]).size
    
    return {
      totalSessions: sessions.length,
      totalMessages,
      totalSize,
      lastBackup: localStorage.getItem('vhq_last_backup') || undefined
    }
  }

  private migrateSession(session: any): ChatSession {
    return migrateSession(session, this.VERSION)
  }

  private generateTextExport(session: ChatSession): string {
    return generateTextExport(session)
  }

  private generateCsvExport(session: ChatSession): string {
    return generateCsvExport(session)
  }
}

export function ChatNotification({ onDrawerStateChange }: ChatNotificationProps) {
  // --- Chat History Manager ---
  const chatHistoryManager = useMemo(() => new LocalChatHistoryManager(), [])
  
  // --- States ---
  const [isClient, setIsClient] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isGlitching, setIsGlitching] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Drawer-specific states
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeChatIndex, setActiveChatIndex] = useState<Record<string, number>>({})
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [agentView, setAgentView] = useState<'chat' | 'history'>('chat');
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const messageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add unreadCounts state
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // Add lastActiveAgents state
  const [lastActiveAgents, setLastActiveAgents] = useState<string[]>([]);

  // Add selected contexts state (multiple contexts support) with persistence
  const [selectedContexts, setSelectedContexts] = useState<ProjectContext[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vhq_selected_contexts');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Add message processing state
  const [isProcessing, setIsProcessing] = useState(false);

  // Add message input state
  const [messageInput, setMessageInput] = useState('');

  // Add stopped message state for editing
  const [stoppedMessage, setStoppedMessage] = useState<string>('');
  const [isEditingStopped, setIsEditingStopped] = useState(false);
  
  // Add abort controller for cancelling requests
  const [currentAbortController, setCurrentAbortController] = useState<AbortController | null>(null);
  
  // Add last sent message state to capture what was actually sent
  const [lastSentMessage, setLastSentMessage] = useState<string>('');
  
  // Add flag to track when we're resending an edited message
  const [isResendingEdited, setIsResendingEdited] = useState(false);

  // At the top level of the component, after unreadCounts:
  const unreadAgents = Object.entries(unreadCounts).filter(([_, count]) => count > 0);
  const [currentUnreadAgent, setCurrentUnreadAgent] = useState(0);
  useEffect(() => {
    if (unreadAgents.length > 1) {
      const interval = setInterval(() => setCurrentUnreadAgent(c => (c + 1) % unreadAgents.length), 2000);
      return () => clearInterval(interval);
    } else {
      setCurrentUnreadAgent(0);
    }
  }, [unreadAgents.length]);

  // --- Effects ---
   useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (notifications.length <= 1) return
    const intervalId = setInterval(() => {
      setIsGlitching(true)
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % notifications.length)
        setIsGlitching(false)
      }, 150)
    }, 3000)
    return () => clearInterval(intervalId)
  }, [notifications.length])

  // Move auto-scroll useEffect to top level
  useEffect(() => {
    // Find the current chat key and messages
    const chatKey = selectedAgents.join(',');
    const currentMsgs = sessions.find(s => s.id === chatKey)?.messages || [];
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedAgents, sessions, activeChatIndex]);

  // Add a useEffect to update activeChatIndex when sessions changes
  useEffect(() => {
    const key = selectedAgents.join(',');
    const session = sessions.find(s => s.id === key);
    if (session) {
      setActiveChatIndex(prev => ({ ...prev, [key]: session.messages.length - 1 }));
    }
  }, [sessions, selectedAgents]);

  // Update unreadCounts when a new message arrives and drawer is closed or not focused on that agent
  useEffect(() => {
    if (!isDrawerOpen) {
      // For each agent, check if the latest message is from the agent and is not user
      sessions.forEach(session => {
        const lastMsg = session.messages[session.messages.length - 1];
        if (lastMsg && !lastMsg.isUser) {
          setUnreadCounts(prev => ({ ...prev, [session.id]: (prev[session.id] || 0) + 1 }));
        }
      });
    }
  }, [sessions, isDrawerOpen]);

  // Reset unread count when chat with agent is opened
  useEffect(() => {
    if (isDrawerOpen && selectedAgents.length === 1) {
      setUnreadCounts(prev => ({ ...prev, [selectedAgents[0]]: 0 }));
    }
  }, [isDrawerOpen, selectedAgents]);

  // When opening the drawer, restore last active chat if none selected
  useEffect(() => {
    if (isDrawerOpen && selectedAgents.length === 0 && lastActiveAgents.length > 0) {
      setSelectedAgents(lastActiveAgents);
    }
  }, [isDrawerOpen, selectedAgents, lastActiveAgents]);

  // When switching to a chat, set lastActiveAgents and clear unread count
  const handleAgentChatSwitch = (agentId: string) => {
    setSelectedAgents([agentId]);
    setLastActiveAgents([agentId]);
    setActiveSessionId(null); // Clear active session when switching agents
    setAgentView('chat');
    setUnreadCounts(prev => ({ ...prev, [agentId]: 0 }));
  };

  // In useEffect that resets unread count when chat with agent is opened, also clear for all selected agents
  useEffect(() => {
    if (isDrawerOpen && selectedAgents.length > 0) {
      setUnreadCounts(prev => {
        const updated = { ...prev };
        selectedAgents.forEach(agentId => { updated[agentId] = 0; });
        return updated;
      });
    }
  }, [isDrawerOpen, selectedAgents]);

  // On mount, load sessions from localStorage
  useEffect(() => {
    const loadedSessions = chatHistoryManager.loadSessions();
    setSessions(loadedSessions);
  }, [chatHistoryManager]);

  // On update, save sessions to localStorage
  useEffect(() => {
    sessions.forEach(session => {
      chatHistoryManager.saveSession(session);
    });
  }, [sessions, chatHistoryManager]);

  // Save selected contexts to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vhq_selected_contexts', JSON.stringify(selectedContexts));
    }
  }, [selectedContexts]);

  // Note: ContextFinder already listens for workspace-refresh events
  // No need to duplicate the listener here

  // TODO: Backend sync/restore stubs
  function syncSessionsToBackend() {
    // TODO: Implement POST /api/chats
    alert('Cloud sync coming soon!');
  }
  function restoreSessionsFromBackend() {
    // TODO: Implement GET /api/chats
    alert('Cloud restore coming soon!');
  }

  // Automatic backend save function
  async function autoSaveToBackend(session: ChatSession): Promise<void> {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session })
      });
      
      if (!response.ok) {
        console.warn('Failed to auto-save to backend, but continuing with local storage');
      } else {
        console.log('Session auto-saved to backend successfully');
      }
    } catch (error) {
      console.warn('Backend auto-save failed, but continuing with local storage:', error);
    }
  }

  // Auto-save session updates to backend
  async function autoSaveSessionUpdate(sessionId: string, updates: Partial<ChatSession>): Promise<void> {
    try {
      const response = await fetch(`/api/chats/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      });
      
      if (!response.ok) {
        console.warn('Failed to auto-update session in backend');
      }
    } catch (error) {
      console.warn('Backend auto-update failed:', error);
    }
  }

  // Check storage size and trigger cleanup if needed (1GB limit)
  function checkStorageSize(): void {
    const stats = chatHistoryManager.getSessionStats();
    const oneGB = 1024 * 1024 * 1024; // 1GB in bytes
    
    if (stats.totalSize > oneGB) {
      console.warn('Storage size exceeded 1GB, consider cleanup');
      // TODO: Implement automatic cleanup strategy
      // For now, just log a warning
    }
  }

  // --- Handlers ---
  const toggleDrawer = () => {
    const newState = !isDrawerOpen;
    setIsDrawerOpen(newState);
    onDrawerStateChange?.(newState);
  }

  const addMessageToHistory = (sessionId: string, message: Message) => {
    console.log('=== addMessageToHistory called ===');
    console.log('sessionId:', sessionId);
    console.log('message:', message);
    
    setSessions((prev: ChatSession[]) => {
      const updatedSessions = [...prev];
      const sessionIndex = updatedSessions.findIndex((s: ChatSession) => s.id === sessionId);
      
      console.log('Found session at index:', sessionIndex);
      console.log('Current sessions:', updatedSessions.map(s => ({ id: s.id, name: s.name })));
      
      if (sessionIndex === -1) {
        console.log('Session not found, creating new session');
        // This shouldn't happen in normal flow, but handle it gracefully
        const newSession: ChatSession = {
          id: sessionId,
          agents: [sessionId], // Fallback to using sessionId as agent
          name: getSessionName([sessionId], agentsData),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [message],
          metadata: {
            tags: [],
            priority: 'medium',
            isArchived: false,
            messageCount: 1,
            userMessageCount: message.isUser ? 1 : 0,
            agentMessageCount: message.isUser ? 0 : 1
          },
          version: '2.0.0'
        };
        updatedSessions.push(newSession);
        
        // Auto-save new session to backend
        autoSaveToBackend(newSession);
        console.log('Created new session:', newSession.id);
      } else {
        console.log('Updating existing session');
        const currentSession = updatedSessions[sessionIndex];
        const updatedSession = {
          ...currentSession,
          updatedAt: new Date().toISOString(),
          messages: [...currentSession.messages, message],
          metadata: {
            ...currentSession.metadata,
            messageCount: currentSession.messages.length + 1,
            userMessageCount: currentSession.metadata.userMessageCount + (message.isUser ? 1 : 0),
            agentMessageCount: currentSession.metadata.agentMessageCount + (message.isUser ? 0 : 1)
          }
        };
        updatedSessions[sessionIndex] = updatedSession;
        
        // Auto-update session in backend
        autoSaveSessionUpdate(sessionId, updatedSession);
        console.log('Updated session:', updatedSession.id, 'with message count:', updatedSession.messages.length);
      }
      return updatedSessions;
    });
    
    // Check storage size after adding message
    setTimeout(() => checkStorageSize(), 100);
  };

  const handleDeleteSession = (sessionId: string) => {
    // Remove from local state
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    
    // Remove from localStorage
    chatHistoryManager.deleteSession(sessionId);
    
    // Clear active session if it was the deleted one
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
    }
    
    // TODO: Delete from backend
    // This would be a DELETE request to /api/chats/{sessionId}
    console.log('Session deleted:', sessionId);
  };

  const handleNewChat = () => {
    if (selectedAgents.length === 0) return;
    
    // Generate a unique session ID with timestamp
    const sessionId = `${selectedAgents.join('_')}_${Date.now()}`;
    
    const newSession: ChatSession = {
      id: sessionId,
      agents: selectedAgents,
      name: getSessionName(selectedAgents, agentsData),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
      metadata: {
        tags: [],
        priority: 'medium',
        isArchived: false,
        messageCount: 0,
        userMessageCount: 0,
        agentMessageCount: 0
      },
      version: '2.0.0'
    };
    
    // Add new session to existing sessions
    setSessions(prev => [...prev, newSession]);
    
    // Set this as the active session and clear any previous active session
    setActiveSessionId(sessionId);
    setActiveChatIndex(prev => ({ ...prev, [sessionId]: 0 }));
    
    // Switch to the new chat
    setAgentView('chat');
    
    // Auto-save to backend
    autoSaveToBackend(newSession);
    
    console.log('New chat created with session ID:', sessionId);
  };

  const handleAgentSelect = (agentId: string, checked: boolean) => {
    console.log('=== handleAgentSelect called ===');
    console.log('agentId:', agentId, 'checked:', checked);
    setSelectedAgents(prev => {
      console.log('Previous selectedAgents:', prev);
      if (checked) {
        // Only add agent to selection, do not switch chat
        const newSelection = [...prev, agentId];
        console.log('New selectedAgents (added):', newSelection);
        return newSelection;
      } else {
        // Only remove agent from selection, do not switch chat
        const newSelection = prev.filter(id => id !== agentId);
        console.log('New selectedAgents (removed):', newSelection);
        return newSelection;
      }
    });
    // Do not change agentView or activeChatIndex here
  };

  const handleSendMessage = () => {
    console.log('=== handleSendMessage called ===');
    console.log('messageInput:', messageInput);
    console.log('selectedAgents:', selectedAgents);
    console.log('isProcessing:', isProcessing);
    
    const content = messageInput.trim();
    if (selectedAgents.length === 0 || !content) {
      console.log('Cannot send message: no agents selected or empty content');
      console.log('selectedAgents.length:', selectedAgents.length);
      console.log('content length:', content.length);
      return;
    }

    // Clear the input
    setMessageInput('');

    // Send the message using the extracted function
    sendMessage(content);
  }

  const handleGhostAgentMessage = async (content: string, files: File[]) => {
    // Create a new abort controller for this request
    const abortController = new AbortController();
    setCurrentAbortController(abortController);
    
    console.log('=== handleGhostAgentMessage called ===');
    console.log('Content:', content);
    console.log('Selected contexts:', selectedContexts);
    console.log('Files:', files.length);
    
    try {
        // First, handle any attached files
        if (files.length > 0) {
            // TODO: Implement file handling logic
            const fileNames = files.map(f => f.name).join(', ');
            const response: Message = {
                id: `${Date.now()}-ghost`,
                agentId: 'GHOST_AGENT',
                content: `📎 Analyzing files: ${fileNames}...`,
                timestamp: new Date(),
                isUser: false
            }
            // Find the current session for the selected agents
            const sessionsForAgents = sessions.filter(s => 
              s.agents.length === selectedAgents.length && 
              s.agents.every(agent => selectedAgents.includes(agent))
            );
            
            let currentSession: ChatSession | null = null;
            if (activeSessionId) {
              currentSession = sessionsForAgents.find(s => s.id === activeSessionId) || null;
            }
            if (!currentSession && sessionsForAgents.length > 0) {
              currentSession = sessionsForAgents[sessionsForAgents.length - 1];
            }
            
            if (currentSession) {
              addMessageToHistory(currentSession.id, response);
            }
        }

        // Send the message to the ghost agent API
        const requestBody = {
            message: content,
            files: files.map(f => ({ name: f.name, type: f.type })),
            contexts: selectedContexts.length > 0 ? selectedContexts : null
        };
        
        console.log('Sending request to ghost agent:', requestBody);
        
        const response = await fetch('/api/ai/ghost-agent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
            signal: abortController.signal
        });

        if (!response.ok) {
            throw new Error('Failed to get response from Ghost Agent');
        }

        const data = await response.json();
        console.log('Ghost agent response received:', data);
        
        // Handle file operations if any
        let responseContent = data.response;
        if (data.fileOperations && data.fileOperations.length > 0) {
          const fileOperationMessages = data.fileOperations.map((op: any) => {
            if (op.success) {
              let message = `✅ ${op.message}`;
              
              // Add more details for autonomous operations
              if (op.createdContent) {
                const preview = op.createdContent.length > 100 
                  ? op.createdContent.substring(0, 100) + '...' 
                  : op.createdContent;
                message += `\n📄 **Vista previa:** ${preview}`;
              }
              
              if (op.filePath) {
                const relativePath = op.filePath.split('GHOST_Proyectos/').pop() || op.filePath;
                message += `\n📂 **Ubicación:** ${relativePath}`;
              }
              
              return message;
            } else {
              return `❌ ${op.message}`;
            }
          }).join('\n\n');
          
          responseContent += `\n\n📁 **Operaciones autónomas del workspace:**\n${fileOperationMessages}`;
          
          // Add workspace structure info if available
          if (data.workspaceStructure) {
            responseContent += `\n\n🏗️ **Estructura del workspace:**\nProyectos disponibles: ${data.workspaceStructure.availableProjects.join(', ')}`;
          }
        }
        
        // Add the ghost agent's response to the chat
        const ghostResponse: Message = {
            id: `${Date.now()}-ghost`,
            agentId: 'GHOST_AGENT',
            content: responseContent,
            timestamp: new Date(),
            isUser: false
        }
        
        // Find the current session for the selected agents
        const sessionsForAgents = sessions.filter(s => 
          s.agents.length === selectedAgents.length && 
          s.agents.every(agent => selectedAgents.includes(agent))
        );
        
        let currentSession: ChatSession | null = null;
        if (activeSessionId) {
          currentSession = sessionsForAgents.find(s => s.id === activeSessionId) || null;
        }
        if (!currentSession && sessionsForAgents.length > 0) {
          currentSession = sessionsForAgents[sessionsForAgents.length - 1];
        }
        
        if (currentSession) {
          addMessageToHistory(currentSession.id, ghostResponse);
        }

    } catch (error) {
        // Check if the error is due to abort
        if (error instanceof Error && error.name === 'AbortError') {
            console.log('Ghost Agent request was aborted');
            // Don't add error message for aborted requests
            return;
        }
        
        console.error('Error communicating with Ghost Agent:', error);
        
        // Add error message to chat
        const errorResponse: Message = {
            id: `${Date.now()}-ghost-error`,
            agentId: 'GHOST_AGENT',
            content: "I apologize, but I encountered an error processing your request. Please try again.",
            timestamp: new Date(),
            isUser: false
        }
        
        // Find the current session for the selected agents
        const sessionsForAgents = sessions.filter(s => 
          s.agents.length === selectedAgents.length && 
          s.agents.every(agent => selectedAgents.includes(agent))
        );
        
        let currentSession: ChatSession | null = null;
        if (activeSessionId) {
          currentSession = sessionsForAgents.find(s => s.id === activeSessionId) || null;
        }
        if (!currentSession && sessionsForAgents.length > 0) {
          currentSession = sessionsForAgents[sessionsForAgents.length - 1];
        }
        
        if (currentSession) {
          addMessageToHistory(currentSession.id, errorResponse);
        }
    } finally {
        setIsProcessing(false);
        setCurrentAbortController(null);
    }
  }

  const handleCEOAgentMessage = async (content: string) => {
    // Create a new abort controller for this request
    const abortController = new AbortController();
    setCurrentAbortController(abortController);
    
    console.log('=== handleCEOAgentMessage called ===');
    console.log('Content:', content);
    console.log('Selected contexts:', selectedContexts);
    
    try {
      const requestBody = { message: content, contexts: selectedContexts.length > 0 ? selectedContexts : null };
      console.log('Sending request to CEO agent:', requestBody);
      
      const response = await fetch('/api/ai/ceo-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: abortController.signal
      });
      if (!response.ok) {
        throw new Error('Failed to get response from CEO Agent');
      }
      const data = await response.json();
      console.log('CEO agent response received:', data);
      
      const ceoResponse: Message = {
        id: `${Date.now()}-ceo`,
        agentId: 'CEO_AGENT',
        content: data.response,
        timestamp: new Date(),
        isUser: false
      }
      
      // Find the current session for the selected agents
      const sessionsForAgents = sessions.filter(s => 
        s.agents.length === selectedAgents.length && 
        s.agents.every(agent => selectedAgents.includes(agent))
      );
      
      let currentSession: ChatSession | null = null;
      if (activeSessionId) {
        currentSession = sessionsForAgents.find(s => s.id === activeSessionId) || null;
      }
      if (!currentSession && sessionsForAgents.length > 0) {
        currentSession = sessionsForAgents[sessionsForAgents.length - 1];
      }
      
      if (currentSession) {
        addMessageToHistory(currentSession.id, ceoResponse);
      }
    } catch (error) {
      // Check if the error is due to abort
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('CEO Agent request was aborted');
        // Don't add error message for aborted requests
        return;
      }
      
      console.error('Error communicating with CEO Agent:', error);
      const errorResponse: Message = {
        id: `${Date.now()}-ceo-error`,
        agentId: 'CEO_AGENT',
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
        isUser: false
      }
      
      // Find the current session for the selected agents
      const sessionsForAgents = sessions.filter(s => 
        s.agents.length === selectedAgents.length && 
        s.agents.every(agent => selectedAgents.includes(agent))
      );
      
      let currentSession: ChatSession | null = null;
      if (activeSessionId) {
        currentSession = sessionsForAgents.find(s => s.id === activeSessionId) || null;
      }
      if (!currentSession && sessionsForAgents.length > 0) {
        currentSession = sessionsForAgents[sessionsForAgents.length - 1];
      }
      
      if (currentSession) {
        addMessageToHistory(currentSession.id, errorResponse);
      }
    } finally {
      setIsProcessing(false);
      setCurrentAbortController(null);
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setStagedFiles(prev => [...prev, ...Array.from(event.target.files!)]);
    }
  };

  const handleDragEvents = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    handleDragEvents(e);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDraggingOver(true);
    }
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    handleDragEvents(e);
    setIsDraggingOver(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    handleDragEvents(e);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setStagedFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
      setIsDraggingOver(false);
      e.dataTransfer.clearData();
    }
  };

  const removeStagedFile = (fileToRemove: File) => {
    setStagedFiles(prev => prev.filter(file => file !== fileToRemove));
  };

  const handleContextSelect = (context: ProjectContext) => {
    console.log('=== handleContextSelect called ===');
    console.log('Selected context:', context);
    console.log('Context details:', {
      id: context.id,
      title: context.title,
      type: context.type,
      path: context.path
    });
    
    setSelectedContexts(prev => prev.some(c => c.specificFile === context.specificFile && c.id === context.id) ? prev : [...prev, context]);
  };

  const handleStopMessage = () => {
    console.log('=== Stopping message generation ===');
    
    // Abort the current request if it exists
    if (currentAbortController) {
      console.log('Aborting current request...');
      currentAbortController.abort();
      setCurrentAbortController(null);
    }
    
    // Use the last sent message for editing (this is what was actually sent to the agent)
    const messageToEdit = lastSentMessage.trim();
    console.log('Capturing last sent message for editing:', messageToEdit);
    
    if (!messageToEdit) {
      console.log('No message to edit - last sent message is empty');
      setIsProcessing(false);
      return;
    }
    
    setStoppedMessage(messageToEdit);
    setIsEditingStopped(true);
    setIsProcessing(false);
    
    // Clear the current input since we're now editing the stopped message
    setMessageInput('');
    
    console.log('Message stopped, ready for editing:', messageToEdit);
    
    // Add a "stopped" indicator message to the chat
    const stoppedIndicator: Message = {
      id: `${Date.now()}-stopped`,
      agentId: selectedAgents[0] || 'SYSTEM',
      content: "🛑 Message generation stopped. You can edit and resend your message.",
      timestamp: new Date(),
      isUser: false
    };
    
    // Find the current session and add the stopped indicator
    const sessionsForAgents = sessions.filter(s => 
      s.agents.length === selectedAgents.length && 
      s.agents.every(agent => selectedAgents.includes(agent))
    );
    
    let currentSession: ChatSession | null = null;
    if (activeSessionId) {
      currentSession = sessionsForAgents.find(s => s.id === activeSessionId) || null;
    }
    if (!currentSession && sessionsForAgents.length > 0) {
      currentSession = sessionsForAgents[sessionsForAgents.length - 1];
    }
    
    if (currentSession) {
      addMessageToHistory(currentSession.id, stoppedIndicator);
    }
  };

  const handleResendStoppedMessage = () => {
    console.log('=== Resending stopped message ===');
    const content = stoppedMessage.trim();
    if (!content) {
      console.log('Cannot resend: empty message');
      return;
    }

    // Find the current session
    const sessionsForAgents = sessions.filter(s => 
      s.agents.length === selectedAgents.length && 
      s.agents.every(agent => selectedAgents.includes(agent))
    );
    
    let currentSession: ChatSession | null = null;
    if (activeSessionId) {
      currentSession = sessionsForAgents.find(s => s.id === activeSessionId) || null;
    }
    if (!currentSession && sessionsForAgents.length > 0) {
      currentSession = sessionsForAgents[sessionsForAgents.length - 1];
    }
    
    if (currentSession) {
      // Find the last user message and replace it with the edited version
      const updatedMessages = [...currentSession.messages];
      const lastUserMessageIndex = updatedMessages.findLastIndex(msg => msg.isUser);
      
      if (lastUserMessageIndex !== -1) {
        // Replace the last user message with the edited version
        updatedMessages[lastUserMessageIndex] = {
          ...updatedMessages[lastUserMessageIndex],
          content: content,
          timestamp: new Date()
        };
        
        // Remove the stopped indicator message
        const messagesWithoutStopped = updatedMessages.filter(msg => !msg.content.includes('🛑 Message generation stopped'));
        
        const updatedSession = { 
          ...currentSession, 
          messages: messagesWithoutStopped,
          updatedAt: new Date().toISOString()
        };
        
        // Update the session immediately
        setSessions(prev => prev.map(s => s.id === currentSession.id ? updatedSession : s));
        chatHistoryManager.saveSession(updatedSession);
        
        console.log('Replaced last user message with edited version:', content);
        console.log('Removed stopped indicator message from chat');
      }
    }

    // Clear editing state
    setIsEditingStopped(false);
    setStoppedMessage('');
    setMessageInput('');

    // Send the edited message to the agent directly (don't call sendMessage to avoid duplication)
    console.log('Sending edited message directly to agent:', content);
    console.log('Selected contexts:', selectedContexts);
    
    // Set processing state for AI agents
    if (selectedAgents.includes('GHOST_AGENT') || selectedAgents.includes('CEO_AGENT')) {
      setIsProcessing(true);
    }

    // Handle ghost agent specific functionality
    if (selectedAgents.includes('GHOST_AGENT')) {
        handleGhostAgentMessage(content, stagedFiles);
    } else if (selectedAgents.includes('CEO_AGENT')) {
        handleCEOAgentMessage(content);
    } else {
        // Default response for other agents
        setTimeout(() => {
            const agentResponse: Message = {
                id: `${Date.now()}-agent`,
                agentId: selectedAgents[0] || 'SYSTEM',
                content: `[GROUP] Signal received. Stand by.`,
                timestamp: new Date(),
                isUser: false
            }
            if (currentSession) {
              addMessageToHistory(currentSession.id, agentResponse);
            }
            // Clear processing state for non-AI agents
            setIsProcessing(false);
        }, 1000);
    }
  };

  const handleCancelEdit = () => {
    console.log('=== Canceling edit ===');
    setIsEditingStopped(false);
    setStoppedMessage('');
    setMessageInput('');
    
    // Remove the stopped indicator message from the chat
    const sessionsForAgents = sessions.filter(s => 
      s.agents.length === selectedAgents.length && 
      s.agents.every(agent => selectedAgents.includes(agent))
    );
    
    let currentSession: ChatSession | null = null;
    if (activeSessionId) {
      currentSession = sessionsForAgents.find(s => s.id === activeSessionId) || null;
    }
    if (!currentSession && sessionsForAgents.length > 0) {
      currentSession = sessionsForAgents[sessionsForAgents.length - 1];
    }
    
    if (currentSession) {
      // Remove the stopped indicator message
      const updatedMessages = currentSession.messages.filter(msg => !msg.content.includes('🛑 Message generation stopped'));
      const updatedSession = { ...currentSession, messages: updatedMessages };
      
      setSessions(prev => prev.map(s => s.id === currentSession.id ? updatedSession : s));
      chatHistoryManager.saveSession(updatedSession);
    }
  };

  // Extract the core message sending logic
  const sendMessage = (content: string) => {
    console.log('=== sendMessage called ===');
    console.log('content:', content);
    console.log('selectedAgents:', selectedAgents);
    console.log('isProcessing:', isProcessing);
    
    if (selectedAgents.length === 0) {
      console.log('Cannot send message: no agents selected');
      return;
    }

    // Store the last sent message for potential editing
    setLastSentMessage(content);
    console.log('Stored last sent message:', content);

    console.log('Sending message:', content, 'to agents:', selectedAgents);

    // Find the current session for the selected agents
    const sessionsForAgents = sessions.filter(s => 
      s.agents.length === selectedAgents.length && 
      s.agents.every(agent => selectedAgents.includes(agent))
    );
    
    // Get the current session - either the active one or the most recent
    let currentSession: ChatSession | null = null;
    if (activeSessionId) {
      currentSession = sessionsForAgents.find(s => s.id === activeSessionId) || null;
    }
    if (!currentSession && sessionsForAgents.length > 0) {
      currentSession = sessionsForAgents[sessionsForAgents.length - 1];
    }

    // If no session exists, create a new one
    if (!currentSession) {
      console.log('Creating new session for agents:', selectedAgents);
      const sessionId = getSessionId(selectedAgents);
      const newSession: ChatSession = {
        id: sessionId,
        agents: selectedAgents,
        name: getSessionName(selectedAgents, agentsData),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
        metadata: {
          tags: [],
          priority: 'medium',
          isArchived: false,
          messageCount: 0,
          userMessageCount: 0,
          agentMessageCount: 0
        },
        version: '2.0.0'
      };
      
      // Add the new session to the sessions array
      setSessions(prev => [...prev, newSession]);
      setActiveSessionId(sessionId);
      currentSession = newSession;
      
      // Save the new session immediately
      chatHistoryManager.saveSession(newSession);
    }

    // Only add the message to history if we're not resending an edited message
    // (since we already updated the message in the session)
    if (!isResendingEdited) {
      const newMessage: Message = {
        id: `${Date.now()}`,
        agentId: currentSession.id,
        content: content,
        timestamp: new Date(),
        isUser: true
      }
      console.log('Adding message to history:', newMessage);
      addMessageToHistory(currentSession.id, newMessage);
    } else {
      console.log('Skipping message addition - resending edited message');
      setIsResendingEdited(false); // Reset the flag
    }

    // Set processing state for AI agents
    if (selectedAgents.includes('GHOST_AGENT') || selectedAgents.includes('CEO_AGENT')) {
      setIsProcessing(true);
    }

    // Handle ghost agent specific functionality
    if (selectedAgents.includes('GHOST_AGENT')) {
        handleGhostAgentMessage(content, stagedFiles);
    } else if (selectedAgents.includes('CEO_AGENT')) {
        handleCEOAgentMessage(content);
    } else {
        // Default response for other agents
        setTimeout(() => {
            const agentResponse: Message = {
                id: `${Date.now()}-agent`,
                agentId: currentSession.id,
                content: `[GROUP] Signal received. Stand by.`,
                timestamp: new Date(),
                isUser: false
            }
            addMessageToHistory(currentSession.id, agentResponse);
            // Clear processing state for non-AI agents
            setIsProcessing(false);
        }, 1200)
    }

    setStagedFiles([]); // Clear files after sending
  };

  const filteredAgents = useMemo(() => {
    const query = searchQuery.toLowerCase()
    if (!query) return tacticalAgents
    return tacticalAgents.filter(agent =>
      agent.name.toLowerCase().includes(query) ||
      agent.code.includes(query)
    )
  }, [searchQuery])

  // --- Render Methods ---

  const renderAgentRoster = () => {
    const stats = chatHistoryManager.getSessionStats()

    return (
      <>
        <div className="flex-1 overflow-y-auto min-w-0">
          <div className="p-1 flex flex-col h-full justify-around min-w-0">
            {filteredAgents.map(agent => (
              <div key={agent.id} className="w-full flex items-center gap-2 px-2 py-1 text-left hover:bg-white/5 rounded-sm transition-colors duration-150 min-w-0">
                <div
                  className="w-7 h-7 flex items-center justify-center text-primary cursor-pointer flex-shrink-0"
                  onClick={() => handleAgentChatSwitch(agent.id)}
                >
                  {agent.icon}
                </div>
                <div
                  className="flex-1 cursor-pointer min-w-0"
                  onClick={() => handleAgentChatSwitch(agent.id)}
                >
                  <p className="font-mono text-sm text-white truncate min-w-0" title={agent.name}>
                    {agent.name}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={selectedAgents.includes(agent.id)}
                  onChange={e => handleAgentSelect(agent.id, e.target.checked)}
                  className="accent-primary ml-2 flex-shrink-0"
                  onClick={e => e.stopPropagation()}
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Session Stats */}
        <div className="p-3 border-t border-primary/50 bg-black/20 min-w-0">
          <div className="space-y-2 min-w-0">
            <div className="flex justify-between text-xs font-mono min-w-0">
              <span className="text-muted-foreground truncate">Sessions:</span>
              <span className="text-white flex-shrink-0 ml-2">{stats.totalSessions}</span>
            </div>
            <div className="flex justify-between text-xs font-mono min-w-0">
              <span className="text-muted-foreground truncate">Messages:</span>
              <span className="text-white flex-shrink-0 ml-2">{stats.totalMessages}</span>
            </div>
            <div className="flex justify-between text-xs font-mono min-w-0">
              <span className="text-muted-foreground truncate">Size:</span>
              <span className="text-white flex-shrink-0 ml-2">{formatBytes(stats.totalSize)}</span>
            </div>
            {stats.lastBackup && (
              <div className="flex justify-between text-xs font-mono min-w-0">
                <span className="text-muted-foreground truncate">Last Backup:</span>
                <span className="text-white flex-shrink-0 ml-2">{new Date(stats.lastBackup).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex gap-1 mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
                    chatHistoryManager.clearAllSessions()
                    setSessions([])
                  }
                }}
                className="text-xs h-6 px-2 text-red-500 hover:bg-red-500/10"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  const renderChatView = () => {
    const chatTitle = selectedAgents.map(id => tacticalAgents.find(a => a.id === id)?.code || '').join(' // ');
    
    // Find sessions for the selected agents
    const sessionsForAgents = sessions.filter(s => 
      s.agents.length === selectedAgents.length && 
      s.agents.every(agent => selectedAgents.includes(agent))
    );
    
    // Get the current session - either the active one or the most recent
    let currentSession = null;
    if (activeSessionId) {
      currentSession = sessionsForAgents.find(s => s.id === activeSessionId) || null;
    }
    if (!currentSession && sessionsForAgents.length > 0) {
      currentSession = sessionsForAgents[sessionsForAgents.length - 1];
    }
    
    const currentMessages = currentSession?.messages || [];

    if (agentView === 'history') {
      const filteredSessions = sessionsForAgents;
      return (
        <div className="flex-1 flex flex-col">
          <div className="p-3 border-b border-primary/50 flex items-center justify-between">
            <button
              onClick={() => {
                setActiveSessionId(null); // Clear active session to show most recent
                setAgentView('chat');
              }}
              className="font-mono text-xs text-muted-foreground hover:text-foreground p-1 -ml-1"
            >
              &lt; BACK TO CHAT
            </button>
            <h3 className="font-mono text-sm text-white">History: {chatTitle}</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 min-w-0">
            {filteredSessions.map((session, index) => {
              const conversationTitle = generateConversationTitle(session.messages, 40)
              const timestamp = session.messages.length > 0 
                ? new Date(session.messages[0].timestamp).toLocaleString()
                : "Empty Chat"
              
              return (
                <div
                  key={session.id}
                  className="w-full p-2 hover:bg-white/5 rounded-sm transition-colors flex items-start gap-2 group min-w-0"
                >
                  <button
                    onClick={() => {
                      // Set this session as the active one
                      setActiveSessionId(session.id);
                      setAgentView('chat');
                    }}
                    className="flex-1 flex items-start gap-2 text-left min-w-0"
                  >
                    <MessageSquare className="w-4 h-4 text-primary/80 shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs text-white/80 truncate">
                        {timestamp}
                      </p>
                      <p className="font-mono text-xs text-white/50 truncate min-w-0" title={conversationTitle}>
                        {conversationTitle}
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 flex-shrink-0"
                    title="Delete chat"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )
            }).reverse()}
          </div>
        </div>
      )
    }

    return (
      <div 
        className="flex-1 flex flex-col relative min-h-0"
        onDrop={handleDrop}
        onDragOver={handleDragEvents}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        {isDraggingOver && (
          <div className="absolute inset-0 bg-primary/20 border-2 border-dashed border-primary z-10 flex items-center justify-center">
            <p className="font-mono text-lg text-primary font-bold">Drop files to attach</p>
          </div>
        )}
        {/* Chat Header */}
        <div className="p-3 border-b border-primary/50 flex flex-col gap-1 min-w-0">
          {/* Row 1: Agent name and action icons */}
          <div className="flex items-center justify-between gap-2 w-full min-w-0">
            <span className="font-mono text-sm text-white truncate min-w-0">{chatTitle}</span>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNewChat}
                className="text-primary hover:bg-primary/10 h-8 w-8"
                title="New Chat"
              >
                <PlusSquare className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAgentView('history')}
                className="text-primary h-8 w-8"
                title="Chat History"
              >
                <History className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {/* Row 2: ContextFinder full width */}
          <div className="w-full mt-1 min-w-0">
            <ContextFinder 
              onContextSelect={handleContextSelect} 
              selectedContexts={selectedContexts}
              setSelectedContexts={setSelectedContexts}
            />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-3 min-w-0">
          {currentMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.isUser ? "items-end" : "items-start"} min-w-0`}
            >
              <div
                className={`
                  max-w-[85%] px-3 py-1.5 break-words min-w-0
                  ${msg.isUser ? "bg-primary text-primary-foreground" : "bg-white/10 border border-primary/20"}
                `}
              >
                <p className="text-sm font-mono whitespace-pre-wrap text-white break-words overflow-wrap-anywhere min-w-0">{msg.content}</p>
              </div>
               <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Message Input & Staged Files */}
        <div className="p-3 border-t border-primary/50 mt-auto min-w-0">
          {/* Staged Files */}
          {stagedFiles.length > 0 && (
            <div className="mb-2 p-2 border border-primary/30 bg-black/30 space-y-2 max-h-28 overflow-y-auto min-w-0">
              {stagedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between text-xs font-mono text-muted-foreground min-w-0">
                  <span className="truncate min-w-0" title={file.name}>{file.name}</span>
                  <button onClick={() => removeStagedFile(file)} className="text-red-500 hover:text-red-400 ml-2 flex-shrink-0">
                    <XCircle size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="relative min-w-0">
            {isEditingStopped ? (
              // Editing stopped message interface
              <div className="relative min-w-0">
                <input
                  value={stoppedMessage}
                  onChange={(e) => setStoppedMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleResendStoppedMessage();
                    } else if (e.key === 'Escape') {
                      handleCancelEdit();
                    }
                  }}
                  placeholder="Edit your stopped message..."
                  className="w-full pr-24 pl-3 py-2 bg-black/50 text-white placeholder:text-white/40 border border-green-500/50 focus:border-green-500 focus:outline-none font-mono text-sm min-w-0"
                  autoFocus
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Button
                    onClick={handleResendStoppedMessage}
                    disabled={!stoppedMessage.trim()}
                    size="icon" 
                    className="bg-green-500 hover:bg-green-600 text-white flex items-center justify-center w-8 h-8 disabled:opacity-50"
                    title="Resend message"
                  >
                    <Send size={16} />
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    size="icon" 
                    className="bg-gray-500 hover:bg-gray-600 text-white flex items-center justify-center w-8 h-8"
                    title="Cancel edit"
                  >
                    <X size={16} />
                  </Button>
                </div>
              </div>
            ) : (
              // Normal message input interface
              <>
                <div className="flex flex-wrap gap-2 mb-2 min-w-0">
                  {selectedContexts.map((ctx, idx) => (
                    <span key={ctx.specificFile || ctx.id} className="flex items-center bg-primary/10 text-primary px-2 py-1 rounded text-xs font-mono max-w-full min-w-0">
                      <span className="truncate min-w-0" title={`${ctx.title}${ctx.specificFile ? ` - ${ctx.specificFile.split('/').pop()}` : ''}`}>
                        {ctx.title}{ctx.specificFile ? ` - ${ctx.specificFile.split('/').pop()}` : ''}
                      </span>
                      <button
                        className="ml-1 text-red-500 hover:text-red-700 flex-shrink-0"
                        onClick={() => setSelectedContexts(selectedContexts.filter((_, i) => i !== idx))}
                        title="Eliminar contexto"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {selectedContexts.length > 0 && (
                    <button
                      className="ml-2 text-xs text-muted-foreground underline flex-shrink-0"
                      onClick={() => setSelectedContexts([])}
                      title="Limpiar todos los contextos"
                    >Limpiar</button>
                  )}
                </div>
                
                {/* Quick Action Buttons for Ghost Agent */}
                {selectedAgents.includes('ghost') && (
                  <div className="flex flex-wrap gap-2 mb-2 min-w-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const tipCommand = "Crea un nuevo tip para el libro '101 Tips para Hablar con la IA' siguiendo el formato del archivo 01-BePolite. El tip debe ser práctico, útil y bien estructurado.";
                        setMessageInput(tipCommand);
                        messageInputRef.current?.focus();
                      }}
                      className="text-xs h-7 px-2 bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20 hover:border-green-500/50"
                      title="Crear nuevo tip para el libro"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Nuevo Tip
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const contentCommand = "Genera contenido para el libro '101 Tips para Hablar con la IA' basándote en el contexto seleccionado. Crea secciones bien estructuradas y detalladas.";
                        setMessageInput(contentCommand);
                        messageInputRef.current?.focus();
                      }}
                      className="text-xs h-7 px-2 bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50"
                      title="Generar contenido para el libro"
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      Generar Contenido
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const chapterCommand = "Crea un nuevo capítulo para el libro '101 Tips para Hablar con la IA' con un tema específico y bien estructurado. Incluye introducción, desarrollo y conclusiones.";
                        setMessageInput(chapterCommand);
                        messageInputRef.current?.focus();
                      }}
                      className="text-xs h-7 px-2 bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/50"
                      title="Crear nuevo capítulo"
                    >
                      <BookOpen className="w-3 h-3 mr-1" />
                      Nuevo Capítulo
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const organizeCommand = "Organiza y estructura el workspace del libro '101 Tips para Hablar con la IA'. Crea carpetas apropiadas y mueve archivos a sus ubicaciones correctas.";
                        setMessageInput(organizeCommand);
                        messageInputRef.current?.focus();
                      }}
                      className="text-xs h-7 px-2 bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20 hover:border-orange-500/50"
                      title="Organizar workspace"
                    >
                      <FolderOpen className="w-3 h-3 mr-1" />
                      Organizar
                    </Button>
                  </div>
                )}
                <input
                  ref={messageInputRef}
                  value={messageInput}
                  onChange={(e) => {
                    console.log('Input changed:', e.target.value);
                    setMessageInput(e.target.value);
                  }}
                  placeholder={isProcessing ? "Generating response..." : `Message ${chatTitle}...`}
                  onKeyDown={(e) => {
                    console.log('Key pressed:', e.key, 'isProcessing:', isProcessing, 'shiftKey:', e.shiftKey);
                    if (e.key === 'Enter' && !isProcessing && !e.shiftKey) {
                      console.log('Enter key detected, calling handleSendMessage');
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isProcessing}
                  className="w-full pr-20 pl-3 py-2 bg-black/50 text-white placeholder:text-white/40 border border-primary/50 focus:border-primary focus:outline-none font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-0 overflow-hidden"
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="ghost" size="icon" className="h-8 w-8 text-primary flex-shrink-0" title="Attach file"
                  >
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  {isProcessing ? (
                    <Button 
                      onClick={handleStopMessage} 
                      size="icon" 
                      className="bg-red-500 hover:bg-red-600 text-white flex items-center justify-center w-8 h-8 flex-shrink-0"
                      title="Stop generation"
                    >
                      <Square size={16} />
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => {
                        console.log('=== Send button clicked ===');
                        console.log('Button click detected');
                        handleSendMessage();
                      }} 
                      size="icon" 
                      className="bg-primary hover:bg-primary/90 text-black flex items-center justify-center w-8 h-8 flex-shrink-0"
                      title="Send message"
                    >
                      <Send size={16} />
                    </Button>
                  )}
                  <input
                      type="file" multiple ref={fileInputRef} onChange={handleFileSelect} className="hidden"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }
  
  const drawerComponent = isDrawerOpen && isClient ? createPortal(
    <div
      className="fixed top-0 right-0 h-full w-[500px] max-w-full bg-[#0A0A0A] border-l-2 border-primary/50 shadow-2xl flex flex-col z-50 font-mono overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Drawer Header */}
      <div className="p-4 border-b border-primary/50 flex items-center justify-between gap-4 min-w-0">
        <h2 className="text-lg font-bold text-white tracking-widest flex-shrink-0">COMMS_TERMINAL</h2>
        <div className="relative flex-grow min-w-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-black/50 text-primary placeholder:text-muted-foreground border border-primary/50 focus:border-primary focus:outline-none font-mono text-sm min-w-0"
          />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button onClick={toggleDrawer} variant="ghost" size="icon" className="text-primary/60 hover:text-primary">
            <X className="w-6 h-6" />
          </Button>
        </div>
      </div>
      {/* Drawer Content */}
      <div className="flex-1 flex overflow-hidden min-h-0 min-w-0">
        <div className="w-44 border-r border-primary/50 flex flex-col flex-shrink-0">
          {renderAgentRoster()}
        </div>
        <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
          {selectedAgents.length > 0 ? renderChatView() : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-primary/50">Select an agent to begin communication.</p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      {!isDrawerOpen && (
          <button
            onClick={toggleDrawer}
            className="fixed bottom-6 right-6 z-50 w-12 h-12 flex items-center justify-center"
            aria-label="Toggle chat"
          >
            <ChatNotificationIcon unreadAgents={unreadAgents} agentsData={agentsData} currentUnreadAgent={currentUnreadAgent} />
        </button>
      )}

      {drawerComponent}
    </>
  )
} 