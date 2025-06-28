"use client"

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { MessageSquare, X, Send, Search, PlusSquare, History, Paperclip, XCircle, Link2 } from 'lucide-react'
import { agentsData } from '@/lib/agents-data'
import { cn } from '@/lib/utils'
import { Button } from "@/components/ui/button"


// --- Types and Data ---
interface Message {
  id: string
  agentId: string
  content: string
  timestamp: Date
  isUser: boolean
}

const tacticalAgents = agentsData.map(agent => ({
  ...agent,
  code: agent.id.split('_')[0].padStart(2, '0')
})).sort((a, b) => a.code.localeCompare(b.code))

const MOCK_NOTIFICATIONS = [
  { agentId: 'SEO_AGENT' },
  { agentId: 'CM_AGENT' },
  { agentId: 'CLIP_AGENT' },
  { agentId: 'PSICO_AGENT' },
]

type ChatNotificationProps = {
  onDrawerStateChange?: (isOpen: boolean) => void;
}

export function ChatNotification({ onDrawerStateChange }: ChatNotificationProps) {
  // --- States ---
  const [isClient, setIsClient] = useState(false)
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isGlitching, setIsGlitching] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Drawer-specific states
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [chatHistory, setChatHistory] = useState<Record<string, Message[][]>>({})
  const [activeChatIndex, setActiveChatIndex] = useState<Record<string, number>>({})
  const [agentView, setAgentView] = useState<'chat' | 'history'>('chat');
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const messageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // --- Handlers ---
  const toggleDrawer = () => {
    const newState = !isDrawerOpen;
    setIsDrawerOpen(newState);
    onDrawerStateChange?.(newState);
  }

  const addMessageToHistory = (agentId: string, message: Message) => {
    setChatHistory(prev => {
      const agentSessions = prev[agentId] || [[]];
      const currentSessionIndex = activeChatIndex[agentId] ?? agentSessions.length - 1;
      const currentSession = agentSessions[currentSessionIndex] || [];
      const updatedSession = [...currentSession, message];
      const updatedSessions = [...agentSessions];
      updatedSessions[currentSessionIndex] = updatedSession;
      return { ...prev, [agentId]: updatedSessions };
    });
  };

  const handleNewChat = () => {
    if (!selectedAgents) return;
    const key = selectedAgents.join(',');
    const existingSessions = chatHistory[key] || [[]];
    const newSessions = [...existingSessions, []];
    setChatHistory(prev => ({ ...prev, [key]: newSessions }));
    setActiveChatIndex(prev => ({ ...prev, [key]: newSessions.length - 1 }));
    setAgentView('chat');
  }

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgents(prev => {
        const isSelected = prev.includes(agentId);
        if(isSelected) {
            return prev.filter(id => id !== agentId);
        } else {
            return [...prev, agentId];
        }
    });
    setAgentView('chat');
    // History logic will need to be re-evaluated for multi-agent chat
  }

  const handleSendMessage = () => {
    const content = messageInputRef.current?.value
    if (selectedAgents.length === 0 || !content || !content.trim()) return

    const key = selectedAgents.join(',');
    const newMessage: Message = {
      id: `${Date.now()}`,
      agentId: key,
      content: content,
      timestamp: new Date(),
      isUser: true
    }
    addMessageToHistory(key, newMessage);

    if (messageInputRef.current) {
      messageInputRef.current.value = ""
    }

    setTimeout(() => {
      const agentResponse: Message = {
        id: `${Date.now()}-agent`,
        agentId: key,
        content: `[GROUP] Signal received. Stand by.`,
        timestamp: new Date(),
        isUser: false
      }
      addMessageToHistory(key, agentResponse);
    }, 1200)

    setStagedFiles([]); // Clear files after sending
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

  const handleAttachmentMenuEnter = () => {
    if (attachmentMenuTimeoutRef.current) {
      clearTimeout(attachmentMenuTimeoutRef.current);
    }
    attachmentMenuTimeoutRef.current = setTimeout(() => {
      setIsAttachmentMenuOpen(true);
    }, 1000);
  };

  const handleAttachmentMenuLeave = () => {
    if (attachmentMenuTimeoutRef.current) {
      clearTimeout(attachmentMenuTimeoutRef.current);
    }
    attachmentMenuTimeoutRef.current = setTimeout(() => {
      setIsAttachmentMenuOpen(false);
    }, 300);
  };

  const removeStagedFile = (fileToRemove: File) => {
    setStagedFiles(prev => prev.filter(file => file !== fileToRemove));
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
  const currentAgentForNotification = agentsData.find(
    (agent) => agent.id === notifications[currentIndex]?.agentId
  )

  const renderAgentRoster = () => (
    <>
      <div className="p-3 border-b border-primary/50">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
          <input
            type="text"
            placeholder="Search callsign or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-black/50 text-primary placeholder:text-muted-foreground border border-primary/50 focus:border-primary focus:outline-none font-mono text-sm"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-1 flex flex-col h-full justify-around">
          {filteredAgents.map(agent => (
            <button
              key={agent.id}
              onClick={() => handleAgentSelect(agent.id)}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1 text-left hover:bg-white/5 rounded-sm transition-colors duration-150",
                selectedAgents.includes(agent.id) && "bg-primary/20"
              )}
            >
              <div className="w-5 h-5 flex items-center justify-center text-primary">{agent.icon}</div>
              <div className="flex-1">
                <p className="font-mono text-sm text-white">
                  <span className="text-white/60 mr-2">{agent.code}</span>
                  {agent.name.replace('_AGENT', '')}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  )

  const renderChatView = () => {
    const chatTitle = selectedAgents.map(id => tacticalAgents.find(a => a.id === id)?.code || '').join(' // ');
    const currentChatKey = selectedAgents.join(',');

    if (agentView === 'history') {
      const sessions = chatHistory[currentChatKey] || [];
      return (
        <div className="flex-1 flex flex-col">
          <div className="p-3 border-b border-primary/50 flex items-center justify-between">
            <button
              onClick={() => setAgentView('chat')}
              className="font-mono text-xs text-muted-foreground hover:text-foreground p-1 -ml-1"
            >
              &lt; BACK TO CHAT
            </button>
            <h3 className="font-mono text-sm text-white">History: {chatTitle}</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {sessions.map((session, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveChatIndex(prev => ({ ...prev, [currentChatKey]: index }));
                  setAgentView('chat');
                }}
                className="w-full text-left p-2 hover:bg-white/5 rounded-sm transition-colors flex items-start gap-3"
              >
                <MessageSquare className="w-4 h-4 text-primary/80 shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="font-mono text-xs text-white/80">
                    {session.length > 0
                      ? new Date(session[0].timestamp).toLocaleString()
                      : "Empty Chat"}
                  </p>
                  <p className="font-mono text-xs text-white/50 truncate">
                    {session[0]?.content || "..."}
                  </p>
                </div>
              </button>
            )).reverse()}
          </div>
        </div>
      )
    }

    const currentMessages = chatHistory[currentChatKey]?.[activeChatIndex[currentChatKey]] || []

    return (
      <div 
        className="flex-1 flex flex-col relative"
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
        <div className="p-3 border-b border-primary/50 flex items-center justify-between gap-2">
          <div className="flex-grow text-center">
            <p className="font-mono text-sm text-white">{chatTitle}</p>
            {selectedAgents.length === 1 && (
                <p className="font-mono text-xs text-muted-foreground">COMMS-LINK: {chatTitle}</p>
            )}
          </div>

          <div className="flex items-center">
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

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {currentMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.isUser ? "items-end" : "items-start"}`}
            >
              <div
                className={`
                  max-w-[85%] px-3 py-1.5
                  ${msg.isUser ? "bg-primary text-primary-foreground" : "bg-white/10 border border-primary/20"}
                `}
              >
                <p className="text-sm font-mono whitespace-pre-wrap text-white">{msg.content}</p>
              </div>
               <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
          ))}
        </div>
        
        {/* Message Input & Staged Files */}
        <div className="p-3 border-t border-primary/50 mt-auto">
          {/* Staged Files */}
          {stagedFiles.length > 0 && (
            <div className="mb-2 p-2 border border-primary/30 bg-black/30 space-y-2 max-h-28 overflow-y-auto">
              {stagedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                  <span className="truncate" title={file.name}>{file.name}</span>
                  <button onClick={() => removeStagedFile(file)} className="text-red-500 hover:text-red-400 ml-2">
                    <XCircle size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="relative">
            <input
              ref={messageInputRef}
              type="text"
              placeholder={`Message ${chatTitle}...`}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="w-full pr-12 pl-3 py-2 bg-black/50 text-white placeholder:text-white/40 border border-primary/50 focus:border-primary focus:outline-none font-mono text-sm"
            />
             <div 
              className="absolute right-1 top-1/2 -translate-y-1/2 flex items-end"
              onMouseLeave={handleAttachmentMenuLeave}
             >
                {/* Attachment Menu */}
                <div className={cn(
                  "flex flex-col-reverse items-center transition-all duration-300 ease-in-out",
                  isAttachmentMenuOpen ? "w-auto opacity-100" : "w-0 opacity-0"
                )}>
                    <Button
                        onClick={() => { /* TODO: Google Drive Logic */ }}
                        variant="ghost" size="icon" className="h-8 w-8 text-primary" title="Attach from Google Drive"
                    >
                        <Link2 className="w-5 h-5" />
                    </Button>
                     <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="ghost" size="icon" className="h-8 w-8 text-primary" title="Attach file"
                    >
                        <Paperclip className="w-5 h-5" />
                    </Button>
                </div>
                {/* Send Button */}
                <Button
                    onMouseEnter={handleAttachmentMenuEnter}
                    onClick={handleSendMessage}
                    variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/20"
                >
                    <Send className="w-5 h-5" />
                </Button>
                 <input
                    type="file" multiple ref={fileInputRef} onChange={handleFileSelect} className="hidden"
                />
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  const drawerComponent = isDrawerOpen && isClient ? createPortal(
    <div
      className="fixed top-0 right-0 h-full w-[500px] max-w-full bg-[#0A0A0A] border-l-2 border-primary/50 shadow-2xl flex flex-col z-50 font-mono"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Drawer Header */}
      <div className="p-4 border-b border-primary/50 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white tracking-widest">COMMS_TERMINAL</h2>
        <Button onClick={toggleDrawer} variant="ghost" size="icon" className="text-primary/60 hover:text-primary">
          <X className="w-6 h-6" />
        </Button>
      </div>
      {/* Drawer Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="w-[200px] border-r border-primary/50 flex flex-col">
          {renderAgentRoster()}
        </div>
        <div className="flex-1 flex flex-col">
          {selectedAgents.length > 0 ? renderChatView() : (
             <div className="flex-1 flex items-center justify-center">
                <p className="text-primary/40 font-mono text-center">
                  SELECT CALLSIGN TO INITIATE<br/>COMM-LINK.
                </p>
             </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  ) : null;


  return (
    <>
      <button onClick={toggleDrawer} className="relative w-12 h-12 flex items-center justify-center">
        {/* Base icon for shape and size */}
        <MessageSquare size={36} strokeWidth={1.5} className="scale-x-[-1] text-foreground" />
  
        {/* Agent Icon with Glitch Effect */}
        {notifications.length > 0 && currentAgentForNotification && (
          <div className={cn(
            "absolute w-6 h-6 flex items-center justify-center",
            isGlitching && "animate-glitch-in"
          )}>
             {React.isValidElement(currentAgentForNotification.icon) ? React.cloneElement(currentAgentForNotification.icon, { size: 18, className: 'text-foreground' }) : null}
          </div>
        )}
        
        {/* Notification Count Badge */}
        {notifications.length > 0 && (
          <div className="absolute top-0 right-0 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-background">
            {notifications.length}
          </div>
        )}
      </button>

      {drawerComponent}
    </>
  )
} 