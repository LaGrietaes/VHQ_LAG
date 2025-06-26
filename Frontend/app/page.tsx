"use client"

import { useState, useEffect } from "react"
import { ProjectTimeline } from "@/components/project-timeline"
import { TodoList } from "@/components/todo-list"
import { CalendarWidget } from "@/components/calendar-widget"
import { AgentDock } from "@/components/agent-dock"
import { ChatInterface } from "@/components/chat-interface"
import { agentsData } from "@/lib/dashboard-data"
import { Activity, BarChart3, Zap, Settings } from "lucide-react"
import { SettingsPanel } from "@/components/settings-panel"
import { UnifiedHeader } from "@/components/unified-header"

export default function Dashboard() {
  const [showChat, setShowChat] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [theme, setTheme] = useState<"dark" | "light">("dark")

  useEffect(() => {
    // Load theme from localStorage
    const savedSettings = localStorage.getItem("vhq-settings")
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setTheme(settings.theme || "dark")

      // Apply theme to document
      const root = document.documentElement
      if (settings.theme === "light") {
        root.classList.add("light-theme")
        document.body.style.backgroundColor = "white"
        document.body.style.color = "black"
      }
    }

    // Listen for theme changes
    const handleSettingsChange = (event: CustomEvent) => {
      setTheme(event.detail.theme || "dark")
    }

    window.addEventListener("settings-changed", handleSettingsChange as EventListener)
    return () => window.removeEventListener("settings-changed", handleSettingsChange as EventListener)
  }, [])

  const operationalAgents = agentsData.filter((agent) => agent.status === "OPERATIONAL").length

  return (
    <div
      className={`min-h-screen font-mono transition-all duration-300 ${
        showChat ? "ml-16 mr-0" : "ml-16"
      } ${theme === "light" ? "bg-white text-black" : "bg-black text-white"}`}
    >
      {/* Unified Header */}
      <UnifiedHeader
        onChatToggle={() => setShowChat(!showChat)}
        onSettingsToggle={() => setShowSettings(!showSettings)}
        showChat={showChat}
        showSettings={showSettings}
      />

      {/* Main Dashboard */}
      <main className={`p-6 transition-all duration-300 ${showChat ? "pr-6" : "pr-6"}`}>
        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="h-4 w-4 text-red-600" />
              <span className="text-xs font-mono text-gray-400">SYSTEM LOAD</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono">23%</div>
            <div className="w-full bg-gray-800 h-1 mt-2">
              <div className="h-1 bg-red-600 w-1/4"></div>
            </div>
          </div>

          <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="h-4 w-4 text-green-400" />
              <span className="text-xs font-mono text-gray-400">ACTIVE AGENTS</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono">{operationalAgents}</div>
            <div className="text-xs text-green-400 font-mono">of {agentsData.length} total</div>
          </div>

          <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-mono text-gray-400">TASKS TODAY</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono">47</div>
            <div className="text-xs text-blue-400 font-mono">+12 from yesterday</div>
          </div>

          <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Settings className="h-4 w-4 text-yellow-400" />
              <span className="text-xs font-mono text-gray-400">UPTIME</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono">99.8%</div>
            <div className="text-xs text-yellow-400 font-mono">15d 4h 23m</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Timeline */}
          <div className="lg:col-span-2">
            <ProjectTimeline />
          </div>

          {/* Right Column - Calendar and Tasks */}
          <div className="space-y-6">
            <CalendarWidget />
            <TodoList />
          </div>
        </div>
      </main>

      {/* Chat Interface */}
      {showChat && <ChatInterface onClose={() => setShowChat(false)} />}

      {/* Agent Dock with Navigation */}
      <AgentDock />

      {/* Settings Panel */}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  )
}
