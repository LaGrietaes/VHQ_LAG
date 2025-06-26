"use client"

import { useState } from "react"
import { agentsData } from "@/lib/dashboard-data"
import { UnifiedHeader } from "@/components/unified-header"
import { AgentDock } from "@/components/agent-dock"
import { ChatInterface } from "@/components/chat-interface"
import { SettingsPanel } from "@/components/settings-panel"
import { MediaOverview } from "@/components/media/media-overview"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Activity, HardDrive, FolderOpen, Archive, BarChart3 } from "lucide-react"

export default function MediaAgentPage() {
  const [showChat, setShowChat] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const agent = agentsData.find((a) => a.id === "05_MEDIA_LAG")

  if (!agent) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">MEDIA AGENT NOT FOUND</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono pb-20">
      {/* Unified Header */}
      <UnifiedHeader
        agentId="05_MEDIA_LAG"
        onChatToggle={() => setShowChat(!showChat)}
        onSettingsToggle={() => setShowSettings(!showSettings)}
        showChat={showChat}
        showSettings={showSettings}
      />

      {/* Agent Controls */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400 font-mono">MEDIA LIBRARY CONTROLS</div>
            <div className="flex space-x-2">
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white font-mono min-h-[36px]" disabled>
                <Play className="h-4 w-4 mr-1" />
                RUNNING
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-black font-mono min-h-[36px]"
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

          <div className="flex items-center space-x-4 text-xs text-gray-400 font-mono">
            <div>UPTIME: {agent.metrics?.uptime}</div>
            <div>FILES: {agent.metrics?.tasksCompleted}</div>
            <div>PERFORMANCE: {agent.metrics?.performance}%</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-800">
        <div className="flex space-x-0 p-6">
          {[
            { id: "overview", label: "OVERVIEW", icon: Activity },
            { id: "scanner", label: "SCANNER", icon: HardDrive },
            { id: "organizer", label: "ORGANIZER", icon: FolderOpen },
            { id: "archive", label: "ARCHIVE", icon: Archive },
            { id: "analytics", label: "ANALYTICS", icon: BarChart3 },
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
        {activeTab === "overview" && <MediaOverview />}

        {activeTab === "scanner" && (
          <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6">
            <h2 className="text-lg font-bold text-white font-mono mb-4">DRIVE SCANNER</h2>
            <div className="text-gray-400 font-mono">Scanner interface coming soon...</div>
          </div>
        )}

        {activeTab === "organizer" && (
          <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6">
            <h2 className="text-lg font-bold text-white font-mono mb-4">FILE ORGANIZER</h2>
            <div className="text-gray-400 font-mono">Organizer interface coming soon...</div>
          </div>
        )}

        {activeTab === "archive" && (
          <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6">
            <h2 className="text-lg font-bold text-white font-mono mb-4">ARCHIVE MANAGER</h2>
            <div className="text-gray-400 font-mono">Archive interface coming soon...</div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6">
            <h2 className="text-lg font-bold text-white font-mono mb-4">MEDIA ANALYTICS</h2>
            <div className="text-gray-400 font-mono">Analytics dashboard coming soon...</div>
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
