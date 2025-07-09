"use client"

import { useState, useEffect } from "react"
import { agentsData } from "@/lib/dashboard-data"
import { AgentDock } from "@/components/agent-dock"
import { ChatInterface } from "@/components/chat-interface"
import { SettingsPanel } from "@/components/settings-panel"
import { UnifiedHeader } from "@/components/unified-header"
import { Button } from "@/components/ui/button"
import {
  Activity,
  BarChart3,
  Cpu,
  HardDrive,
  Network,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Users,
  Zap,
} from "lucide-react"
import { useParams } from "next/navigation"
import Link from "next/link"

export default function AgentDetailPage() {
  const [showChat, setShowChat] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [theme, setTheme] = useState<"dark" | "light">("dark")

  const params = useParams()
  const agentId = params.id as string
  const agent = agentsData.find((a) => a.id === agentId)

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

  if (!agent) {
    return (
      <div className="min-h-screen bg-background text-foreground font-mono flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">AGENT NOT FOUND</h1>
          <Link href="/" className="text-primary hover:text-primary/80 font-mono">
            ← RETURN TO DASHBOARD
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen font-mono pb-20 ${theme === "light" ? "bg-background text-foreground" : "bg-background text-foreground"}`}
    >
      {/* Unified Header */}
      <UnifiedHeader
        agentId={agentId}
        onChatToggle={() => setShowChat(!showChat)}
        onSettingsToggle={() => setShowSettings(!showSettings)}
        showChat={showChat}
        showSettings={showSettings}
      />

      {/* Agent Controls */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground font-mono">AGENT CONTROLS</div>
            <div className="flex space-x-2">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono min-h-[36px]">
                <Play className="h-4 w-4 mr-1" />
                ACTIVATE
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-muted-foreground text-muted-foreground hover:bg-muted hover:text-foreground font-mono min-h-[36px]"
                disabled
              >
                <Pause className="h-4 w-4 mr-1" />
                PAUSE
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground font-mono min-h-[36px]"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                RESET
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs text-muted-foreground font-mono">
            <div>STATUS: {agent.status}</div>
            <div>PERFORMANCE: {agent.performance}%</div>
            <div>TASKS: {agent.tasks}</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-border">
        <div className="flex space-x-0 p-6">
          {[
            { id: "overview", label: "OVERVIEW", icon: Activity },
            { id: "metrics", label: "METRICS", icon: BarChart3 },
            { id: "logs", label: "LOGS", icon: Cpu },
            { id: "tasks", label: "TASKS", icon: Users },
          ].map((tab) => {
            const TabIcon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 px-4 py-2 font-mono text-sm transition-colors
                  ${activeTab === tab.id ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}
                `}
              >
                <TabIcon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <main className="p-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Agent Information */}
            <div className="bg-card border border-border p-6">
              <h2 className="text-lg font-bold text-card-foreground font-mono mb-4">AGENT INFORMATION</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground font-mono">NAME</div>
                  <div className="text-sm text-card-foreground font-mono">{agent.name}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground font-mono">ROLE</div>
                  <div className="text-sm text-card-foreground font-mono">{agent.role}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground font-mono">STATUS</div>
                  <div className="text-sm text-card-foreground font-mono">{agent.status}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground font-mono">ID</div>
                  <div className="text-sm text-card-foreground font-mono">{agent.id}</div>
                </div>
              </div>
            </div>

            {/* System Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border border-border p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-xs font-mono text-muted-foreground">PERFORMANCE</span>
                </div>
                <div className="text-xl font-bold text-card-foreground font-mono">{agent.performance}%</div>
                <div className="text-xs text-primary font-mono">efficiency score</div>
              </div>

              <div className="bg-card border border-border p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span className="text-xs font-mono text-muted-foreground">TASKS</span>
                </div>
                <div className="text-xl font-bold text-card-foreground font-mono">{agent.tasks}</div>
                <div className="text-xs text-primary font-mono">active tasks</div>
              </div>

              <div className="bg-card border border-border p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-xs font-mono text-muted-foreground">STATUS</span>
                </div>
                <div className="text-xl font-bold text-card-foreground font-mono">{agent.status}</div>
                <div className="text-xs text-primary font-mono">current state</div>
              </div>
            </div>

            {/* System Logs */}
            <div className="bg-card border border-border p-6">
              <h2 className="text-lg font-bold text-card-foreground font-mono mb-4">SYSTEM LOGS</h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <div className="flex items-center space-x-2 text-sm font-mono">
                  <span className="text-muted-foreground">2024-01-26 14:30:15</span>
                  <span className="text-card-foreground">Agent {agent.name} initialized successfully</span>
                  <span className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground">INFO</span>
                </div>
                <div className="flex items-center space-x-2 text-sm font-mono">
                  <span className="text-muted-foreground">2024-01-26 14:29:45</span>
                  <span className="text-card-foreground">Performance optimization completed</span>
                  <span className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground">SUCCESS</span>
                </div>
                <div className="flex items-center space-x-2 text-sm font-mono">
                  <span className="text-muted-foreground">2024-01-26 14:28:12</span>
                  <span className="text-card-foreground">Task queue processing</span>
                  <span className="text-xs px-2 py-1 rounded bg-yellow-500 text-white">WARNING</span>
                </div>
              </div>
            </div>

            {/* Current Tasks */}
            <div className="bg-card border border-border p-6">
              <h2 className="text-lg font-bold text-card-foreground font-mono mb-4">CURRENT TASKS</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted border border-border">
                  <div className="flex-1">
                    <div className="text-sm font-mono text-card-foreground">Process media files</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      Media processing • high priority
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground">
                      completed
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">100%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted border border-border">
                  <div className="flex-1">
                    <div className="text-sm font-mono text-card-foreground">Update database records</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      Data management • medium priority
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-2 py-1 rounded bg-yellow-500 text-white">
                      in-progress
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">75%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "metrics" && (
          <div className="space-y-6">
            <div className="bg-card border border-border p-6">
              <h2 className="text-lg font-bold text-card-foreground font-mono mb-4">PERFORMANCE METRICS</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border border-border p-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Cpu className="h-5 w-5 text-primary" />
                    <span className="text-sm font-mono text-muted-foreground">CPU USAGE</span>
                  </div>
                  <div className="text-2xl font-bold text-card-foreground font-mono mb-2">34%</div>
                  <div className="text-xs text-primary font-mono">optimal range</div>
                </div>

                <div className="bg-card border border-border p-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <HardDrive className="h-5 w-5 text-primary" />
                    <span className="text-sm font-mono text-muted-foreground">MEMORY USAGE</span>
                  </div>
                  <div className="text-2xl font-bold text-card-foreground font-mono mb-2">67%</div>
                  <div className="text-xs text-primary font-mono">within limits</div>
                </div>

                <div className="bg-card border border-border p-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Network className="h-5 w-5 text-primary" />
                    <span className="text-sm font-mono text-muted-foreground">NETWORK I/O</span>
                  </div>
                  <div className="text-2xl font-bold text-card-foreground font-mono mb-2">12MB/s</div>
                  <div className="text-xs text-primary font-mono">normal activity</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "logs" && (
          <div className="bg-card border border-border p-6">
            <h2 className="text-lg font-bold text-card-foreground font-mono mb-4">DETAILED LOGS</h2>
            <div className="text-center py-8 text-muted-foreground font-mono">Detailed logging interface coming soon...</div>
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="bg-card border border-border p-6">
            <h2 className="text-lg font-bold text-card-foreground font-mono mb-4">TASK MANAGEMENT</h2>
            <div className="text-center py-8 text-muted-foreground font-mono">Task management interface coming soon...</div>
          </div>
        )}
      </main>

      {/* Chat Interface */}
      {showChat && <ChatInterface isOpen={showChat} onClose={() => setShowChat(false)} />}

      {/* Settings Panel */}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}

      {/* Agent Dock */}
      <AgentDock />
    </div>
  )
}
