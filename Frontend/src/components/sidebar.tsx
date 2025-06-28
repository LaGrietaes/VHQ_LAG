"use client"

import { useState } from "react"
import { agentsData } from "@/lib/agents-data"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Link from "next/link"

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true)

  return (
    <aside
      className={`transition-all duration-300 ease-in-out bg-background border-r border-border flex flex-col ${
        isCollapsed ? "w-20" : "w-64"
      }`}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <div className="flex items-center justify-center p-6 border-b border-border h-24">
        {!isCollapsed && (
          <h2 className="font-bold text-lg">Agents</h2>
        )}
      </div>
      <nav className="flex-1 p-2 space-y-2 overflow-y-auto">
        <TooltipProvider>
          {agentsData.map((agent) => (
            <Link key={agent.id} href={`/agent/${agent.id}`} passHref>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <div
                    className={`flex items-center p-2 rounded-lg hover:bg-muted cursor-pointer ${
                      isCollapsed ? "justify-center" : "space-x-4"
                    } ${
                      agent.status === "OPERATIONAL" && agent.currentTasks > 0
                        ? "text-red-500"
                        : ""
                    }`}
                  >
                    {agent.icon}
                    {!isCollapsed && <span className="font-medium text-foreground">{agent.name}</span>}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="ml-2">
                  <div className="font-bold">{agent.name}</div>
                  <div>{agent.role}</div>
                  <div>Status: {agent.status}</div>
                </TooltipContent>
              </Tooltip>
            </Link>
          ))}
        </TooltipProvider>
      </nav>
    </aside>
  )
} 