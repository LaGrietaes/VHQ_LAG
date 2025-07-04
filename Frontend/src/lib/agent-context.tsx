"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { agentsData, Agent } from './agents-data'

interface AgentContextType {
  agentStates: Record<string, boolean>
  toggleAgent: (agentId: string, isActive: boolean) => Promise<void>
  getAgentStatus: (agentId: string) => boolean
  getOnlineAgentsCount: () => number
  getTotalAgentsCount: () => number
  isLoading: boolean
  refreshStatus: () => Promise<void>
}

const AgentContext = createContext<AgentContextType | undefined>(undefined)

export function AgentProvider({ children }: { children: ReactNode }) {
  const [agentStates, setAgentStates] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)

  const fetchAgentStatus = async () => {
    try {
      const response = await fetch('/api/agents/status')
      if (response.ok) {
        const data = await response.json()
        
        // Initialize agent states based on real backend status
        const states: Record<string, boolean> = {}
        agentsData.forEach(agent => {
          // Check if agent is in the running agents list from backend
          const isRunning = data.runningAgents?.includes(agent.id) || false
          states[agent.id] = isRunning
        })
        
        setAgentStates(states)
      } else {
        console.error('Failed to fetch agent status')
        // Fallback to static data
        const fallbackStates: Record<string, boolean> = {}
        agentsData.forEach(agent => {
          fallbackStates[agent.id] = agent.status === "OPERATIONAL"
        })
        setAgentStates(fallbackStates)
      }
    } catch (error) {
      console.error('Error fetching agent status:', error)
      // Fallback to static data
      const fallbackStates: Record<string, boolean> = {}
      agentsData.forEach(agent => {
        fallbackStates[agent.id] = agent.status === "OPERATIONAL"
      })
      setAgentStates(fallbackStates)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleAgent = async (agentId: string, isActive: boolean) => {
    try {
      const action = isActive ? 'start' : 'stop'
      const response = await fetch('/api/agents/control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agentId, action }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log(`Agent ${agentId} ${action} result:`, data)
        
        // Update local state optimistically
        setAgentStates(prev => ({
          ...prev,
          [agentId]: isActive
        }))
        
        // Refresh status after a short delay to get real state
        setTimeout(() => {
          fetchAgentStatus()
        }, 2000)
      } else {
        console.error(`Failed to ${action} agent ${agentId}`)
        // Revert the optimistic update
        setAgentStates(prev => ({
          ...prev,
          [agentId]: !isActive
        }))
      }
    } catch (error) {
      console.error(`Error ${isActive ? 'starting' : 'stopping'} agent ${agentId}:`, error)
      // Revert the optimistic update
      setAgentStates(prev => ({
        ...prev,
        [agentId]: !isActive
      }))
    }
  }

  const getAgentStatus = (agentId: string): boolean => {
    return agentStates[agentId] || false
  }

  const getOnlineAgentsCount = (): number => {
    return Object.values(agentStates).filter(Boolean).length
  }

  const getTotalAgentsCount = (): number => {
    return agentsData.length
  }

  const refreshStatus = async () => {
    setIsLoading(true)
    await fetchAgentStatus()
  }

  // Fetch initial status on mount
  useEffect(() => {
    fetchAgentStatus()
    
    // Set up periodic refresh every 30 seconds
    const interval = setInterval(fetchAgentStatus, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const value: AgentContextType = {
    agentStates,
    toggleAgent,
    getAgentStatus,
    getOnlineAgentsCount,
    getTotalAgentsCount,
    isLoading,
    refreshStatus
  }

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  )
}

export function useAgentContext() {
  const context = useContext(AgentContext)
  if (context === undefined) {
    throw new Error('useAgentContext must be used within an AgentProvider')
  }
  return context
} 