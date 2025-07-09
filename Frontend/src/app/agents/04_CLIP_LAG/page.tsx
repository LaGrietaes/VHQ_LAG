"use client"

import { useState } from "react"
import { ClipMetrics } from "@/components/clip-metrics"
import { ProcessingQueue } from "@/components/processing-queue"
import { ReframeControls } from "@/components/reframe-controls"
import { UnifiedHeader } from "@/components/unified-header"
import { SettingsPanel } from "@/components/settings-panel"
import { ChatInterface } from "@/components/chat-interface"
import { AgentDock } from "@/components/agent-dock"

export default function ClipLAGPage() {
  const [showSettings, setShowSettings] = useState(false)
  const [showChat, setShowChat] = useState(false)

  return (
    <div className="min-h-screen bg-black text-white font-mono pb-20">
      {/* Unified Header */}
      <UnifiedHeader
        agentId="04_CLIP_LAG"
        onChatToggle={() => setShowChat(!showChat)}
        onSettingsToggle={() => setShowSettings(!showSettings)}
        showChat={showChat}
        showSettings={showSettings}
      />

      {/* Main Content */}
      <main className="p-6 space-y-6">
        {/* Metrics */}
        <ClipMetrics />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="lg:col-span-1">
            <ReframeControls />
          </div>

          {/* Processing Queue */}
          <div className="lg:col-span-2">
            <ProcessingQueue />
          </div>
        </div>
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
