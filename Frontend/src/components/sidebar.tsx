"use client"

import { useState, useEffect } from "react"
import { agentsData, Agent } from "@/lib/agents-data"
import { useAgentContext } from "@/lib/agent-context"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { AgentPowerButton } from "@/components/ui/agent-power-button"
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog"
import { cn } from "@/lib/utils"
import Link from "next/link"

function RobotIcon({ active, loading }: { active: boolean, loading?: boolean }) {
  // SVG similar al que enviaste, con la antena iluminada si active
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="10" width="20" height="14" rx="3" fill="none" stroke="currentColor" />
      <circle cx="12" cy="18" r="2" fill="none" stroke="currentColor" />
      <circle cx="20" cy="18" r="2" fill="none" stroke="currentColor" />
      <rect x="2" y="14" width="4" height="6" rx="1" fill="none" stroke="currentColor" />
      <rect x="26" y="14" width="4" height="6" rx="1" fill="none" stroke="currentColor" />
      <circle cx="16" cy="6" r="2" fill={active ? '#22c55e' : '#aaa'} stroke={active ? '#22c55e' : '#aaa'}>
        {loading && <animate attributeName="fill" values="#22c55e;#fff;#22c55e" dur="1s" repeatCount="indefinite" />}
      </circle>
      <line x1="16" y1="8" x2="16" y2="10" stroke={active ? '#22c55e' : '#aaa'} />
    </svg>
  )
}

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [isWakingUp, setIsWakingUp] = useState<string | null>(null)
  const [ollamaActive, setOllamaActive] = useState(false)
  const [ollamaLoading, setOllamaLoading] = useState(false)
  const [ollamaError, setOllamaError] = useState<string | null>(null)
  
  const { agentStates, toggleAgent, getAgentStatus, isLoading } = useAgentContext()

  // Checar estado de Ollama al montar
  useEffect(() => {
    fetch('/api/ai/ollama-control')
      .then(res => res.json())
      .then(data => setOllamaActive(data.running))
      .catch(() => setOllamaActive(false))
  }, [])

  const handleSwitchToggle = async (agent: Agent, checked: boolean) => {
    if (checked) {
      // If turning on, show confirmation dialog
      setSelectedAgent(agent)
      setShowConfirmation(true)
    } else {
      // If turning off, directly update state
      setIsWakingUp(agent.id)
      try {
        await toggleAgent(agent.id, false)
      } finally {
        setIsWakingUp(null)
      }
    }
  }

  const handleConfirmWakeUp = async () => {
    if (selectedAgent) {
      setIsWakingUp(selectedAgent.id)
      try {
        await toggleAgent(selectedAgent.id, true)
        setShowConfirmation(false)
        setSelectedAgent(null)
      } finally {
        setIsWakingUp(null)
      }
    }
  }

  const handleCancelWakeUp = () => {
    setShowConfirmation(false)
    setSelectedAgent(null)
  }

  const getAgentStatusColor = (agent: Agent) => {
    const isActive = getAgentStatus(agent.id)
    if (isWakingUp === agent.id) return "text-yellow-400"
    if (isActive) return "text-primary"
    return "text-gray-400"
  }

  const handleOllamaClick = async () => {
    setOllamaLoading(true)
    setOllamaError(null)
    try {
      const res = await fetch('/api/ai/ollama-control', { method: 'POST' })
      const data = await res.json()
      if (data.started) {
        // Esperar y volver a checar
        setTimeout(async () => {
          const check = await fetch('/api/ai/ollama-control')
          const checkData = await check.json()
          setOllamaActive(checkData.running)
          setOllamaLoading(false)
        }, 2000)
      } else {
        setOllamaError(data.error || 'No se pudo iniciar Ollama')
        setOllamaLoading(false)
      }
    } catch (e: any) {
      setOllamaError(e?.message || 'Error al iniciar Ollama')
      setOllamaLoading(false)
    }
  }

  return (
    <TooltipProvider>
      <>
    <aside
      className={`transition-all duration-300 ease-in-out bg-background border-r border-border flex flex-col ${
        isCollapsed ? "w-20" : "w-64"
      }`}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
          <div className="flex items-center justify-center p-6 border-b border-border h-24 relative">
        {!isCollapsed && (
              <>
                <h2 className="font-bold text-lg">Agentes</h2>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleOllamaClick}
                        disabled={ollamaActive || ollamaLoading}
                        className="ml-2 p-1 rounded-full border border-transparent hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                        aria-label={ollamaActive ? 'Ollama activo' : 'Iniciar Ollama'}
                      >
                        <RobotIcon active={ollamaActive} loading={ollamaLoading} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="bg-gray-800 text-white border-gray-700 z-50">
                      {ollamaActive ? 'Ollama activo' : ollamaLoading ? 'Iniciando Ollama...' : 'Iniciar Ollama'}
                    </TooltipContent>
                  </Tooltip>
                  {ollamaError && <span className="text-xs text-red-500 ml-2">{ollamaError}</span>}
                </div>
              </>
        )}
      </div>
          <nav className="flex-1 p-2 space-y-0.7 overflow-y-auto">
        <TooltipProvider>
          {agentsData.map((agent) => (
                <div key={agent.id} className="relative group">
                  <div className={cn(
                    "flex items-center p-2 rounded-lg hover:bg-muted transition-colors h-10",
                    isCollapsed ? "justify-center" : ""
                  )}>
                    <Link href={`/agent/${agent.id}`} className={cn(
                      "flex items-center min-w-0 h-full",
                      isCollapsed ? "justify-center" : "flex-1 space-x-3"
                    )}>
                      <div className={cn("w-5 h-5 flex items-center justify-center", getAgentStatusColor(agent))}>
                        {agent.icon}
                      </div>
                      
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-foreground truncate block text-sm">{agent.name}</span>
                          {isWakingUp === agent.id && (
                            <div className="text-xs text-yellow-400 animate-pulse truncate">
                              Starting...
                            </div>
                          )}
                        </div>
                      )}
            </Link>
                    
                    {/* Power button for agent wake-up - only show when expanded */}
                    {!isCollapsed && (
                      <div className="ml-1 flex-shrink-0">
                        <AgentPowerButton
                          isActive={getAgentStatus(agent.id)}
                          isProcessing={isWakingUp === agent.id}
                          onClick={() => handleSwitchToggle(agent, !getAgentStatus(agent.id))}
                          disabled={isLoading}
                          label={getAgentStatus(agent.id) ? `Turn off ${agent.name}` : `Turn on ${agent.name}`}
                        />
                      </div>
                    )}
                  </div>
                </div>
          ))}
        </TooltipProvider>
      </nav>
    </aside>

        <ConfirmationDialog
          isOpen={showConfirmation}
          onCancel={handleCancelWakeUp}
          onConfirm={handleConfirmWakeUp}
          title="Start Agent"
          message={`Are you sure you want to start ${selectedAgent?.name}?\n\nThis will launch the agent process and make it available for tasks.`}
          confirmText="Start"
          cancelText="Cancel"
          confirmVariant="default"
        />
      </>
    </TooltipProvider>
  )
} 