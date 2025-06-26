"use client"

import { useState, useRef, useEffect } from "react"
import { X, Send, Minimize2, Maximize2, MessageSquare } from "lucide-react"
import { agentsData } from "@/lib/dashboard-data"

interface Message {
  id: string
  agentId: string
  agentName: string
  content: string
  timestamp: Date
  type: "user" | "agent"
}

interface ChatInterfaceProps {
  onClose: () => void
}

export function ChatInterface({ onClose }: ChatInterfaceProps) {
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      agentId: "00_CEO_LAG",
      agentName: "00_CEO",
      content: "VHQ_LAG system initialized. Ready to receive instructions.",
      timestamp: new Date(),
      type: "agent",
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!inputMessage.trim() || selectedAgents.length === 0) return

    const userMessage: Message = {
      id: Date.now().toString(),
      agentId: "user",
      agentName: "User",
      content: inputMessage,
      timestamp: new Date(),
      type: "user",
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")

    // Simulate agent responses
    setTimeout(() => {
      selectedAgents.forEach((agentId, index) => {
        const agent = agentsData.find((a) => a.id === agentId)
        if (agent) {
          setTimeout(() => {
            const agentMessage: Message = {
              id: `${Date.now()}-${index}`,
              agentId: agent.id,
              agentName: agent.shortName,
              content: getAgentResponse(agent.id, inputMessage),
              timestamp: new Date(),
              type: "agent",
            }
            setMessages((prev) => [...prev, agentMessage])

            // Show notification popup
            showNotification(agent.shortName, agentMessage.content)
          }, index * 1000)
        }
      })
    }, 500)
  }

  const showNotification = (agentName: string, content: string) => {
    // Create notification element
    const notification = document.createElement("div")
    notification.className =
      "fixed top-4 right-4 bg-gray-900 border border-gray-700 rounded-lg p-3 max-w-sm z-[100] transform translate-x-full transition-transform duration-300"
    notification.innerHTML = `
      <div class="flex items-start space-x-2">
        <div class="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
        <div>
          <p class="text-white text-sm font-mono font-bold">${agentName}</p>
          <p class="text-gray-300 text-xs">${content.substring(0, 80)}${content.length > 80 ? "..." : ""}</p>
        </div>
      </div>
    `

    document.body.appendChild(notification)

    // Animate in
    setTimeout(() => {
      notification.style.transform = "translateX(0)"
    }, 100)

    // Remove after 4 seconds
    setTimeout(() => {
      notification.style.transform = "translateX(100%)"
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, 4000)
  }

  const getAgentResponse = (agentId: string, userMessage: string): string => {
    const responses: { [key: string]: string[] } = {
      "00_CEO_LAG": [
        "Task received and delegated to appropriate agents. Monitoring progress.",
        "Analyzing system metrics and optimizing workflow distribution.",
        "Coordinating cross-agent collaboration for maximum efficiency.",
      ],
      "01_SEO_LAG": [
        "Analyzing SEO opportunities for your request. Keyword research in progress.",
        "Optimizing content strategy based on current trends and competition.",
        "SEO recommendations ready. Implementing best practices.",
      ],
      "02_CM_LAG": [
        "Community engagement strategy activated. Monitoring social channels.",
        "Preparing automated responses and engagement campaigns.",
        "Social media optimization in progress. Audience analysis complete.",
      ],
      "03_PSICO_LAG": [
        "Psychological analysis of audience behavior initiated.",
        "Engagement prediction models running. Hook optimization ready.",
        "Behavioral insights generated. Storytelling recommendations available.",
      ],
      "04_CLIP_LAG": [
        "Video processing queue updated. Editing templates ready.",
        "Highlight detection algorithm running. Clips generation in progress.",
        "Video optimization complete. Short-form content ready for distribution.",
      ],
      "05_MEDIA_LAG": [
        "Media library organized. Duplicate detection complete.",
        "File ingestion successful. Quality optimization in progress.",
        "Distribution channels prepared. Media assets ready for deployment.",
      ],
      "06_TALENT_LAG": [
        "Talent coordination initiated. Scheduling optimization in progress.",
        "Collaboration opportunities identified. Contract templates ready.",
        "Performance analytics updated. Talent pipeline management active.",
      ],
    }

    const agentResponses = responses[agentId] || ["Processing your request..."]
    return agentResponses[Math.floor(Math.random() * agentResponses.length)]
  }

  const toggleAgentSelection = (agentId: string) => {
    setSelectedAgents((prev) => (prev.includes(agentId) ? prev.filter((id) => id !== agentId) : [...prev, agentId]))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPERATIONAL":
        return "bg-green-500"
      case "WARNING":
        return "bg-yellow-500"
      case "ERROR":
        return "bg-red-500"
      case "EN DESARROLLO":
        return "bg-blue-500"
      case "INACTIVE":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="fixed right-0 top-0 h-full w-1/2 bg-gray-900/95 backdrop-blur-sm border-l border-gray-700 z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900/90">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-red-500" />
          <h3 className="text-white font-mono font-bold">AGENT COMMUNICATION</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Agent Selection Grid */}
          <div className="p-4 border-b border-gray-700 bg-gray-800/50">
            <p className="text-gray-300 text-sm font-mono mb-3">SELECT AGENTS</p>
            <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto">
              {agentsData.map((agent) => {
                const IconComponent = agent.icon
                const isSelected = selectedAgents.includes(agent.id)
                return (
                  <button
                    key={agent.id}
                    onClick={() => toggleAgentSelection(agent.id)}
                    className={`relative p-2 rounded-lg transition-all duration-200 ${
                      isSelected ? "bg-gray-700 ring-2 ring-blue-500" : "bg-gray-800/50 hover:bg-gray-700/70"
                    }`}
                    title={`${agent.shortName} - ${agent.status}`}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center relative"
                        style={{ backgroundColor: agent.color }}
                      >
                        <IconComponent className="h-3 w-3 text-white" />
                        <div
                          className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full border border-gray-900 ${getStatusColor(
                            agent.status,
                          )}`}
                        />
                      </div>
                      <span className="text-xs text-gray-300 font-mono truncate w-full text-center">
                        {agent.shortName.split("_")[0]}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
            {selectedAgents.length > 0 && (
              <p className="text-blue-400 text-xs font-mono mt-2">
                {selectedAgents.length} agent{selectedAgents.length > 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => {
              const agent = agentsData.find((a) => a.id === message.agentId)
              return (
                <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-100 border border-gray-700"
                    }`}
                  >
                    {message.type === "agent" && (
                      <div className="flex items-center space-x-2 mb-1">
                        {agent && (
                          <div
                            className="w-4 h-4 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: agent.color }}
                          >
                            <agent.icon className="h-2 w-2 text-white" />
                          </div>
                        )}
                        <span className="text-xs font-mono text-gray-400">{message.agentName}</span>
                        <span className="text-xs text-gray-500">{message.timestamp.toLocaleTimeString()}</span>
                      </div>
                    )}
                    <p className="text-sm font-mono">{message.content}</p>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-700 bg-gray-900/90">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Select agents to communicate..."
                disabled={selectedAgents.length === 0}
                className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm font-mono placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || selectedAgents.length === 0}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
