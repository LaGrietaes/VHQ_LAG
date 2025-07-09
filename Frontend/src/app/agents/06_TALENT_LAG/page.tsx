"use client"

import { useState } from "react"
import { agentsData } from "@/lib/dashboard-data"
import { mockCollaborators, mockBoostPlans, talentMetrics } from "@/lib/talent-agent-data"
import { AddCollaboratorModal } from "@/components/add-collaborator-modal"
import { AgentDock } from "@/components/agent-dock"
import { ChatInterface } from "@/components/chat-interface"
import { UnifiedHeader } from "@/components/unified-header"
import { SettingsPanel } from "@/components/settings-panel"
import { Button } from "@/components/ui/button"
import {
  Play,
  Pause,
  RotateCcw,
  Users,
  TrendingUp,
  DollarSign,
  Star,
  Activity,
  BarChart3,
  UserPlus,
  Mail,
  Plus,
  Edit,
  Eye,
  Trash2,
} from "lucide-react"

export default function TalentAgentPage() {
  const [showChat, setShowChat] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [collaborators, setCollaborators] = useState(mockCollaborators)

  const agent = agentsData.find((a) => a.id === "06_TALENT_LAG")

  if (!agent) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">TALENT AGENT NOT FOUND</h1>
        </div>
      </div>
    )
  }

  const handleAddCollaborator = (newCollaborator: unknown) => {
    setCollaborators((prev) => [...prev, newCollaborator])
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-400 border-green-600"
      case "pending":
        return "text-yellow-400 border-yellow-600"
      case "completed":
        return "text-blue-400 border-blue-600"
      case "rejected":
        return "text-red-400 border-red-600"
      case "toxic":
        return "text-red-600 border-red-800"
      default:
        return "text-gray-400 border-gray-600"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "talent":
        return "text-purple-400"
      case "brand":
        return "text-blue-400"
      case "young_promise":
        return "text-green-400"
      default:
        return "text-gray-400"
    }
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono pb-20">
      {/* Unified Header */}
      <UnifiedHeader
        agentId="06_TALENT_LAG"
        onChatToggle={() => setShowChat(!showChat)}
        onSettingsToggle={() => setShowSettings(!showSettings)}
        showChat={showChat}
        showSettings={showSettings}
      />

      {/* Agent Controls */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400 font-mono">TALENT MANAGEMENT CONTROLS</div>
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
            <div>COLLABORATORS: {collaborators.length}</div>
            <div>ACTIVE: {collaborators.filter((c) => c.status === "active").length}</div>
            <div>ETA: Week 2</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-800">
        <div className="flex space-x-0 p-6">
          {[
            { id: "overview", label: "OVERVIEW", icon: Activity },
            { id: "collaborators", label: "COLLABORATORS", icon: Users },
            { id: "campaigns", label: "BOOST CAMPAIGNS", icon: TrendingUp },
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
            {/* Talent Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-4 w-4 text-purple-400" />
                  <span className="text-xs font-mono text-gray-400">TOTAL COLLABORATORS</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">{collaborators.length}</div>
                <div className="text-xs text-purple-400 font-mono">in database</div>
              </div>

              <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <UserPlus className="h-4 w-4 text-green-400" />
                  <span className="text-xs font-mono text-gray-400">ACTIVE</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">
                  {collaborators.filter((c) => c.status === "active").length}
                </div>
                <div className="text-xs text-green-400 font-mono">collaborating now</div>
              </div>

              <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="h-4 w-4 text-yellow-400" />
                  <span className="text-xs font-mono text-gray-400">BOOST BUDGET</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">€{talentMetrics.total_boost_budget}</div>
                <div className="text-xs text-yellow-400 font-mono">total allocated</div>
              </div>

              <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Star className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-mono text-gray-400">AVG SCORE</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">
                  {(collaborators.reduce((sum, c) => sum + (c.score?.total || 0), 0) / collaborators.length).toFixed(1)}
                </div>
                <div className="text-xs text-blue-400 font-mono">out of 40</div>
              </div>
            </div>

            {/* Agent Capabilities */}
            {/* <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6">
              <h2 className="text-lg font-bold text-white font-mono mb-4">TALENT MANAGEMENT CAPABILITIES</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-bold text-red-400 font-mono mb-3">COLLABORATOR CRM</h3>
                  <ul className="space-y-2 text-sm font-mono text-gray-300">
                    <li>• Talent, brand, and young promise management</li>
                    <li>• 4-criteria scoring system (40 points max)</li>
                    <li>• Social media profile integration</li>
                    <li>• Status tracking and workflow management</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-red-400 font-mono mb-3">BOOST CAMPAIGNS</h3>
                  <ul className="space-y-2 text-sm font-mono text-gray-300">
                    <li>• Instagram and YouTube advertising</li>
                    <li>• Budget allocation and tracking</li>
                    <li>• Performance metrics monitoring</li>
                    <li>• ROI analysis and reporting</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-red-400 font-mono mb-3">EMAIL AUTOMATION</h3>
                  <ul className="space-y-2 text-sm font-mono text-gray-300">
                    <li>• Initial confirmation emails</li>
                    <li>• Follow-up with performance stats</li>
                    <li>• Template-based communication</li>
                    <li>• Automated workflow triggers</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-red-400 font-mono mb-3">ANALYTICS & INSIGHTS</h3>
                  <ul className="space-y-2 text-sm font-mono text-gray-300">
                    <li>• Collaborator performance tracking</li>
                    <li>• Campaign effectiveness analysis</li>
                    <li>• Scoring trend analysis</li>
                    <li>• Revenue impact measurement</li>
                  </ul>
                </div>
              </div>
            </div> */}

            {/* Recent Activity */}
            <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-red-600" />
                  <h2 className="text-lg font-bold text-white font-mono">RECENT ACTIVITY</h2>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowAddModal(true)}
                  className="bg-red-600 hover:bg-red-700 text-white font-mono"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  ADD COLLABORATOR
                </Button>
              </div>

              <div className="space-y-3">
                {collaborators.slice(0, 3).map((collaborator) => (
                  <div key={collaborator.id} className="bg-gray-800 border border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-700 flex items-center justify-center text-white font-mono text-sm">
                          {collaborator.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-mono text-white font-bold">{collaborator.name}</div>
                          <div className="flex items-center space-x-2 text-xs font-mono">
                            <span className={getTypeColor(collaborator.type)}>{collaborator.type.toUpperCase()}</span>
                            <span className={`px-2 py-1 border ${getStatusColor(collaborator.status)}`}>
                              {collaborator.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-xs font-mono">
                        {collaborator.score && (
                          <div className="text-center">
                            <div className="text-white font-bold">{collaborator.score.total}/40</div>
                            <div className="text-gray-400">SCORE</div>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-400 p-1">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-green-400 p-1">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-yellow-400 p-1">
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "collaborators" && (
          <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-red-600" />
                <h2 className="text-lg font-bold text-white font-mono">COLLABORATOR DATABASE</h2>
              </div>
              <div className="flex items-center space-x-4">
                <select className="bg-gray-800 border border-gray-700 text-white text-xs font-mono px-3 py-1">
                  <option value="all">ALL TYPES</option>
                  <option value="talent">TALENT</option>
                  <option value="brand">BRAND</option>
                  <option value="young_promise">YOUNG PROMISE</option>
                </select>
                <Button
                  size="sm"
                  onClick={() => setShowAddModal(true)}
                  className="bg-red-600 hover:bg-red-700 text-white font-mono"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  NEW COLLABORATOR
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {collaborators.map((collaborator) => (
                <div key={collaborator.id} className="bg-gray-800 border border-gray-700 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-700 flex items-center justify-center text-white font-mono text-lg">
                        {collaborator.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-mono text-white font-bold">{collaborator.name}</div>
                        <div className="text-xs text-gray-400 font-mono">{collaborator.email}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs px-2 py-1 ${getTypeColor(collaborator.type)}`}>
                            {collaborator.type.toUpperCase()}
                          </span>
                          <span className={`text-xs px-2 py-1 border font-mono ${getStatusColor(collaborator.status)}`}>
                            {collaborator.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {collaborator.score && (
                        <div className="text-center">
                          <div className="text-lg font-bold text-white font-mono">{collaborator.score.total}</div>
                          <div className="text-xs text-gray-400 font-mono">TOTAL SCORE</div>
                          <div className="grid grid-cols-2 gap-1 mt-2 text-xs font-mono">
                            <div>V:{collaborator.score.views}</div>
                            <div>C:{collaborator.score.creativity}</div>
                            <div>A:{collaborator.score.altruism}</div>
                            <div>M:{collaborator.score.message}</div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-400">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-green-400">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-yellow-400">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {collaborator.comments && (
                    <div className="text-sm text-gray-300 font-mono bg-gray-900 p-3 border border-gray-700 mt-3">
                      {collaborator.comments}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3 text-xs text-gray-400 font-mono">
                    <div>CREATED: {new Date(collaborator.created_at).toLocaleDateString()}</div>
                    {collaborator.last_contact && (
                      <div>LAST CONTACT: {new Date(collaborator.last_contact).toLocaleDateString()}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "campaigns" && (
          <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-red-600" />
                <h2 className="text-lg font-bold text-white font-mono">BOOST CAMPAIGNS</h2>
              </div>
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-mono">
                <Plus className="h-4 w-4 mr-1" />
                NEW CAMPAIGN
              </Button>
            </div>

            <div className="space-y-4">
              {mockBoostPlans.map((plan) => {
                const collaborator = collaborators.find((c) => c.id === plan.collaborator_id)
                return (
                  <div key={plan.id} className="bg-gray-800 border border-gray-700 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <DollarSign className="h-5 w-5 text-green-400" />
                        <div>
                          <div className="text-sm font-mono text-white font-bold">
                            {collaborator?.name || "Unknown Collaborator"}
                          </div>
                          <div className="text-xs text-gray-400 font-mono">Campaign ID: {plan.id}</div>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 border font-mono ${
                            plan.status === "active"
                              ? "text-green-400 border-green-600"
                              : plan.status === "pending"
                                ? "text-yellow-400 border-yellow-600"
                                : "text-blue-400 border-blue-600"
                          }`}
                        >
                          {plan.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold text-white font-mono">€{plan.amount}</div>
                        <div className="text-xs text-gray-400 font-mono">TOTAL BUDGET</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="bg-gray-900 p-3 border border-gray-700">
                        <div className="text-xs text-gray-400 font-mono mb-1">INSTAGRAM</div>
                        <div className="text-sm font-bold text-white font-mono">€{plan.instagram_budget}</div>
                      </div>
                      <div className="bg-gray-900 p-3 border border-gray-700">
                        <div className="text-xs text-gray-400 font-mono mb-1">YOUTUBE</div>
                        <div className="text-sm font-bold text-white font-mono">€{plan.youtube_budget}</div>
                      </div>
                    </div>

                    {plan.results && (
                      <div className="grid grid-cols-3 gap-4 text-xs font-mono">
                        <div>
                          <span className="text-gray-400">IG REACH:</span>
                          <span className="text-blue-400 ml-1">{plan.results.instagram_reach?.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">YT VIEWS:</span>
                          <span className="text-red-400 ml-1">{plan.results.youtube_views?.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">ENGAGEMENT:</span>
                          <span className="text-green-400 ml-1">{plan.results.engagement_rate}%</span>
                        </div>
                      </div>
                    )}

                    {plan.start_date && plan.end_date && (
                      <div className="flex items-center justify-between mt-3 text-xs text-gray-400 font-mono">
                        <div>START: {new Date(plan.start_date).toLocaleDateString()}</div>
                        <div>END: {new Date(plan.end_date).toLocaleDateString()}</div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-mono text-gray-400">CONVERSION RATE</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">73%</div>
                <div className="text-xs text-blue-400 font-mono">pending to active</div>
              </div>

              <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-xs font-mono text-gray-400">AVG CAMPAIGN ROI</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">284%</div>
                <div className="text-xs text-green-400 font-mono">return on investment</div>
              </div>

              <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-xs font-mono text-gray-400">HIGH PERFORMERS</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">
                  {collaborators.filter((c) => c.score && c.score.total >= 30).length}
                </div>
                <div className="text-xs text-yellow-400 font-mono">score 30+ collaborators</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Collaborator Modal */}
      {showAddModal && <AddCollaboratorModal onClose={() => setShowAddModal(false)} onSave={handleAddCollaborator} />}

      {/* Chat Interface */}
      {showChat && <ChatInterface onClose={() => setShowChat(false)} />}

      {/* Settings Panel */}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}

      {/* Agent Dock */}
      <AgentDock />
    </div>
  )
}
