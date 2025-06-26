"use client"

import type { Agent } from "@/lib/agents-data"
import { Button } from "@/components/ui/button"

interface AgentCardProps {
  agent: Agent
}

export function AgentCard({ agent }: AgentCardProps) {
  const getStatusClass = (status: Agent["status"]) => {
    switch (status) {
      case "OPERATIONAL":
        return "status-operational pulse-red"
      case "WARNING":
        return "status-warning"
      case "ERROR":
        return "status-error"
      case "INACTIVE":
        return "status-inactive"
      case "PLANNED":
        return "status-planned"
      default:
        return "status-inactive"
    }
  }

  const getStatusBgClass = (status: Agent["status"]) => {
    switch (status) {
      case "OPERATIONAL":
        return "bg-red-600"
      case "WARNING":
        return "bg-yellow-500"
      case "ERROR":
        return "bg-red-800"
      case "INACTIVE":
        return "bg-gray-600"
      case "PLANNED":
        return "bg-blue-600"
      default:
        return "bg-gray-600"
    }
  }

  return (
    <div
      className={`
      bg-gradient-to-b from-gray-900 to-black 
      border border-gray-800 
      p-4 
      hover:border-red-600 
      transition-all duration-300
      ${agent.status === "OPERATIONAL" ? "shadow-lg shadow-red-600/20" : ""}
      touch-manipulation
    `}
    >
      {/* Header del agente */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 ${getStatusBgClass(agent.status)} glitch-dot`}></div>
          <span className="text-sm font-bold text-white tracking-wide font-mono">{agent.name}</span>
        </div>
        <span className={`text-xs px-2 py-1 border ${getStatusClass(agent.status)} bg-black/50 font-mono`}>
          {agent.status}
        </span>
      </div>

      {/* Icono y rol */}
      <div className="flex items-center space-x-3 mb-3">
        <div className="text-2xl">{agent.icon}</div>
        <div>
          <div className="text-xs text-gray-400 font-mono">{agent.role}</div>
          <div className="text-xs text-red-400 font-mono">PRIORITY: {agent.priority}</div>
        </div>
      </div>

      {/* Métricas */}
      <div className="space-y-2 mb-4">
        {agent.status === "OPERATIONAL" && (
          <>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400 font-mono">UPTIME</span>
              <span className="text-white font-mono">{agent.uptime}</span>
            </div>
            <div className="w-full bg-gray-800 h-1 glitch-bar">
              <div className="h-1 bg-red-600" style={{ width: `${agent.performance}%` }}></div>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400 font-mono">TASKS</span>
              <span className="text-red-400 font-mono">{agent.tasksCompleted}</span>
            </div>
          </>
        )}

        {agent.status === "PLANNED" && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-400 font-mono">ETA</span>
            <span className="text-blue-400 font-mono">{agent.eta}</span>
          </div>
        )}

        {agent.metrics && (
          <div className="space-y-1">
            {agent.metrics.files_managed && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 font-mono">FILES</span>
                <span className="text-green-400 font-mono">{agent.metrics.files_managed.toLocaleString()}</span>
              </div>
            )}
            {agent.metrics.library_size_gb && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 font-mono">SIZE</span>
                <span className="text-green-400 font-mono">{agent.metrics.library_size_gb}GB</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Capacidades */}
      <div className="mb-4">
        <div className="text-xs text-gray-400 font-mono mb-1">CAPABILITIES</div>
        <div className="flex flex-wrap gap-1">
          {agent.capabilities.slice(0, 2).map((capability, index) => (
            <span key={index} className="text-xs bg-gray-800 text-gray-300 px-1 py-0.5 font-mono">
              {capability.toUpperCase()}
            </span>
          ))}
          {agent.capabilities.length > 2 && (
            <span className="text-xs text-gray-500 font-mono">+{agent.capabilities.length - 2}</span>
          )}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 bg-black border-gray-700 text-white text-xs hover:border-red-600 hover:text-red-400 transition-colors font-mono min-h-[44px]"
        >
          VIEW LOGS
        </Button>
        <Button
          size="sm"
          className="flex-1 bg-red-600 text-white text-xs hover:bg-red-700 transition-colors font-mono font-bold min-h-[44px]"
        >
          MANAGE
        </Button>
      </div>
    </div>
  )
}
