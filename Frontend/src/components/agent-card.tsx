"use client"

import type { Agent } from "@/lib/agents-data"
import { Button } from "@/components/ui/button"
import { VHQCard, VHQCardHeader, VHQCardContent, VHQCardFooter } from "@/components/ui/vhq-card"

interface AgentCardProps {
  agent: Agent
}

export function AgentCard({ agent }: AgentCardProps) {
  const getStatusClass = (status: Agent["status"]) => {
    switch (status) {
      case "OPERATIONAL":
        return "text-foreground border-border"
      case "WARNING":
        return "text-orange-400 border-orange-400/30"
      case "ERROR":
        return "text-primary border-primary/30"
      case "INACTIVE":
        return "text-muted-foreground border-border/30"
      default:
        return "text-muted-foreground border-border/30"
    }
  }

  const getStatusBgClass = (status: Agent["status"]) => {
    switch (status) {
      case "OPERATIONAL":
        return "bg-green-500"
      case "WARNING":
        return "bg-orange-400"
      case "ERROR":
        return "bg-primary"
      case "INACTIVE":
        return "bg-muted"
      default:
        return "bg-muted"
    }
  }

  return (
    <VHQCard variant="interactive" className="flex flex-col h-full">
      <VHQCardHeader className="mb-0">
        {/* Agent Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex-none flex items-center justify-center text-primary">
              <span>{agent.icon}</span>
            </div>
            <div>
              <span className="text-base font-bold text-foreground tracking-wider">
                {agent.name.replace("_AGENT", "")}
              </span>
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
      </VHQCardHeader>
      
      <VHQCardContent className="flex-grow">
        {/* Description */}
        <p className="text-xs text-muted-foreground mb-3 h-8">{agent.description}</p>

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
        <div>
          <div className="text-xs text-muted-foreground mb-1">CAPABILITIES</div>
          <div className="flex flex-wrap gap-1">
            {agent.capabilities.map((capability, index) => (
              <span key={index} className="text-xs bg-primary/10 text-primary px-1.5 py-0.5">
                {capability.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      </VHQCardContent>

      <VHQCardFooter className="mt-auto pt-4 border-t-0">
        {/* Action Buttons */}
        <div className="flex space-x-2 w-full">
          <Button variant="outline" className="flex-1">
            LOGS
          </Button>
          <Button className="flex-1">
            MANAGE
          </Button>
        </div>
      </VHQCardFooter>
    </VHQCard>
  )
}
