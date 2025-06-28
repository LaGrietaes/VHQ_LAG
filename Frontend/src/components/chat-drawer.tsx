"use client"

import { useState, useMemo, useRef } from "react"
import { X, Send, Search, PlusSquare, History, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { agentsData } from "@/lib/agents-data"

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

export function ChatDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [chatHistory, setChatHistory] = useState<Record<string, Message[][]>>({})
  const [activeChatIndex, setActiveChatIndex] = useState<Record<string, number>>({})
  const [agentView, setAgentView] = useState<'chat' | 'history'>('chat');
  const messageInputRef = useRef<HTMLInputElement>(null)

  const toggleDrawer = () => setIsOpen(!isOpen)

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
    if (!selectedAgent) return;
    const existingSessions = chatHistory[selectedAgent] || [[]];
    const newSessions = [...existingSessions, []];
    setChatHistory(prev => ({ ...prev, [selectedAgent]: newSessions }));
    setActiveChatIndex(prev => ({ ...prev, [selectedAgent]: newSessions.length - 1 }));
    setAgentView('chat');
  }

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgent(agentId)
    setAgentView('chat');
    if (!chatHistory[agentId]) {
      setChatHistory(prev => ({ ...prev, [agentId]: [[]] }));
      setActiveChatIndex(prev => ({ ...prev, [agentId]: 0 }));
    } else {
      setActiveChatIndex(prev => ({ ...prev, [agentId]: chatHistory[agentId].length - 1 }));
    }
    setSearchQuery("") // Reset search on selection
  }

  const handleSendMessage = () => {
    const content = messageInputRef.current?.value
    if (!selectedAgent || !content || !content.trim()) return

    const newMessage: Message = {
      id: `${Date.now()}`,
      agentId: selectedAgent,
      content: content,
      timestamp: new Date(),
      isUser: true
    }
    addMessageToHistory(selectedAgent, newMessage);

    if (messageInputRef.current) {
      messageInputRef.current.value = ""
    }

    setTimeout(() => {
      const agent = tacticalAgents.find(a => a.id === selectedAgent)
      const agentResponse: Message = {
        id: `${Date.now()}-agent`,
        agentId: selectedAgent,
        content: `[${agent?.code}] Signal received. Stand by.`,
        timestamp: new Date(),
        isUser: false
      }
      addMessageToHistory(selectedAgent, agentResponse);
    }, 1200)
  }

  const filteredAgents = useMemo(() => {
    const query = searchQuery.toLowerCase()
    if (!query) return tacticalAgents
    return tacticalAgents.filter(agent => 
      agent.name.toLowerCase().includes(query) ||
      agent.code.includes(query)
    )
  }, [searchQuery])

  const ChatIcon = () => (
    <svg 
      width="24" height="24" viewBox="0 0 24 24" fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20 2H4C2.9 2 2 2.9 2 4V16C2 17.1 2.9 18 4 18H18L22 22V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
    </svg>
  )

  const AgentRoster = () => (
    <>
      <div className="p-3 border-b border-primary/20">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
          <input
            type="text"
            placeholder="Search callsign or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-black/50 text-primary placeholder:text-primary/30 border border-primary/20 focus:border-primary focus:outline-none font-mono text-sm"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-1 flex flex-col h-full justify-around">
          {filteredAgents.map(agent => (
            <button
              key={agent.id}
              onClick={() => handleAgentSelect(agent.id)}
              className="w-full flex items-center gap-2 px-2 py-1 text-left hover:bg-white/5 rounded-sm transition-colors duration-150"
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

  const ChatView = () => {
    const agent = tacticalAgents.find(a => a.id === selectedAgent)
    if (!agent) return null
    
    if (agentView === 'history') {
      const sessions = chatHistory[agent.id] || [];
      return (
        <div className="flex-1 flex flex-col">
          <div className="p-3 border-b border-primary/20 flex items-center justify-between">
            <button
              onClick={() => setAgentView('chat')}
              className="font-mono text-xs text-primary/60 hover:text-primary hover:bg-primary/10 p-1 -ml-1"
            >
              &lt; BACK TO CHAT
            </button>
            <h3 className="font-mono text-sm text-white">History: {agent.name.replace('_AGENT', '')}</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {sessions.map((session, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveChatIndex(prev => ({ ...prev, [agent.id]: index }));
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

    const currentMessages = chatHistory[agent.id]?.[activeChatIndex[agent.id]] || []

    return (
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-3 border-b border-primary/20 flex items-center justify-between gap-2">
          <button
            onClick={() => setSelectedAgent(null)}
            className="font-mono text-xs text-primary/60 hover:text-primary hover:bg-primary/10 p-1 -ml-1"
          >
            &lt; ROSTER
          </button>

          <div className="flex-grow text-center">
            <p className="font-mono text-sm text-white">{agent.name.replace('_AGENT', '')}</p>
            <p className="font-mono text-xs text-primary/50">COMMS-LINK: {agent.code}</p>
          </div>

          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNewChat}
              className="text-primary/60 hover:text-primary hover:bg-primary/10 h-8 w-8"
              title="New Chat"
            >
              <PlusSquare className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setAgentView('history')}
              className="text-primary/60 h-8 w-8"
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
               <p className="text-[10px] text-primary/40 mt-1 font-mono">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
          ))}
        </div>
        
        {/* Input */}
        <div className="p-3 border-t border-primary/20">
          <div className="flex gap-2">
            <input
              ref={messageInputRef}
              type="text"
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Transmit..."
              className="flex-1 bg-black/50 text-white px-3 py-1.5 border border-primary/20 placeholder:text-primary/60 focus:outline-none focus:border-primary font-mono text-sm"
              defaultValue=""
            />
            <Button 
              onClick={handleSendMessage}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={toggleDrawer}
        className={`
          fixed right-4 top-4 z-50 bg-black/80 text-primary
          p-2 shadow-lg transition-all duration-300 ease-in-out
          border border-primary/20 hover:border-primary
          ${isOpen ? "translate-x-[-360px]" : "translate-x-0"}
        `}
      >
        <ChatIcon />
      </button>

      <div
        className={`
          fixed right-0 top-0 h-full w-[360px] z-40
          bg-black/80 text-primary
          transform transition-transform duration-300 ease-in-out
          border-l border-primary/20 backdrop-blur-md
          flex flex-col font-mono
        `}
        style={{ display: isOpen ? 'flex' : 'none' }}
      >
        <div className="p-3 border-b border-primary/20 flex items-center justify-between">
          <h2 className="text-base font-medium tracking-wider text-primary">TACTICAL COMMS</h2>
          <Button 
            variant="ghost" size="icon" onClick={toggleDrawer}
            className="text-primary/60 hover:text-primary hover:bg-primary/10 h-8 w-8"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {!selectedAgent ? <AgentRoster /> : <ChatView />}
      </div>
    </>
  )
} 