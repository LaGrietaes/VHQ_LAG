"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, X, Send, Search, Minimize2, Maximize2, Users, Bot } from "lucide-react"
import { agentsData } from "@/lib/dashboard-data"

interface Message {
  id: string
  content: string
  sender: "user" | "agent"
  agentId?: string
  timestamp: Date
}

interface ChatInterfaceProps {
  isOpen: boolean
  onClose: () => void
}

export function ChatInterface({ isOpen, onClose }: ChatInterfaceProps) {
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "VHQ_LAG system initialized. Ready to receive instructions.",
      sender: "agent",
      agentId: "00_CEO_LAG",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const filteredAgents = agentsData.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleAgentToggle = (agentId: string) => {
    setSelectedAgents((prev) => (prev.includes(agentId) ? prev.filter((id) => id !== agentId) : [...prev, agentId]))
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newMessage])
    setInputMessage("")

    // Simulate agent response
    setTimeout(() => {
      const responseAgentId = selectedAgents[0] || "00_CEO_LAG"
      const agent = agentsData.find((a) => a.id === responseAgentId)

      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `Message received and processed by ${agent?.shortName || "CEO"}. Analyzing request...`,
        sender: "agent",
        agentId: responseAgentId,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, agentResponse])
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed right-0 top-0 h-full w-1/2 bg-gray-900/98 backdrop-blur-sm border-l border-gray-700 z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-600/20 rounded-lg border border-red-600/30">
            <MessageSquare className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-white font-semibold">AGENT COMMUNICATION</h2>
            <p className="text-gray-400 text-sm">
              {selectedAgents.length > 0 ? `${selectedAgents.length} agents selected` : "Select agents to communicate"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Agent Selection */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-300 font-medium">SELECT AGENTS</span>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-gray-500"
              />
            </div>

            {/* Agents Grid */}
            <ScrollArea className="h-48">
              <div className="grid grid-cols-5 gap-2">
                {filteredAgents.map((agent) => {
                  const IconComponent = agent.icon
                  const isSelected = selectedAgents.includes(agent.id)

                  return (
                    <Button
                      key={agent.id}
                      variant="ghost"
                      className={`h-16 p-2 flex flex-col items-center justify-center border transition-all duration-200 ${
                        isSelected
                          ? "bg-gray-700 border-gray-500 text-white"
                          : "border-gray-700 text-gray-400 hover:bg-gray-800 hover:border-gray-600 hover:text-white"
                      }`}
                      onClick={() => handleAgentToggle(agent.id)}
                    >
                      <div className="p-1 rounded mb-1" style={{ backgroundColor: `${agent.color}20` }}>
                        <IconComponent className="h-3 w-3" style={{ color: agent.color }} />
                      </div>
                      <span className="text-xs font-medium truncate w-full text-center">{agent.shortName}</span>
                      <Badge
                        variant="outline"
                        className={`text-xs mt-1 ${
                          agent.status === "OPERATIONAL"
                            ? "border-green-500 text-green-400"
                            : agent.status === "EN DESARROLLO"
                              ? "border-yellow-500 text-yellow-400"
                              : "border-gray-500 text-gray-400"
                        }`}
                      >
                        {agent.status === "OPERATIONAL" ? "OP" : agent.status === "EN DESARROLLO" ? "DEV" : "PLAN"}
                      </Badge>
                    </Button>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Messages */}
          <div className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => {
                  const agent = message.agentId ? agentsData.find((a) => a.id === message.agentId) : null
                  const IconComponent = agent?.icon || Bot

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.sender === "agent" && agent && (
                        <div
                          className="p-2 rounded-lg border flex-shrink-0"
                          style={{
                            backgroundColor: `${agent.color}20`,
                            borderColor: `${agent.color}40`,
                          }}
                        >
                          <IconComponent className="h-4 w-4" style={{ color: agent.color }} />
                        </div>
                      )}

                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === "user"
                            ? "bg-red-600 text-white"
                            : "bg-gray-800 text-gray-100 border border-gray-700"
                        }`}
                      >
                        {message.sender === "agent" && agent && (
                          <div className="text-xs text-gray-400 mb-1">{agent.shortName}</div>
                        )}
                        <div className="text-sm">{message.content}</div>
                        <div className="text-xs text-gray-400 mt-1">{message.timestamp.toLocaleTimeString()}</div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex gap-2">
                <Input
                  placeholder="Select agents to communicate..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={selectedAgents.length === 0}
                  className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-gray-500"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || selectedAgents.length === 0}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
