"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { agentsData } from "@/lib/agents-data"
import { useRouter } from "next/navigation"

export function AgentDock() {
  const [isExpanded, setIsExpanded] = useState(false)
  const router = useRouter()

  const handleAgentClick = (agentId: string) => {
    if (agentId === "00_CEO_LAG") {
      router.push("/")
    } else {
      router.push(`/agents/${agentId}`)
    }
  }

  return (
    <TooltipProvider>
      <div className="fixed left-0 top-0 h-full z-50 flex">
        {/* Main Dock */}
        <div
          className={`bg-gray-900/95 backdrop-blur-sm border-r border-gray-700 transition-all duration-300 ease-in-out ${
            isExpanded ? "w-64" : "w-16"
          } flex flex-col`}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              {isExpanded && (
                <div>
                  <h3 className="text-white font-semibold text-sm">VHQ Agents</h3>
                  <p className="text-gray-400 text-xs">Sistema de Agentes</p>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-400 hover:text-white hover:bg-gray-800 ml-auto"
              >
                {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Agents Grid */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className={`grid gap-2 ${isExpanded ? "grid-cols-2" : "grid-cols-1"}`}>
              {agentsData.map((agent) => {
                return (
                  <Tooltip key={agent.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className={`${
                          isExpanded ? "h-20 p-3" : "h-12 w-12 p-0"
                        } flex flex-col items-center justify-center text-white hover:bg-gray-800 border border-gray-700 hover:border-gray-600 transition-all duration-200`}
                        onClick={() => handleAgentClick(agent.id)}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <div
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: `${agent.color}20`, border: `1px solid ${agent.color}40` }}
                          >
                            <span className="h-4 w-4" style={{ color: agent.color }}>{agent.icon}</span>
                          </div>
                          {isExpanded && (
                            <div className="text-center">
                              <div className="text-xs font-medium text-white truncate w-full">{agent.name}</div>
                              <Badge
                                variant="outline"
                                className={`text-xs mt-1 ${
                                  agent.status === "OPERATIONAL"
                                    ? "border-green-500 text-green-400"
                                    : agent.status === "PLANNED"
                                      ? "border-yellow-500 text-yellow-400"
                                      : "border-gray-500 text-gray-400"
                                }`}
                              >
                                {agent.status === "OPERATIONAL"
                                  ? "OP"
                                  : agent.status === "PLANNED"
                                    ? "PLAN"
                                    : "OFF"}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <div className="space-y-2">
                        <div className="font-semibold">{agent.name}</div>
                        <div className="text-sm text-gray-300">{agent.role}</div>
                        <Badge
                          variant="outline"
                          className={
                            agent.status === "OPERATIONAL"
                              ? "border-green-500 text-green-400"
                              : agent.status === "PLANNED"
                                ? "border-yellow-500 text-yellow-400"
                                : "border-gray-500 text-gray-400"
                          }
                        >
                          {agent.status}
                        </Badge>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700">
            {isExpanded ? (
              <div className="text-center">
                <div className="text-xs text-gray-400">
                  {agentsData.filter((a) => a.status === "OPERATIONAL").length} / {agentsData.length} Activos
                </div>
                <div className="text-xs text-gray-500 mt-1">Sistema VHQ_LAG</div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
