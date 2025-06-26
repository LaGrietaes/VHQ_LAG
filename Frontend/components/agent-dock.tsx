"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { agentsData } from "@/lib/dashboard-data"
import { ChevronRight, ChevronLeft } from "lucide-react"

export function AgentDock() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [hovering, setHovering] = useState(false)
  const router = useRouter()

  const handleAgentClick = (agentId: string) => {
    if (agentId === "00_CEO_LAG") {
      router.push("/")
    } else {
      router.push(`/agents/${agentId}`)
    }
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
    <>
      {/* Vertical Left Dock */}
      <div
        className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ease-in-out ${
          isExpanded || hovering ? "w-64" : "w-16"
        } bg-black/95 backdrop-blur-sm border-r border-gray-800`}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className={`transition-opacity duration-300 ${isExpanded || hovering ? "opacity-100" : "opacity-0"}`}>
              <h3 className="text-white font-mono text-sm font-bold">VHQ AGENTS</h3>
              <p className="text-gray-400 text-xs">Sistema de Control</p>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="p-2 overflow-y-auto h-[calc(100vh-80px)]">
          <div className="space-y-2">
            {agentsData.map((agent) => {
              const IconComponent = agent.icon
              return (
                <div
                  key={agent.id}
                  onClick={() => handleAgentClick(agent.id)}
                  className={`relative group cursor-pointer transition-all duration-200 ${
                    isExpanded || hovering
                      ? "p-3 bg-gray-900/50 hover:bg-gray-800/70 rounded-lg"
                      : "p-2 hover:bg-gray-800/50 rounded-md mx-1"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {/* Agent Icon */}
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: agent.color }}
                      >
                        <IconComponent className="h-4 w-4 text-white" />
                      </div>
                      {/* Status Indicator */}
                      <div
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-black ${getStatusColor(
                          agent.status,
                        )}`}
                      />
                    </div>

                    {/* Agent Info */}
                    <div
                      className={`transition-all duration-300 ${
                        isExpanded || hovering ? "opacity-100 w-full" : "opacity-0 w-0 overflow-hidden"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm font-mono font-medium">{agent.shortName}</p>
                          <p className="text-gray-400 text-xs truncate">{agent.role}</p>
                        </div>
                        <div className="text-xs">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-mono ${
                              agent.status === "OPERATIONAL"
                                ? "bg-green-500/20 text-green-400"
                                : agent.status === "EN DESARROLLO"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : "bg-gray-500/20 text-gray-400"
                            }`}
                          >
                            {agent.status === "OPERATIONAL" ? "ON" : agent.status === "EN DESARROLLO" ? "DEV" : "OFF"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hover Tooltip for collapsed state */}
                  {!isExpanded && !hovering && (
                    <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {agent.shortName} - {agent.status}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* System Status Footer */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-3 border-t border-gray-800 bg-black/95 transition-opacity duration-300 ${
            isExpanded || hovering ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="text-xs text-gray-400 font-mono">
            <div className="flex justify-between">
              <span>ACTIVE:</span>
              <span className="text-green-400">{agentsData.filter((a) => a.status === "OPERATIONAL").length}/15</span>
            </div>
            <div className="flex justify-between">
              <span>SYSTEM:</span>
              <span className="text-green-400">99.7%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Collapse indicator when dock is hidden */}
      {!isExpanded && !hovering && (
        <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-40">
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-full p-2 animate-bounce">
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      )}
    </>
  )
}
