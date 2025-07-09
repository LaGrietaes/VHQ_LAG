"use client"

import { useState, useEffect } from "react"
import { agentsData } from "@/lib/dashboard-data"
import { TrendAnalysis } from "@/components/trend-analysis"
import { ViralHooks } from "@/components/viral-hooks"
import { AudienceInsights } from "@/components/audience-insights"
import { EngagementOptimization } from "@/components/engagement-optimization"
import { AgentDock } from "@/components/agent-dock"
import { ChatInterface } from "@/components/chat-interface"
import { SettingsPanel } from "@/components/settings-panel"
import { UnifiedHeader } from "@/components/unified-header"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Activity, Brain, Zap, Target, BarChart3 } from "lucide-react"

export default function PsicoAgentPage() {
  const [showChat, setShowChat] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [activeTab, setActiveTab] = useState("overview") // Declare activeTab variable

  const agent = agentsData.find((a) => a.id === "03_PSICO_LAG")

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
          <h1 className="text-2xl font-bold text-red-600 mb-4">PSICO AGENT NOT FOUND</h1>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen font-mono pb-20 ${theme === "light" ? "bg-white text-black" : "bg-black text-white"}`}
    >
      {/* Unified Header */}
      <UnifiedHeader
        title="PSICO AGENT - PSICOLOGÍA Y ENGAGEMENT"
        subtitle="Análisis psicológico de audiencia y optimización de engagement"
        icon={Brain}
        status="OPERATIONAL"
        agentId="03_PSICO_LAG"
        onChatToggle={() => setShowChat(!showChat)}
        onSettingsToggle={() => setShowSettings(!showSettings)}
        showChat={showChat}
        showSettings={showSettings}
      />

      {/* Agent Controls */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400 font-mono">PSYCHOLOGY AGENT CONTROLS</div>
            <div className="flex space-x-2">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white font-mono min-h-[36px]"
                disabled={agent.status === "OPERATIONAL"}
              >
                <Play className="h-4 w-4 mr-1" />
                {agent.status === "OPERATIONAL" ? "RUNNING" : "START"}
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

          <div className="text-xs text-gray-400 font-mono">
            UPTIME: {agent.metrics?.uptime} | PERFORMANCE: {agent.metrics?.performance}%
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-800">
        <div className="flex space-x-0 p-6">
          {[
            { id: "overview", label: "OVERVIEW", icon: Activity },
            { id: "trends", label: "TREND ANALYSIS", icon: Brain },
            { id: "hooks", label: "VIRAL HOOKS", icon: Zap },
            { id: "audience", label: "AUDIENCE INSIGHTS", icon: Target },
            { id: "optimization", label: "OPTIMIZATION", icon: BarChart3 },
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
          <div className="space-y-6">
            {/* Psychology Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Brain className="h-4 w-4 text-purple-400" />
                  <span className="text-xs font-mono text-gray-400">TRENDS ANALYZED</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">247</div>
                <div className="text-xs text-purple-400 font-mono">this week</div>
              </div>

              <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  <span className="text-xs font-mono text-gray-400">VIRAL HOOKS</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">89</div>
                <div className="text-xs text-yellow-400 font-mono">generated</div>
              </div>

              <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-mono text-gray-400">INSIGHTS</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">34</div>
                <div className="text-xs text-blue-400 font-mono">discovered</div>
              </div>

              <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-green-400" />
                  <span className="text-xs font-mono text-gray-400">SUCCESS RATE</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">87%</div>
                <div className="text-xs text-green-400 font-mono">prediction accuracy</div>
              </div>
            </div>

            {/* Psychology Agent Capabilities */}
            <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6">
              <h2 className="text-lg font-bold text-white font-mono mb-4">PSYCHOLOGY AGENT CAPABILITIES</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-bold text-red-400 font-mono mb-3">AUDIENCE PSYCHOLOGY</h3>
                  <ul className="space-y-2 text-sm font-mono text-gray-300">
                    <li>• Behavioral pattern analysis</li>
                    <li>• Emotional trigger identification</li>
                    <li>• Engagement prediction modeling</li>
                    <li>• Audience segmentation insights</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-red-400 font-mono mb-3">VIRAL CONTENT GENERATION</h3>
                  <ul className="space-y-2 text-sm font-mono text-gray-300">
                    <li>• Psychological hook generation</li>
                    <li>• Trend-based content optimization</li>
                    <li>• Platform-specific adaptations</li>
                    <li>• Success rate tracking</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "trends" && <TrendAnalysis />}
        {activeTab === "hooks" && <ViralHooks />}
        {activeTab === "audience" && <AudienceInsights />}
        {activeTab === "optimization" && <EngagementOptimization />}
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
