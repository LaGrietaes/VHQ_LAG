"use client"

import { useState, useEffect } from "react"
import { ThemeAwareLogo } from "./theme-aware-logo"
import { SystemMonitor } from "./system-monitor"
import { Button } from "@/components/ui/button"
import { Settings, Bell, MessageSquare } from "lucide-react"
import { agentsData } from "@/lib/dashboard-data"
import Link from "next/link"

interface UnifiedHeaderProps {
  agentId?: string
  onChatToggle?: () => void
  onSettingsToggle?: () => void
  showChat?: boolean
  showSettings?: boolean
}

export function UnifiedHeader({
  agentId,
  onChatToggle,
  onSettingsToggle,
  showChat = false,
  showSettings = false,
}: UnifiedHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [notifications] = useState(3)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Get agent data if we're on an agent page
  const agent = agentId ? agentsData.find((a) => a.id === agentId) : null
  const IconComponent = agent?.icon

  // Determine title and subtitle based on context
  const getTitle = () => {
    if (agent) {
      return `${agent.shortName || agent.name}<span class="text-red-600">.</span>AGENT`
    }
    return `VHQ_LAG<span class="text-red-600">.</span>SYSTEM`
  }

  const getSubtitle = () => {
    if (agent) {
      return agent.role
    }
    return "Virtual Head Quarters"
  }

  const getAccentColor = () => {
    if (agent) {
      return agent.color || "#ef4444" // red-600 as fallback
    }
    return "#ef4444" // red-600
  }

  return (
    <header className="border-b border-gray-800 bg-gradient-to-r from-black to-gray-900 sticky top-0 z-50">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          {/* Logo - Clickable to home */}
          <Link href="/" className="cursor-pointer">
            <ThemeAwareLogo className="h-8 w-auto hover:opacity-80 transition-opacity" size="small" />
          </Link>

          {/* Agent Icon (if on agent page) */}
          {IconComponent && (
            <>
              <div className="w-px h-6 bg-gray-700"></div>
              <IconComponent className="h-6 w-6" style={{ color: getAccentColor() }} />
            </>
          )}

          {/* Title and Subtitle */}
          <div>
            <h1
              className="text-xl font-bold tracking-wider hover-glitch"
              dangerouslySetInnerHTML={{ __html: getTitle() }}
            />
            <div className="text-xs text-gray-400">{getSubtitle()}</div>
          </div>

          {/* Status Badge (for agents) */}
          {agent && (
            <span
              className={`text-xs px-2 py-1 border font-mono ${
                agent.status === "OPERATIONAL" ? "status-operational" : "status-planned"
              }`}
            >
              {agent.status}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* System Monitor */}
          <SystemMonitor />

          {/* Time */}
          <div className="text-xs text-gray-400 font-mono">{currentTime.toLocaleTimeString()}</div>

          {/* Chat Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onChatToggle}
            className={`min-h-[44px] min-w-[44px] ${showChat ? "text-red-400" : "text-gray-400 hover:text-red-400"}`}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-400 min-h-[44px] min-w-[44px]">
              <Bell className="h-4 w-4" />
            </Button>
            {notifications > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-mono pulse-red">
                {notifications}
              </div>
            )}
          </div>

          {/* Settings */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onSettingsToggle}
            className={`min-h-[44px] min-w-[44px] ${
              showSettings ? "text-red-400" : "text-gray-400 hover:text-red-400"
            }`}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
