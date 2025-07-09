"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { agentsData } from "@/lib/dashboard-data"
import { AgentDock } from "@/components/agent-dock"
import { ChatInterface } from "@/components/chat-interface"
import { SettingsPanel } from "@/components/settings-panel"
import { UnifiedHeader } from "@/components/unified-header"
import { FinancialOverview } from "@/components/financial-overview"
import { TransactionHistory } from "@/components/transaction-history"
import { CryptoWallets } from "@/components/crypto-wallets"
import { Button } from "@/components/ui/button"
import {
  DollarSign,
  Play,
  Pause,
  RotateCcw,
  Activity,
  CreditCard,
  Wallet,
  BarChart3,
  Target,
  TrendingUp,
} from "lucide-react"

export default function CashAgentPage() {
  const [showChat, setShowChat] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [theme, setTheme] = useState<"dark" | "light">("dark")

  const agent = agentsData.find((a) => a.id === "07_CASH_LAG")

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
          <h1 className="text-2xl font-bold text-red-600 mb-4">CASH AGENT NOT FOUND</h1>
          <Link href="/" className="text-blue-400 hover:text-blue-300 font-mono">
            ← RETURN TO DASHBOARD
          </Link>
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
        agentId="07_CASH_LAG"
        onChatToggle={() => setShowChat(!showChat)}
        onSettingsToggle={() => setShowSettings(!showSettings)}
        showChat={showChat}
        showSettings={showSettings}
      />

      {/* Agent Controls */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400 font-mono">CASH AGENT CONTROLS</div>
            <div className="flex space-x-2">
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white font-mono min-h-[36px]">
                <Play className="h-4 w-4 mr-1" />
                ACTIVATE
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-black font-mono min-h-[36px]"
                disabled
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
                RESET
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs text-gray-400 font-mono">
            <div>SOURCES: 5 ACTIVE</div>
            <div>GOALS: 4 TRACKING</div>
            <div>ETA: Week 2</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-800">
        <div className="flex space-x-0 p-6">
          {[
            { id: "overview", label: "OVERVIEW", icon: Activity },
            { id: "transactions", label: "TRANSACTIONS", icon: CreditCard },
            { id: "crypto", label: "CRYPTO", icon: Wallet },
            { id: "goals", label: "GOALS", icon: Target },
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
        {activeTab === "overview" && (
          <div className="space-y-6">
            <FinancialOverview />

            {/* Agent Capabilities */}
            <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6">
              <h2 className="text-lg font-bold text-white font-mono mb-4">FINANCIAL AGENT CAPABILITIES</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-bold text-red-400 font-mono mb-3">TRANSACTION MANAGEMENT</h3>
                  <ul className="space-y-2 text-sm font-mono text-gray-300">
                    <li>• Multi-source transaction tracking</li>
                    <li>• Real-time balance monitoring</li>
                    <li>• Automated categorization</li>
                    <li>• Fraud detection and alerts</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-red-400 font-mono mb-3">CRYPTO OPERATIONS</h3>
                  <ul className="space-y-2 text-sm font-mono text-gray-300">
                    <li>• Multi-network wallet monitoring</li>
                    <li>• USD value conversion</li>
                    <li>• Donation tracking</li>
                    <li>• Portfolio analytics</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-red-400 font-mono mb-3">GOAL TRACKING</h3>
                  <ul className="space-y-2 text-sm font-mono text-gray-300">
                    <li>• Revenue target monitoring</li>
                    <li>• Progress visualization</li>
                    <li>• Deadline management</li>
                    <li>• Achievement notifications</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-red-400 font-mono mb-3">REPORTING & ANALYTICS</h3>
                  <ul className="space-y-2 text-sm font-mono text-gray-300">
                    <li>• Financial report generation</li>
                    <li>• Revenue trend analysis</li>
                    <li>• Source performance metrics</li>
                    <li>• Reinvestment calculations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "transactions" && <TransactionHistory />}
        {activeTab === "crypto" && <CryptoWallets />}
        {activeTab === "goals" && <FinancialOverview />}

        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-mono text-gray-400">REVENUE GROWTH</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">+23%</div>
                <div className="text-xs text-blue-400 font-mono">vs last month</div>
              </div>

              <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  <span className="text-xs font-mono text-gray-400">AVG TRANSACTION</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">€67.50</div>
                <div className="text-xs text-green-400 font-mono">per transaction</div>
              </div>

              <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Wallet className="h-4 w-4 text-purple-400" />
                  <span className="text-xs font-mono text-gray-400">CRYPTO GROWTH</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">+12%</div>
                <div className="text-xs text-purple-400 font-mono">portfolio value</div>
              </div>

              <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="h-4 w-4 text-red-400" />
                  <span className="text-xs font-mono text-gray-400">GOAL SUCCESS</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">75%</div>
                <div className="text-xs text-red-400 font-mono">completion rate</div>
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
