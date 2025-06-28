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
        return "text-gray-300 border-gray-300/30"
      case "WARNING":
        return "text-amber-400 border-amber-400/30"
      case "ERROR":
        return "text-red-500 border-red-500/30"
      case "INACTIVE":
        return "text-gray-600 border-gray-600/30"
      default:
        return "text-gray-600 border-gray-600/30"
    }
  }

  const getStatusBgClass = (status: Agent["status"]) => {
    switch (status) {
      case "OPERATIONAL":
        return "bg-green-400"
      case "WARNING":
        return "bg-yellow-400"
      case "ERROR":
        return "bg-red-400"
      case "INACTIVE":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className={`
      bg-card
      border border-border
      p-3 
      hover:border-primary/50
      transition-all duration-300
      flex flex-col
    `}>
      {/* Agent Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex-none flex items-center justify-center text-primary">
            {agent.icon}
          </div>
          <div>
            <span className="text-base font-bold text-foreground tracking-wider">{agent.name.replace("_AGENT", "")}</span>
            <div className="text-xs text-muted-foreground">{agent.role}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className={`text-xs px-2 py-0.5 border ${getStatusClass(agent.status)} bg-background`}>
            {agent.status}
          </div>
          <div className="text-xs text-muted-foreground">PRIO: {agent.priority}</div>
        </div>
      </div>
      
      {/* Description */}
      <p className="text-xs text-muted-foreground mb-3 h-8 flex-grow">{agent.description}</p>


      {/* Metrics */}
      <div className="space-y-2 mb-4">
        {agent.status === "OPERATIONAL" && (
          <>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">PERFORMANCE</span>
              <span className="text-foreground">{agent.performance}%</span>
            </div>
            <div className="w-full bg-primary/10 h-1">
              <div className="h-1 bg-primary" style={{ width: `${agent.performance}%` }}></div>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">TASKS</span>
              <span className="text-foreground">{agent.tasksCompleted}</span>
            </div>
          </>
        )}
      </div>

      {/* Capabilities */}
      <div className="mb-4">
        <div className="text-xs text-muted-foreground mb-1">CAPABILITIES</div>
        <div className="flex flex-wrap gap-1">
          {agent.capabilities.map((capability, index) => (
            <span key={index} className="text-xs bg-primary/10 text-primary/80 px-1.5 py-0.5">
              {capability.toUpperCase()}
            </span>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2 mt-auto">
        <Button
          variant="outline"
          className="flex-1"
        >
          LOGS
        </Button>
        <Button
          className="flex-1"
        >
          MANAGE
        </Button>
      </div>
    </div>
  )
}
