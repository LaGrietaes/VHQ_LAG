"use client"

import { useState, useEffect } from "react"
import { agentsData } from "@/lib/dashboard-data"
import { AgentDock } from "@/components/agent-dock"
import { ChatInterface } from "@/components/chat-interface"
import { Button } from "@/components/ui/button"
import { SettingsPanel } from "@/components/settings-panel"
import { UnifiedHeader } from "@/components/unified-header"
import { Activity, Play, Pause, RotateCcw, FileText, BarChart3, Clock, CheckCircle } from "lucide-react"

interface AgentPageProps {
  params: {
    id: string
  }
}

export default function AgentPage({ params }: AgentPageProps) {
  const [showChat, setShowChat] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [theme, setTheme] = useState<"dark" | "light">("dark")

  const agent = agentsData.find((a) => a.id === params.id)

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
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">AGENT NOT FOUND</h1>
          <a href="/" className="text-blue-400 hover:text-blue-300 font-mono">
            ← RETURN TO DASHBOARD
          </a>
        </div>
      </div>
    )
  }

  const mockLogs = [
    { timestamp: "2024-01-26 14:30:15", level: "INFO", message: "Task processing initiated" },
    { timestamp: "2024-01-26 14:29:45", level: "SUCCESS", message: "File optimization completed" },
    { timestamp: "2024-01-26 14:28:12", level: "WARNING", message: "High memory usage detected" },
    { timestamp: "2024-01-26 14:27:33", level: "INFO", message: "Connecting to external API" },
    { timestamp: "2024-01-26 14:26:58", level: "ERROR", message: "Network timeout on request #1247" },
  ]

  const mockTasks = [
    { id: 1, name: "Process media files", status: "completed", duration: "2.3s" },
    { id: 2, name: "Update database records", status: "running", duration: "45.2s" },
    { id: 3, name: "Generate reports", status: "queued", duration: "-" },
    { id: 4, name: "Backup system data", status: "failed", duration: "12.1s" },
  ]

  return (
    <div
      className={`min-h-screen font-mono pb-20 ${theme === "light" ? "bg-white text-black" : "bg-black text-white"}`}
    >
      {/* Unified Header */}
      <UnifiedHeader
        agentId={params.id}
        onChatToggle={() => setShowChat(!showChat)}
        onSettingsToggle={() => setShowSettings(!showSettings)}
        showChat={showChat}
        showSettings={showSettings}
      />

      {/* Agent Controls */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400 font-mono">AGENT CONTROLS</div>
            <div className="flex space-x-2">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white font-mono min-h-[36px]"
                disabled={agent.status === "OPERATIONAL"}
              >
                <Play className="h-4 w-4 mr-1" />
                START
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-black font-mono min-h-[36px]"
                disabled={agent.status !== "OPERATIONAL"}
              >
                <Pause className="h-4 w-4 mr-1" />
                PAUSE
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white font-mono min-h-[36px]"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                RESTART
              </Button>
            </div>
          </div>

          <div className="text-xs text-gray-400 font-mono">LAST ACTIVITY: {agent.metrics?.uptime || "N/A"}</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-800">
        <div className="flex space-x-0 p-6">
          {[
            { id: "overview", label: "OVERVIEW", icon: Activity },
            { id: "logs", label: "LOGS", icon: FileText },
            { id: "metrics", label: "METRICS", icon: BarChart3 },
            { id: "tasks", label: "TASKS", icon: CheckCircle },
          ].map((tab) => {
            const TabIcon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 px-4 py-2 font-mono text-sm transition-colors
                  ${activeTab === tab.id ? "text-red-400 border-b-2 border-red-600" : "text-gray-400 hover:text-white"}
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Agent Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6">
                <h2 className="text-lg font-bold text-white font-mono mb-4">AGENT INFORMATION</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-400 font-mono mb-1">ROLE</div>
                    <div className="text-sm text-white font-mono">{agent.role}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 font-mono mb-1">STATUS</div>
                    <div className="text-sm text-red-400 font-mono">{agent.status}</div>
                  </div>
                  {agent.metrics && (
                    <>
                      <div>
                        <div className="text-xs text-gray-400 font-mono mb-1">TASKS COMPLETED</div>
                        <div className="text-sm text-green-400 font-mono">{agent.metrics.tasksCompleted}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 font-mono mb-1">PERFORMANCE</div>
                        <div className="text-sm text-blue-400 font-mono">{agent.metrics.performance}%</div>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-6">
                  <div className="text-xs text-gray-400 font-mono mb-2">CAPABILITIES</div>
                  <div className="flex flex-wrap gap-2">
                    {agent.id === "00_CEO_LAG" &&
                      ["task_delegation", "monitoring", "reporting", "coordination"].map((capability) => (
                        <span key={capability} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 font-mono">
                          {capability.toUpperCase()}
                        </span>
                      ))}
                    {agent.id === "07_MEDIA_LAG" &&
                      ["file_organization", "duplicate_detection", "media_ingestion"].map((capability) => (
                        <span key={capability} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 font-mono">
                          {capability.toUpperCase()}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              {agent.metrics && (
                <>
                  <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="h-4 w-4 text-blue-400" />
                      <span className="text-xs font-mono text-gray-400">UPTIME</span>
                    </div>
                    <div className="text-xl font-bold text-white font-mono">{agent.metrics.uptime}</div>
                  </div>

                  <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <BarChart3 className="h-4 w-4 text-green-400" />
                      <span className="text-xs font-mono text-gray-400">PERFORMANCE</span>
                    </div>
                    <div className="text-xl font-bold text-white font-mono">{agent.metrics.performance}%</div>
                    <div className="w-full bg-gray-800 h-1 mt-2">
                      <div className="h-1 bg-green-600" style={{ width: `${agent.metrics.performance}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-red-400" />
                      <span className="text-xs font-mono text-gray-400">TASKS</span>
                    </div>
                    <div className="text-xl font-bold text-white font-mono">{agent.metrics.tasksCompleted}</div>
                    <div className="text-xs text-red-400 font-mono">completed</div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === "logs" && (
          <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6">
            <h2 className="text-lg font-bold text-white font-mono mb-4">SYSTEM LOGS</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {mockLogs.map((log, index) => (
                <div key={index} className="flex items-start space-x-4 text-xs font-mono">
                  <span className="text-gray-500 w-32">{log.timestamp}</span>
                  <span
                    className={`w-16 ${
                      log.level === "ERROR"
                        ? "text-red-400"
                        : log.level === "WARNING"
                          ? "text-yellow-400"
                          : log.level === "SUCCESS"
                            ? "text-green-400"
                            : "text-blue-400"
                    }`}
                  >
                    {log.level}
                  </span>
                  <span className="text-gray-300 flex-1">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6">
            <h2 className="text-lg font-bold text-white font-mono mb-4">CURRENT TASKS</h2>
            <div className="space-y-3">
              {mockTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-800 border border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        task.status === "completed"
                          ? "bg-green-500"
                          : task.status === "running"
                            ? "bg-blue-500 glitch-dot"
                            : task.status === "failed"
                              ? "bg-red-500"
                              : "bg-gray-500"
                      }`}
                    ></div>
                    <span className="text-sm font-mono text-white">{task.name}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs font-mono text-gray-400">{task.duration}</span>
                    <span
                      className={`text-xs font-mono px-2 py-1 ${
                        task.status === "completed"
                          ? "text-green-400"
                          : task.status === "running"
                            ? "text-blue-400"
                            : task.status === "failed"
                              ? "text-red-400"
                              : "text-gray-400"
                      }`}
                    >
                      {task.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "metrics" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6">
              <h3 className="text-sm font-bold text-gray-400 font-mono mb-4">CPU USAGE</h3>
              <div className="text-2xl font-bold text-white font-mono mb-2">34%</div>
              <div className="w-full bg-gray-800 h-2">
                <div className="h-2 bg-blue-600 w-1/3"></div>
              </div>
            </div>

            <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6">
              <h3 className="text-sm font-bold text-gray-400 font-mono mb-4">MEMORY USAGE</h3>
              <div className="text-2xl font-bold text-white font-mono mb-2">67%</div>
              <div className="w-full bg-gray-800 h-2">
                <div className="h-2 bg-yellow-600 w-2/3"></div>
              </div>
            </div>

            <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6">
              <h3 className="text-sm font-bold text-gray-400 font-mono mb-4">NETWORK I/O</h3>
              <div className="text-2xl font-bold text-white font-mono mb-2">12MB/s</div>
              <div className="w-full bg-gray-800 h-2">
                <div className="h-2 bg-green-600 w-1/4"></div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Chat Interface */}
      {showChat && <ChatInterface onClose={() => setShowChat(false)} />}

      {/* Settings Panel */}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}

      {/* Agent Dock */}
      <AgentDock />
    </div>
  )
}
